# @liver-streams/ui

VTuber 配信情報アプリケーションのフロントエンド。Vue 3 + Vite で構築。

## 開発コマンド

```bash
pnpm dev         # 開発サーバー起動（http://localhost:5173）
pnpm build       # ビルド
pnpm preview     # ビルドプレビュー
pnpm test        # テスト実行
pnpm typecheck   # 型チェック
pnpm lint        # リント実行
pnpm lint:fix    # リント自動修正
```

## ディレクトリ構造

- `src/services/` - API 通信
- `src/store/` - Pinia ストア
- `src/components/` - Vue コンポーネント
- `src/composable/` - カスタムフック
- `src/views/` - ページコンポーネント
- `src/router/` - Vue Router 設定
- `src/lib/` - ユーティリティ
- `src/utils/` - ヘルパー関数

## services

### index.ts

サービス統合レイヤー。`@liver-streams/service-hololive` と `@liver-streams/service-nijisanji` を統合。

- `services` - EventService の配列
- `getAffiliationLogo()` - 所属ロゴ URL を取得

## store

### eventListStore.ts

メインのイベント管理。各サービス（ホロライブ・にじさんじ）を並列で取得し、完了したサービスから順次表示するインクリメンタル更新方式:

- `liverEventList` - 全イベントリスト
- `filteredEventList` - フィルター適用後のリスト
- `dateSectionList` - 日付セクション化されたリスト
- `addedEventList` - 新着イベント（2 時間以内）
- `onLiveEventList` - ライブ中のイベント
- ブラウザ通知機能（`notify` タイプのブックマーク）

### searchStore.ts

検索状態管理:

- `searchString` - 検索文字列
- `searchQuery` - パース済みクエリ
- `isLiveOnly` - ライブ中のみフィルター
- `setFocusedTalent()` - タレントフォーカス

### bookmarkStore.ts

ブックマーク管理（localStorage 永続化）:

- `bookmarkEventMap` - イベント ID → ブックマークタイプのマップ
- ブックマークタイプ: `"bookmark"` | `"notify"`

### storageStore.ts

設定の永続化:

- タレントフィルター設定

### scrollStore.ts / dateStore.ts / focusStore.ts / notificationStore.ts

UI 状態管理

## components

### streams/

配信カード表示:

- `LiverEventCard.vue` - 配信カード
- `LiverEventDateSection.vue` - 日付セクション
- `LiverEventTimeSection.vue` - 時間セクション
- `LiverEventDateSectionList.vue` - セクションリスト
- `detail/` - 詳細ポップオーバー

### menu/

メニュー・フィルター:

- `HeaderMenu.vue` / `FooterMenu.vue` - ヘッダー/フッター
- `SearchFilter.vue` - 検索フィルター
- `channelFilter/` - チャンネルフィルター
- `bookmarkedEvent/` - ブックマーク一覧
- `addedEvent/` - 新着一覧
- `keywordList/` - キーワード一覧

## 技術スタック

- Vue 3（Composition API, `<script setup>`）
- Vite 7
- Pinia（状態管理）
- Vue Router
- Tailwind CSS 4
- @vueuse/core
- bun test + happy-dom（テスト）
- vue-tsc（型チェック）

## 環境変数

- `VITE_NIJI_API_BASE` - にじさんじ API のベース URL
- `VITE_TEST_DATA` - テストデータ使用フラグ
