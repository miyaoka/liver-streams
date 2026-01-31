# タレントデータ更新

タレントデータの取得・更新フローを定義する。

## データ構造

```mermaid
graph LR
    subgraph "ホロライブ"
        HoloAPI[配信API] --> HoloEvent[イベントデータ]
        HoloEvent --> |talent.name| HoloName[タレント名]
        HoloEvent --> |talent.iconImageUrl| HoloIconURL[アイコンURL]
    end

    subgraph "にじさんじ"
        NijiEventAPI[配信API] --> NijiEvent[イベントデータ]
        NijiEvent --> |talentId| NijiTalentId[タレントID]

        NijiLiversAPI[タレントAPI] --> NijiLiver[タレントデータ]
        NijiLiver --> |id| NijiId[ID]
        NijiLiver --> |name| NijiName[タレント名]
        NijiLiver --> |slug| NijiSlug[スラッグ]
        NijiLiver --> |images.head.url| NijiIconURL[アイコンURL]
    end
```

## API エンドポイント

| サービス   | 種別         | URL                                                                           |
| ---------- | ------------ | ----------------------------------------------------------------------------- |
| ホロライブ | 配信         | `https://schedule.hololive.tv/api/list/7`                                     |
| にじさんじ | 配信         | `https://nijiapi-proxy.vercel.app/api/streams`                                |
| にじさんじ | タレント(JP) | `https://www.nijisanji.jp/api/livers?affiliation=nijisanji&includeAll=true`   |
| にじさんじ | タレント(EN) | `https://www.nijisanji.jp/api/livers?affiliation=nijisanjien&includeAll=true` |

## ローカルデータファイル

```
services/
├── hololive/data/
│   └── icons.json          # name → /hololive/{name}.jpg
└── nijisanji/data/
    ├── icons.json          # name → /nijisanji/{slug}.webp
    └── livers.json         # id → { name }

packages/ui/public/icons/
├── hololive/               # {name}.jpg
└── nijisanji/              # {slug}.webp
```

## 日次更新フロー

```mermaid
flowchart LR
    subgraph "ホロライブ更新"
        H1[配信APIを取得] --> H2[全タレント情報を抽出]
        H2 --> H3{icons.jsonに<br>存在しない?}
        H3 --> |Yes| H4[画像をダウンロード]
        H4 --> H5[icons.jsonに追加]
        H3 --> |No| H6[スキップ]
    end

    subgraph "にじさんじ更新"
        N1[タレントAPIを取得<br>JP + EN] --> N2{livers.jsonと<br>差分あり?}
        N2 --> |Yes| N3[livers.jsonを更新]
        N3 --> N4[新規タレントの画像をダウンロード]
        N4 --> N5[icons.jsonを更新]
        N2 --> |No| N6[スキップ]
    end
```

## データ変換

### ホロライブ

```
イベントAPI → icons.json
─────────────────────────
talent.name         → key
talent.iconImageUrl → ダウンロード → /hololive/{name}.jpg
```

### にじさんじ

```
タレントAPI → livers.json
─────────────────────────
id   → key
name → value.name

タレントAPI → icons.json
─────────────────────────
name            → key
slug            → /nijisanji/{slug}.webp
images.head.url → ダウンロード → /nijisanji/{slug}.webp
```

## 更新トリガー

| サービス   | トリガー                       | 理由                  |
| ---------- | ------------------------------ | --------------------- |
| ホロライブ | イベントに未知のタレントが出現 | タレント専用APIがない |
| にじさんじ | タレントAPIに変更あり          | IDで紐付けが必要      |
