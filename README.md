# liver-streams

VTuber の配信情報を一覧表示するウェブアプリケーション。にじさんじとホロライブの配信スケジュールを統合し、リアルタイムで確認できます。

🔗 **[liver-streams.vercel.app](https://liver-streams.vercel.app)**

<img width="2048" height="1199" alt="liver-streams-git-main-miyaokamiyaos-projects vercel app_" src="https://github.com/user-attachments/assets/b42388bf-5abd-4d4a-b809-d7528a8834c7" />


## 機能

- **配信スケジュール一覧** - にじさんじ・ホロライブの配信予定を日付・時間ごとに表示
- **リアルタイム更新** - 1分ごとに自動でスケジュールを再取得
- **検索・フィルター** - タレント名やキーワードで絞り込み、ライブ中の配信のみ表示
- **チャンネルフィルター** - ユニットやグループ単位での絞り込み
- **ブックマーク** - 気になる配信を保存（localStorage に永続化）
- **通知機能** - ブックマークした配信の開始時にブラウザ通知
- **新着表示** - 直近2時間以内に追加された配信をハイライト
- **ライブ中表示** - 現在配信中のイベントを強調表示

## 技術スタック

### 全体

| カテゴリ       | 技術              |
| -------------- | ----------------- |
| 言語           | TypeScript        |
| パッケージ管理 | pnpm              |
| テスト         | bun test          |
| リント         | ESLint + Prettier |
| Git フック     | lefthook          |
| ホスティング   | Vercel            |

### UI

| カテゴリ       | 技術         |
| -------------- | ------------ |
| フレームワーク | Vue          |
| ビルドツール   | Vite         |
| 状態管理       | Pinia        |
| ルーティング   | Vue Router   |
| スタイリング   | Tailwind CSS |

## 開発

### 環境構築

[mise](https://mise.jdx.dev/) でツールバージョンを管理しています。

```bash
# ツールのインストール（bun, node, pnpm）
mise install

# 依存関係のインストール
pnpm install

# 開発サーバー起動（http://localhost:5173）
pnpm dev
```

### コマンド一覧

```bash
pnpm dev        # 開発サーバー起動
pnpm build      # プロダクションビルド
pnpm preview    # ビルドプレビュー
pnpm test       # テスト実行
pnpm typecheck  # 型チェック
pnpm lint       # リント実行
pnpm lint:fix   # リント自動修正
```

### パッケージ構成

```
packages/
├── core/       # 共通型定義・ユーティリティ
└── ui/         # フロントエンド（Vue 3 + Vite）

services/
├── hololive/   # ホロライブ配信情報取得
└── nijisanji/  # にじさんじ配信情報取得
```

## ライセンス

MIT
