# @liver-streams/hololive

ホロライブ配信情報を取得するパッケージ。

## 開発コマンド

```bash
pnpm typecheck   # 型チェック
pnpm lint        # リント実行
pnpm lint:fix    # リント自動修正
```

## ディレクトリ構造

- `src/index.ts` - エントリーポイント、`createHololiveService()` を export
- `src/api.ts` - ホロライブ公式 API からのデータ取得
- `src/icons.ts` - アイコン URL 解決
- `data/icons.json` - タレント名 → アイコンパスのマッピング
- `data/channels.json` - フィルター UI 用のチャンネル階層データ
- `data/dev/schedule.json` - 開発用 API レスポンススナップショット

## 主要な API

### createHololiveService(config)

`EventService` インターフェースを実装したサービスを生成する。

```typescript
import { createHololiveService } from "@liver-streams/hololive";

const service = createHololiveService({
  iconBaseUrl: "/icons",
});

// 配信イベントを取得
const events = await service.fetchEventList();

// タレント名からアイコン URL を取得
const iconUrl = service.getIcon("さくらみこ");
```

### fetchHoloEventList(options)

ホロライブ公式 API から配信スケジュールを取得する。

- エンドポイント: `https://schedule.hololive.tv/api/list/7`
- `options.useTestData: true` で開発用データを使用

### hololiveChannels

フィルター UI 用のチャンネル階層データ。

## 依存関係

- `@liver-streams/core` - 共通型定義、`createLiverEvent()` など

## 技術スタック

- TypeScript
- ESLint
