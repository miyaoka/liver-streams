# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

liver-streams は Vue 3 + TypeScript + Vite で構築された、VTuber の配信情報を表示するウェブアプリケーション。にじさんじとホロライブの配信データを統合して表示する。

## 開発コマンド

```bash
# 依存関係のインストール
pnpm install

# 開発サーバー起動（http://localhost:5173）
pnpm dev

# テスト実行
pnpm test

# 特定のテストのみ実行
pnpm test "<file path>" -t "<test name>"

# 型チェック
pnpm typecheck

# リント実行・自動修正
pnpm lint

# ビルド
pnpm build

# フォーマット
pnpm format
```

## アーキテクチャ

### パッケージ構成

```
packages/
├── core/                  # 共通型定義、ビジネスロジック、ユーティリティ
└── ui/                    # フロントエンド（Vue 3 + Vite）

services/
├── hololive/              # ホロライブ配信情報取得サービス
└── nijisanji/             # にじさんじ配信情報取得サービス
```

### 技術スタック

- **ツール管理**: mise.toml (bun, pnpm, node)
- **フレームワーク**: Vue (Composition API, `<script setup>` 構文)
- **ビルドツール**: Vite
- **型チェック**: TypeScript + vue-tsc
- **テスト**: bun test + happy-dom
- **状態管理**: Pinia
- **ルーティング**: Vue Router
- **スタイリング**: Tailwind CSS
- **リンター**: ESLint + Prettier
- **パッケージマネージャー**: pnpm

### テスト方針

- ユニットテストは bun test で記述
- テストファイルは対象ファイルと同じディレクトリに `*.test.ts` として配置
- `describe` と `it` でテストを構造化
- 新規機能にはテストを追加

### Git フック

- lefthook でコミット前に自動整形
- 対象ファイル: `*.{js,ts,vue,css,scss,md}`

## Vue コンポーネント

ファイル冒頭に `<doc lang="md">` カスタムブロックを配置し、md 形式でドキュメントを記述する。

### 記述内容

- 冒頭にコンポーネントの役割や目的を簡潔に記述
- 必要に応じて見出し（`##`）やリスト（`-`）などの Markdown 記法を使って主要な機能や実装の背景を説明

### 記述しないもの

- ファイル名と同じタイトル（冗長なため）
- props や emit などの実装詳細（コードを見れば分かるため）
- 単なる配置場所の列挙（役割の説明に含めて記述すればよい）

### Markdown 記法

- 見出しはレベル 2（`##`）から使用する（レベル 1 はファイル名と重複するため不要）
- リストやコードブロックなど適切な Markdown 記法を活用する

### 更新ルール

コンポーネントのコードを編集する際は、必ず `<doc>` ブロックも合わせて更新する。

## タレント追加時の更新箇所

タレントが増えた場合、以下のファイルを更新する必要がある:

- `services/hololive/data/icons.json` - ホロライブタレント名 → アイコンパスのマッピング
- `services/hololive/data/channels.json` - ホロライブのユニット・グループ階層データ
- `services/nijisanji/data/icons.json` - にじさんじタレント名 → アイコンパスのマッピング
- `services/nijisanji/data/livers.json` - talentId → タレント名の対応
- `services/nijisanji/data/channels.json` - にじさんじのユニット・グループ階層データ
- `packages/ui/public/icons/` - タレントアイコン画像の配置先
- `scripts/` - アイコン取得スクリプト（root 直下）
