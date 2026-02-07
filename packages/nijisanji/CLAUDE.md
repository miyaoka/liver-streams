# @liver-streams/nijisanji

にじさんじ配信情報を取得するパッケージ。

## 開発コマンド

```bash
pnpm typecheck   # 型チェック
pnpm lint        # リント実行
pnpm lint:fix    # リント自動修正
```

## ディレクトリ構造

- `src/index.ts` - エントリーポイント、`createNijisanjiService()` を export
- `src/api.ts` - にじさんじ API からのデータ取得
- `src/icons.ts` - アイコン URL 解決
- `data/icons.json` - タレント名 → アイコンパスのマッピング
- `data/livers.json` - talentId → タレント情報のマッピング
- `data/channels.json` - フィルター UI 用のチャンネル階層データ
- `data/dev/streams.json` - 開発用 API レスポンススナップショット

## 主要な API

### createNijisanjiService(config)

`EventService` インターフェースを実装したサービスを生成する。

```typescript
import { createNijisanjiService } from "@liver-streams/nijisanji";

const service = createNijisanjiService({
  iconBaseUrl: "/icons",
  apiBaseUrl: "https://nijiapi-proxy.vercel.app/api", // オプション
});

// 配信イベントを取得
const events = await service.fetchEventList();

// タレント名からアイコン URL を取得
const iconUrl = service.getIcon("月ノ美兎");
```

### fetchNijiLiverMap()

ローカルの `livers.json` からタレント情報を取得する。

### fetchNijiStreamList(options)

にじさんじ API から配信情報を取得する。

- デフォルトエンドポイント: `https://nijiapi-proxy.vercel.app/api/streams`
- `options.apiBaseUrl` でカスタム API を指定可能
- `options.useTestData: true` で開発用データを使用

### nijisanjiChannels

フィルター UI 用のチャンネル階層データ。

## 依存関係

- `@liver-streams/core` - 共通型定義、`createLiverEvent()` など

## 技術スタック

- TypeScript
- ESLint
