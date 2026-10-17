// HTML のシーンを 1 フレームずつ撮影して MP4 を作る
// 使い方: NODE_PATH=$(npm root -g) node video/render.mjs [fps]
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright'); // NODE_PATH でも解決できるよう require を使う
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const fps = Number(process.argv[2] || 30);
const out = path.join(dir, 'claude-code-subagents-skills.mp4');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.goto('file://' + path.join(dir, 'scenes.html'));
await page.evaluate(() => document.fonts.ready);
const total = await page.evaluate(() => window.TOTAL);
const frames = Math.round(total * fps);

const ff = spawn('ffmpeg', ['-y', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-',
  '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-movflags', '+faststart', out],
  { stdio: ['pipe', 'ignore', 'inherit'] });

for (let f = 0; f < frames; f++) {
  await page.evaluate((t) => window.renderAt(t), f / fps);
  const buf = await page.screenshot({ type: 'jpeg', quality: 92 });
  if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
  if (f % (fps * 10) === 0) console.log(`${(f / fps).toFixed(0)}s / ${total}s`);
}
ff.stdin.end();
await new Promise((r) => ff.on('close', r));
await browser.close();
console.log('done:', out);
