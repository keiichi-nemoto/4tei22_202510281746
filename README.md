# Henkel Dashboard (Vite + React + Tailwind + Recharts)

このリポジトリは、与えられた React コンポーネント（ヘンケル面接内容ダッシュボード）をローカルで実行するための最小構成を追加しました。

準備と起動方法（ローカル環境で実行してください）:

1. 依存関係をインストール

```bash
npm install
```

2. 開発サーバーを起動

```bash
# Henkel Dashboard (Vite + React + Tailwind + Recharts)

このリポジトリは、与えられた React コンポーネント（ヘンケル面接内容ダッシュボード）をローカルで実行するための最小構成を追加したものです。

## ローカルでの実行方法

1. 依存関係をインストール

```bash
npm install
```

2. 開発サーバーを起動

```bash
npm run dev -- --host
```

3. ブラウザで `http://localhost:5173` を開く

プロダクションビルド

```bash
npm run build
```

生成物は `dist/` に配置されます。

## Netlify 自動デプロイ（GitHub Actions 経由）

リポジトリには `netlify.toml` と GitHub Actions ワークフロー（`.github/workflows/netlify-deploy.yml`）を追加済みです。workflow は `main` ブランチへの push 時にビルドを行い、`NETLIFY_AUTH_TOKEN` と `NETLIFY_SITE_ID` が GitHub Secrets に登録されていれば Netlify にデプロイします。

セットアップ手順:

1. Netlify にログインして新しいサイトを作成するか既存サイトの Site ID を取得します（Site settings > Site information）。
2. Netlify の Personal Access Token を作成します（User settings > Applications > Personal access tokens）。
3. GitHub リポジトリの `Settings > Secrets > Actions` に以下を追加します：
	- `NETLIFY_AUTH_TOKEN` = Netlify の Personal Access Token
	- `NETLIFY_SITE_ID` = Netlify サイトの Site ID
4. `main` ブランチへ push すると、ワークフローが実行され `dist/` を Netlify にデプロイします。

注意:
- Secrets が設定されていない場合、workflow の deploy ステップはスキップされます（ログにメッセージが出ます）。
- 手動で CLI からデプロイしたい場合は `netlify-cli` を使い、ローカルで `netlify deploy --dir=dist --prod --site=<SITE_ID>` を実行できます（`NETLIFY_AUTH_TOKEN` を環境変数に設定してください）。

## 次の改善案（オプション）
- コンポーネントのユニットテスト（Jest / Testing Library）追加
- バンドル分割（dynamic import）で初期ロードを小さくする
- CI ワークフローの改善（プレビュー環境の自動作成など）

問題や追加希望があれば教えてください。