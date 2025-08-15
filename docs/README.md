# ドキュメント目次

liver-streams アプリケーションの技術ドキュメント集です。

## 📚 ドキュメント一覧

### [データフローとフィルタリング](./data-flow-and-filtering.md)

配信データの取得から表示、フィルタリング処理までの流れを説明します。

- API データ取得処理
- フィルタリングの種類（タレント、検索、ステータス）
- ストア管理
- パフォーマンス最適化
- 既知の問題

### [APIデータフロー](./api-data-flow.md)

イベント情報とタレント情報のフローを図解で説明します。

- 全体のデータフロー図（mermaid）
- ホロライブ/にじさんじの処理フロー
- アイコン画像の処理
- Vercel/GitHub Raw配信戦略
- 配信戦略の妥当性分析

### [タレント処理の比較](./talent-processing-comparison.md)

ホロライブとにじさんじのタレント情報処理の違いを詳細に比較します。

- 処理方法の比較表
- データ構造の違い
- 新規タレント対応の問題
- 解決策の提案

### [TODO](./todo.md)

将来的に実装すべき改善項目をリストアップしています。

- にじさんじタレント情報の自動更新
- 環境別のアイコン配信パス
- フォールバック処理の実装

## 🗂️ ドキュメント構成

```
docs/
├── README.md                         # このファイル（目次）
├── data-flow-and-filtering.md        # データフローとフィルタリング処理
├── api-data-flow.md                   # APIデータフロー図解
├── talent-processing-comparison.md    # タレント処理の比較
└── todo.md                            # 将来の改善項目
```

## 🔍 クイックリファレンス

### API エンドポイント

| サービス   | 種別                 | エンドポイント                                                |
| ---------- | -------------------- | ------------------------------------------------------------- |
| ホロライブ | 配信情報             | `https://schedule.hololive.tv/api/list/7`                     |
| にじさんじ | 配信情報（公式）     | `https://www.nijisanji.jp/api/streams?day_offset={-1,0,1}`    |
| にじさんじ | 配信情報（プロキシ） | `https://nijiapi-proxy.vercel.app/api/streams`                |
| にじさんじ | タレント情報（JP）   | `https://www.nijisanji.jp/api/livers?affiliation=nijisanji`   |
| にじさんじ | タレント情報（EN）   | `https://www.nijisanji.jp/api/livers?affiliation=nijisanjien` |

### 主要ファイル

| ファイル                                     | 説明                   |
| -------------------------------------------- | ---------------------- |
| `src/services/api.ts`                        | データ統合処理         |
| `src/services/hololive/index.ts`             | ホロライブAPI処理      |
| `src/services/nijisanji/index.ts`            | にじさんじAPI処理      |
| `src/services/nijisanji/sample3/livers.json` | タレント情報キャッシュ |
| `src/lib/search.ts`                          | フィルタリング処理     |
| `src/utils/icons.ts`                         | アイコン配信パス管理   |
| `public/icons/`                              | アイコン画像キャッシュ |

### 主な問題と解決状況

| 問題                         | 状況      | 解決策                     |
| ---------------------------- | --------- | -------------------------- |
| にじさんじ新規タレント非表示 | ❌ 未解決 | 更新スクリプトの作成が必要 |
| Vercelリクエスト制限         | ✅ 解決済 | GitHub Raw CDNを使用       |
| ローカル開発の画像遅延       | ❌ 未解決 | 環境別パス切り替えが必要   |

## 📝 ドキュメント作成日

- 作成日: 2025-08-15
- 最終更新: 2025-08-15

## 🔗 関連リンク

- [本番環境](https://liver-streams.vercel.app/)
- [GitHubリポジトリ](https://github.com/miyaoka/liver-streams)
