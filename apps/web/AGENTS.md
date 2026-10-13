# @liver-streams/web

VTuber 配信情報アプリケーションのフロントエンド。Vue 3 + Vite で構築。

## 開発コマンド

```bash
pnpm dev         # 開発サーバー起動（http://localhost:5173）
pnpm build       # ビルド
pnpm preview     # ビルドプレビュー
```

チェック（型チェック・lint・format・テスト）はリポジトリルートで実行する。

## ディレクトリ構造

- `src/services/` - API 通信
- `src/store/` - Pinia ストア
- `src/components/` - Vue コンポーネント
- `src/composable/` - カスタムフック
- `src/views/` - ページコンポーネント
- `src/router/` - Vue Router 設定
- `src/lib/` - ユーティリティ
- `src/utils/` - ヘルパー関数
- `worker/` - Cloudflare Worker。`/api/*` を処理し、CORS を許可しないにじさんじ API を同じオリジンへ中継する

## services

### index.ts

サービス統合レイヤー。`@liver-streams/hololive` と `@liver-streams/nijisanji` を統合。

- `services` - EventService の配列
- `fetchAllEvents()` - ホロライブ・にじさんじの配信情報を統合取得
- `getChannelIcon()` - タレント名からアイコン URL を取得

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

- `LiverEventCard.tsx` - 配信カード
- `LiverEventDateSection.tsx` - 日付セクション
- `LiverEventTimeSection.tsx` - 時間セクション
- `LiverEventDateSectionList.tsx` - セクションリスト
- `detail/` - 詳細ポップオーバー

### menu/

メニュー・フィルター:

- `HeaderMenu.tsx` / `FooterMenu.tsx` - ヘッダー/フッター
- `SearchFilter.tsx` - 検索フィルター
- `channelFilter/` - チャンネルフィルター
- `bookmarkedEvent/` - ブックマーク一覧
- `addedEvent/` - 新着一覧
- `keywordList/` - キーワード一覧

## 技術スタック

- Vue 3（TSX）
- Vite 7
- Pinia（状態管理）
- Vue Router
- Tailwind CSS 4
- @vueuse/core
- bun test + happy-dom（テスト）
- bun check（型チェック）
