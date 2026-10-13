# liver-streams

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

liver-streams は Vue 3 + TypeScript + Vite で構築された、VTuber の配信情報を表示するウェブアプリケーション。にじさんじとホロライブの配信データを統合して表示する。

## 開発コマンド

```bash
# 依存関係のインストール
pnpm install

# 開発サーバー起動（http://localhost:5173）
pnpm dev

# チェック（リポジトリルートで 1 回だけ定義している。各 package にはチェック用のスクリプトを置かない）
pnpm check:types   # 全プロジェクトの型チェック（bun check -b）
pnpm check:lint    # origin/main から分岐した点との差分だけ lint
pnpm check:fmt     # 同じ差分だけ format を検査
pnpm check:test    # 同じ差分のファイルを import するテストだけ実行（パッケージをまたぐ import は辿らない）
pnpm fix           # 差分に lint の自動修正と format を適用

# 比較元を変える（CI は PR の base を渡す）
CHECK_BASE=<commit> pnpm check:lint

# ビルド
pnpm build
```

ルートの package.json に `lint` / `fmt` という名前のスクリプトを置かない。置くと `bun lint` / `bun fmt` がどこから呼んでもそのスクリプトを実行し、組み込みのコマンドとして動かなくなる。

## アーキテクチャ

### パッケージ構成

```
apps/
└── web/                   # フロントエンド（Vue 3 + Vite）

packages/
├── core/                  # 共通型定義、ビジネスロジック、ユーティリティ
├── hololive/              # ホロライブ配信情報取得パッケージ
└── nijisanji/             # にじさんじ配信情報取得パッケージ
```

### 技術スタック

- **ツール管理**: mise.toml (bun, pnpm, node)
- **フレームワーク**: Vue（TSX。SFC は使わない）
- **ビルドツール**: Vite + @vitejs/plugin-vue-jsx
- **型チェック**: bun check
- **テスト**: bun test + happy-dom
- **状態管理**: Pinia
- **ルーティング**: Vue Router
- **スタイリング**: Tailwind CSS
- **リンター・フォーマッター**: bun lint + bun fmt。設定は `.oxlintrc.json` と `.oxfmtrc.json` の 1 つずつ。独自ルール（barrel-import、better-tailwindcss、eslint-plugin-vue の script 向けルール）は `.oxlintrc.json` の `jsPlugins` で読み込む（eslint-plugin-vue は組み込みの vue と名前がぶつかるので `vue-js` の別名で読む）
- **パッケージマネージャー**: pnpm

### テスト方針

- ユニットテストは bun test で記述
- テストファイルは対象ファイルと同じディレクトリに `*.test.ts` として配置
- `describe` と `it` でテストを構造化
- 新規機能にはテストを追加

### Git フック

- lefthook でコミット前に自動整形・不要コード削除を実行
- `pnpm fix:staged`（bun lint + bun fmt）でステージ済みのファイルをリント・フォーマット（`stage_fixed` で自動ステージ）
- knip --fix で未使用 export を自動削除（変更は unstaged で残るので、確認して git add → 再コミット）
- フォーマットや不要 export の整理はコミットフックで自動的に行われるため、手動で実行しない

## Vue コンポーネント

`.tsx` で `defineComponent((props: Props) => () => <JSX />, { name, props: [...] })` の形で書く。実行時 props の配列には Props の全キーを書く（漏れたキーは attrs に落ちる）。emit は使わず `onXxx` のコールバック props にする。

スタイルは Tailwind のクラスで書く。クラスで書けないもの（Transition のクラス、popover の疑似要素、keyframes）だけを同じディレクトリの `<ファイル名>.css` に書き、`assets/main.css` から `@import` する。scoped は無いので、クラス名には接頭辞を付けて衝突を避け、class 属性で使うクラスは `@layer components` に置く（better-tailwindcss が既知のクラスとして扱う）。

ファイル冒頭に JSDoc のブロックコメント（`/** ... */`）を置き、md 形式でドキュメントを記述する。

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

コンポーネントのコードを編集する際は、必ず冒頭のドキュメントコメントも合わせて更新する。

## タレント追加時の更新箇所

タレントが増えた場合、以下のファイルを更新する必要がある:

- `packages/hololive/data/icons.json` - ホロライブタレント名 → アイコンパスのマッピング
- `packages/hololive/data/channels.json` - ホロライブのユニット・グループ階層データ
- `packages/nijisanji/data/icons.json` - にじさんじタレント名 → アイコンパスのマッピング
- `packages/nijisanji/data/livers.json` - talentId → タレント名の対応
- `packages/nijisanji/data/channels.json` - にじさんじのユニット・グループ階層データ
- `apps/web/public/icons/` - タレントアイコン画像の配置先
- `packages/*/scripts/update-channels.ts` - チャンネル階層データとアイコンの更新スクリプト
