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
pnpm run typecheck

# リント実行・自動修正
pnpm lint

# ビルド
pnpm build

# フォーマット
pnpm format
```

## アーキテクチャ

### ディレクトリ構造

- `src/services/` - API通信とデータ取得
  - `api.ts` - 共通API定義、LiverEvent インターフェース
  - `nijisanji/` - にじさんじ関連のデータ取得
  - `hololive/` - ホロライブ関連のデータ取得
- `src/store/` - Pinia ストア（状態管理）
  - `eventListStore.ts` - 配信イベントリスト管理
  - `bookmarkStore.ts` - ブックマーク管理
  - `searchStore.ts` - 検索状態管理
  - `focusStore.ts` - フォーカス状態管理
- `src/components/` - Vue コンポーネント
  - `streams/` - 配信表示関連コンポーネント
  - `menu/` - メニュー・フィルター関連コンポーネント
- `src/lib/` - ユーティリティ関数（テスト付き）
- `src/composable/` - Vue Composition API カスタムフック
- `src/router/` - Vue Router 設定

### 主要なデータ型

```typescript
// 配信イベントの基本型
interface LiverEvent {
  id: string;
  name: string;
  title: string;
  thumbnail: string;
  startAt: string | null;
  url: string;
  group: string;
  talent: string;
  icon: string;
}

// にじさんじライバー情報
interface NijiLiverMap {
  [id: string]: {
    name: string;
    enName?: string;
    icon: string;
    group: string;
  };
}
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
