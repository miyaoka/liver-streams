# TODO: 将来的な改善項目

## にじさんじタレント情報の更新

### 現状の問題

- 新規タレントが追加されても手動更新するまで配信が表示されない
- `livers.json` とアイコン画像の手動管理が必要

### 実装内容

#### 1. タレント情報更新スクリプトの作成

- [ ] にじさんじ公式APIからタレント情報を取得
  - にじさんじJP: `https://www.nijisanji.jp/api/livers?affiliation=nijisanji`
  - にじさんじEN: `https://www.nijisanji.jp/api/livers?affiliation=nijisanjien`
- [ ] 取得データをIDと名前のみに簡略化
- [ ] `src/services/nijisanji/sample3/livers.json` を更新
- [ ] アイコン画像を `images.head.url` からダウンロード
  - URLに `&w=88&fm=webp` を追加
  - `public/icons/` に保存
  - `src/assets/icons.json` を更新

#### 2. GitHub Actionsによる自動更新

- [ ] 定期的にタレント情報更新スクリプトを実行
- [ ] 変更があれば自動でPRを作成
- [ ] 新規タレント追加を自動検知

## 環境別のアイコン配信パス

### 現状の問題

- ローカル開発でもGitHub Rawから画像を取得している
- ネットワーク遅延とオフライン開発の制約

### 実装内容

```typescript
// src/utils/icons.ts の改修
const iconBase = import.meta.env.DEV
  ? "/icons" // ローカル開発環境
  : "https://raw.githubusercontent.com/miyaoka/liver-streams/main/public/icons"; // 本番環境
```

## フォールバック処理の実装

### 現状の問題

- タレントIDが `nijiLiverMap` に存在しない場合、配信自体が除外される
- コンソールに `talent not found: [id]` の警告のみ

### 実装内容

```typescript
// src/services/api.ts の改修
function getTalent(id: string) {
  const talent = nijiLiverMap[id];
  if (!talent) {
    // フォールバック処理
    return {
      name: `Unknown (${id})`,
      image: getDefaultIcon(),
    };
  }
  return {
    name: talent.name,
    image: getChannelIcon(talent.name),
  };
}
```

## 関連ドキュメント

- [データフローとフィルタリング](./data-flow-and-filtering.md)
- [タレント処理の比較](./talent-processing-comparison.md)
- [APIデータフロー](./api-data-flow.md)
