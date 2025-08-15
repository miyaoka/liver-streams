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

## 関連ドキュメント

- [データフローとフィルタリング](./data-flow-and-filtering.md)
- [タレント処理の比較](./talent-processing-comparison.md)
- [APIデータフロー](./api-data-flow.md)
