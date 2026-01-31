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

### api.ts

- `fetchLiverEventList()` - ホロライブ・にじさんじの配信情報を統合取得
- `createLiverEvent()` - LiverEvent オブジェクトを生成
- `createId()` - YouTube 動画 ID またはハッシュベースの ID を生成

### hololive/index.ts

- `fetchHoloEventList()` - ホロライブ公式 API からスケジュール取得
- API エンドポイント: `https://schedule.hololive.tv/api/list/7`

### nijisanji/index.ts

- `fetchNijiLiverMap()` - タレント情報（ローカル JSON から取得）
- `fetchNijiStreamList()` - 配信情報取得
- API エンドポイント: 環境変数 `VITE_NIJI_API_BASE` または `https://nijiapi-proxy.vercel.app/api`

## store

### eventListStore.ts

メインのイベント管理:

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
