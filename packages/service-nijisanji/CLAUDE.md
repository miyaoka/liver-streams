# @liver-streams/service-nijisanji

にじさんじ配信情報を取得するサービスパッケージ。

## 開発コマンド

```bash
pnpm test        # テスト実行
pnpm typecheck   # 型チェック
pnpm lint        # リント実行
pnpm lint:fix    # リント自動修正
```

## ディレクトリ構造

- `src/index.ts` - エントリーポイント、`createNijisanjiService()` を export
- `src/api.ts` - にじさんじ API からのデータ取得
- `src/icons.ts` - アイコン URL 解決
- `src/icons.json` - タレント名 → アイコンパスのマッピング
- `src/livers.json` - talentId → タレント情報のマッピング
- `src/sample3/` - テスト用サンプルデータ

## 主要な API

### createNijisanjiService(config)

`EventService` インターフェースを実装したサービスを生成する。

```typescript
import { createNijisanjiService } from "@liver-streams/service-nijisanji";

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
- `options.useTestData: true` でテストデータを使用

## 依存関係

- `@liver-streams/core` - 共通型定義、`createLiverEvent()` など

## 技術スタック

- TypeScript
- bun test（テスト）
- ESLint
