# ドキュメント

liver-streams の技術ドキュメント。

## ドキュメント一覧

### [外部 API とデータ取得](./external-api.md)

外部 API からのデータ取得方法。

- ホロライブ/にじさんじの処理フロー
- サービス間の違い

### [アプリ内部のデータフローと UI](./app-internal.md)

配信データの統合からフィルタリング、UI 表示までの流れ。

- フィルタリングの種類（タレント、検索、ステータス）
- ストア管理
- パフォーマンス最適化

### [タレント情報と画像の管理](./talent-auto-update.md)

タレント情報と画像の管理、自動更新の仕組み。

- 画像管理（dev/build での違い）
- サービス間のデータ構造の違い
- 自動更新フロー
- GitHub Actions

## API エンドポイント

| サービス   | 種別                 | エンドポイント                                                |
| ---------- | -------------------- | ------------------------------------------------------------- |
| ホロライブ | 配信情報             | `https://schedule.hololive.tv/api/list/7`                     |
| にじさんじ | 配信情報（公式）     | `https://www.nijisanji.jp/api/streams?day_offset={-1,0,1}`    |
| にじさんじ | 配信情報（プロキシ） | `https://nijiapi-proxy.vercel.app/api/streams`                |
| にじさんじ | タレント情報（JP）   | `https://www.nijisanji.jp/api/livers?affiliation=nijisanji`   |
| にじさんじ | タレント情報（EN）   | `https://www.nijisanji.jp/api/livers?affiliation=nijisanjien` |

## 関連リンク

- [本番環境](https://liver-streams.vercel.app/)
- [GitHub リポジトリ](https://github.com/miyaoka/liver-streams)
