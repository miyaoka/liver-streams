# liver-streams

VTuber の配信情報を一覧表示するウェブアプリケーション。にじさんじとホロライブの配信スケジュールを統合し、リアルタイムで確認できます。

🔗 **[liver-streams.miyaoka.workers.dev](https://liver-streams.miyaoka.workers.dev)**

<img width="1733" height="1033" alt="liver-streams" src="https://github.com/user-attachments/assets/e6a416d4-a8b4-4645-a30b-17266508f2ad" />

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

| カテゴリ       | 技術               |
| -------------- | ------------------ |
| 言語           | TypeScript         |
| パッケージ管理 | pnpm               |
| 型チェック     | bun check          |
| テスト         | bun test           |
| リント         | bun lint           |
| フォーマット   | bun fmt            |
| Git フック     | lefthook           |
| ホスティング   | Cloudflare Workers |

### UI

| カテゴリ       | 技術         |
| -------------- | ------------ |
| フレームワーク | React        |
| ビルドツール   | Vite         |
| 状態管理       | zustand      |
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
pnpm dev           # 開発サーバー起動
pnpm build         # プロダクションビルド
pnpm preview       # ビルドプレビュー
pnpm check:types   # 型チェック
pnpm check:lint    # 差分の lint
pnpm check:fmt     # 差分の format 検査
pnpm check:test    # 差分に影響するテスト
pnpm fix           # 差分に lint の自動修正と format を適用
```

### パッケージ構成

```
apps/
└── web/        # フロントエンド（React + Vite）
packages/
├── core/       # 共通型定義・ユーティリティ
├── hololive/   # ホロライブ配信情報取得
└── nijisanji/  # にじさんじ配信情報取得
```

## ライセンス

MIT
