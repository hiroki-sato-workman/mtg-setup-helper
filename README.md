# 面談・ミーティング調整ツール (MTG Setup Helper)

複数の人との面談日程を効率的に調整し、重複を防ぐためのReactアプリケーションです。React Router v7を使用して構築されています。

## 主な機能

- 📅 面談者の登録と希望日程の管理
- ⏰ 時間帯重複の検出とアラート表示
- ✅ 面談確定機能（詳細時刻設定）
- 📋 スケジュールサマリー表示
- 📱 モバイル対応のレスポンシブデザイン
- 🌙 ダークモード対応
- 🔒 プライバシーモード（面談者情報の匿名化）
- 📁 .icsファイルのインポート/エクスポート
- 💾 ローカルストレージでのデータ永続化
- 📝 面談結果・メモ機能

## 始め方

### インストール

依存関係をインストール：

```bash
npm install
```

### 開発

HMR付きの開発サーバーを起動：

```bash
npm run dev
```

アプリケーションは `http://localhost:5173` で利用可能になります。

## 本番環境用ビルド

本番環境用ビルドを作成：

```bash
npm run build
```

## デプロイメント

### GitHub Pages (自動デプロイ)

このプロジェクトは、`main`ブランチにマージされたコードが自動的にGitHub Pagesにデプロイされるように設定されています。

#### 自動デプロイの仕組み

1. `main`ブランチへのpushまたはマージ
2. GitHub Actionsが自動実行
3. テスト・タイプチェック・ビルドを実行
4. GitHub Pagesにデプロイ

#### GitHub Pages設定

- SPAモード (`ssr: false`) で設定済み
- 404.htmlリダイレクトでクライアントサイドルーティングをサポート
- `.nojekyll`ファイルでJekyll処理を無効化

#### 手動ビルド（GitHub Pages用）

```bash
npm run build:pages
mkdir -p docs
cp -r build/client/* docs/
cp docs/index.html docs/404.html
touch docs/.nojekyll
```

手動デプロイの場合は、GitHubリポジトリの設定で「Source」を「Deploy from a branch」に設定し、「main」ブランチの「/ (root)」ではなく「/docs」フォルダを選択してください。

### Dockerデプロイメント

Dockerを使用してビルドと実行：

```bash
docker build -t mtg-setup-helper .

# コンテナを実行
docker run -p 3000:3000 mtg-setup-helper
```

### 独自デプロイメント

Nodeアプリケーションのデプロイに慣れている場合、内蔵のアプリサーバーは本番環境対応です。

`npm run build` の出力をデプロイしてください：

```
├── package.json
├── package-lock.json (または pnpm-lock.yaml、bun.lockb)
├── build/
│   ├── client/    # 静的アセット
│   └── server/    # サーバーサイドコード
```

## 技術スタック

- **フレームワーク**: React Router (SPA mode)
- **スタイリング**: TailwindCSS
- **言語**: TypeScript
- **ビルドツール**: Vite
- **テスト**: Vitest + Testing Library
- **デプロイ**: GitHub Pages + GitHub Actions
- **アイコン**: Lucide React

## 開発

### テスト実行

```bash
# 単体テスト
npm test

# カバレッジ付きテスト  
npm run test:coverage
```

### 型チェック

```bash
npm run typecheck
```
