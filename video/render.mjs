// HTML のシーンを 1 フレームずつ撮影して MP4 を作る
// 使い方: NODE_PATH=$(npm root -g) node video/render.mjs [fps]
// video/audio/s01.mp3 〜 sNN.mp3 がそろっていれば、ナレーション付きで書き出す
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright'); // NODE_PATH でも解決できるよう require を使う
import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const fps = Number(process.argv[2] || 30);
const out = path.join(dir, 'claude-code-subagents-skills.mp4');
const silent = path.join(dir, '.video-only.mp4');
const LEAD = 0.6; // シーン開始から話し始めるまで
const TAIL = 1.0; // 話し終わってから次のシーンまで

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.goto('file://' + path.join(dir, 'scenes.html'));
await page.evaluate(() => document.fonts.ready);

const sceneCount = await page.evaluate(() => document.querySelectorAll('.scene').length);
const audioFiles = Array.from({ length: sceneCount }, (_, i) =>
  path.join(dir, 'audio', `s${String(i + 1).padStart(2, '0')}.mp3`));
const withAudio = audioFiles.every((f) => fs.existsSync(f));
let starts = [];
if (withAudio) {
  const lens = audioFiles.map((f) => Number(execFileSync('ffprobe',
    ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString()));
  const { durs } = await page.evaluate(([l, a, b]) => window.applyTiming(l, a, b), [lens, LEAD, TAIL]);
  let acc = 0;
  starts = durs.map((d) => { const s = acc; acc += d; return s; });
  console.log('ナレーションあり:', durs.map((d) => d.toFixed(1)).join(', '));
} else {
  console.log('音声ファイルがそろっていないので、無音で書き出します');
}
const total = await page.evaluate(() => window.TOTAL);
const frames = Math.round(total * fps);

const ff = spawn('ffmpeg', ['-y', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-',
  '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', withAudio ? silent : out],
  { stdio: ['pipe', 'ignore', 'inherit'] });

for (let f = 0; f < frames; f++) {
  await page.evaluate((t) => window.renderAt(t), f / fps);
  const buf = await page.screenshot({ type: 'jpeg', quality: 92 });
  if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
  if (f % (fps * 10) === 0) console.log(`${(f / fps).toFixed(0)}s / ${total.toFixed(0)}s`);
}
ff.stdin.end();
await new Promise((r) => ff.on('close', r));
await browser.close();

if (withAudio) {
  // 各シーンの音声を開始位置にずらして重ね、映像と合わせる
  const inputs = audioFiles.flatMap((f) => ['-i', f]);
  const delays = audioFiles.map((_, i) => {
    const ms = Math.round((starts[i] + LEAD) * 1000);
    return `[${i + 1}:a]adelay=${ms}|${ms}[a${i}]`;
  });
  const mix = `${audioFiles.map((_, i) => `[a${i}]`).join('')}amix=inputs=${audioFiles.length}:normalize=0[aout]`;
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', silent, ...inputs,
    '-filter_complex', [...delays, mix].join(';'),
    '-map', '0:v', '-map', '[aout]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k',
    '-t', String(total), '-movflags', '+faststart', out], { stdio: 'inherit' });
  fs.unlinkSync(silent);
}
console.log('done:', out);
