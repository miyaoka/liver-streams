# @liver-streams/core

VTuber 配信情報アプリケーションの共有ライブラリ。ビジネスロジック、型定義、ユーティリティを提供する。

## 開発コマンド

```bash
pnpm test        # テスト実行
pnpm typecheck   # 型チェック
pnpm lint        # リント実行
pnpm lint:fix    # リント自動修正
```

## ディレクトリ構造

- `src/types/` - 型定義
- `src/lib/` - ビジネスロジック（テスト付き）
- `src/utils/` - ユーティリティ関数
- `src/data/` - 静的データ定義
- `src/logic/` - lib からの re-export

## 主要な型定義

```typescript
// src/types/index.ts
interface LiverEvent {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  startAt: Date;
  endAt: Date | null;
  isLive: boolean;
  talent: LiverTalent;
  collaboTalents: LiverTalent[];
  affiliation: "hololive" | "nijisanji";
  hashtagList: string[];
  hashtagSet: Set<string>;
  collaboTalentSet: Set<string>;
  keywordList: string[];
}

interface LiverTalent {
  name: string;
  image: string;
}

// src/types/service.ts
interface EventService {
  readonly affiliation: "hololive" | "nijisanji";
  fetchEventList(): Promise<LiverEvent[]>;
  getIcon(name: string): string | undefined;
}

interface EventServiceConfig {
  iconBaseUrl: string;
}
```

## lib モジュール

### text.ts

テキスト処理関連:

- `extractParenthesizedText()` - タイトルから括弧内のキーワードを抽出
- `getHashTagList()` - タイトルからハッシュタグを抽出（Unicode TR31 準拠）
- `parseSegment()` - テキストをキーワード/ハッシュタグ/テキストに分割

### search.ts

検索・フィルタリング関連:

- `parseSearchString()` - 検索文字列をクエリオブジェクトにパース
- `searchQueryToSearchString()` - クエリオブジェクトを検索文字列に変換
- `createSearchRegexp()` - AND/OR 検索の正規表現を生成
- `getFilteredEventList()` - イベントリストをフィルタリング
- `getTalentFocusedList()` - タレント指定でフィルタリング
- `getTalentFilterMapApplyedList()` - タレントフィルターマップでフィルタリング

### section.ts

日付セクション関連:

- `createDateSectionList()` - イベントリストを日付/時間セクションにグループ化

### youtube.ts

YouTube 関連:

- `getThumbnail()` - サムネイル URL の画質を変更
- `getYouTubeVideoId()` - 各種 YouTube URL から動画 ID を抽出

### liverEvent.ts

LiverEvent 生成:

- `createLiverEvent()` - API レスポンスから LiverEvent オブジェクトを生成
- `createId()` - YouTube 動画 ID またはハッシュベースの ID を生成

## utils モジュール

### date.ts

日付計算:

- `getDateTime()` - 時分秒を切り捨てた日付を取得
- `getHourTime()` - 分以下を切り捨てた日付を取得
- `compareDate()` - 日数差を計算

### dateFormat.ts

日付フォーマッター（`Intl.DateTimeFormat` ベース）:

- `fullDateFormatter` - 完全な日時
- `mmddhhssDateFormatter` - 月日時分
- `mdwdayDateFormatter` - 月日曜日
- `hhmmDateFormatter` - 時分
- `toRelativeTime()` - 相対時間（「3分前」など）

## data モジュール

### channel.ts

- `ChannelNode` - チャンネル階層構造の型
- `talents` - ホロライブ・にじさんじのタレント階層データ

## 技術スタック

- TypeScript
- bun test（テスト）
- ESLint
