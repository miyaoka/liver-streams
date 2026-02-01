# 外部 API とデータ取得

## 全体のデータフロー

```mermaid
graph TB
    subgraph "ホロライブ"
        H1[ホロライブ公式API<br/>schedule.hololive.tv/api/list/7]
        H2[配信情報<br/>+<br/>タレント情報]
        H1 -->|直接取得<br/>CORS OK| H2
    end

    subgraph "にじさんじ"
        N1[にじさんじ公式API<br/>配信: nijisanji.jp/api/streams<br/>タレント: nijisanji.jp/api/livers]
        N2[プロキシAPI<br/>nijiapi-proxy.vercel.app]
        N3[配信情報のみ]
        N4[ローカルJSON<br/>livers.json]
        N5[配信情報<br/>+<br/>タレントID]

        N1 -->|CORS制限| N2
        N2 -->|day_offset=-1,0,1<br/>3日分まとめて| N3
        N4 --> N5
        N3 --> N5
    end

    H2 --> M[統合処理<br/>LiverEvent形式に変換]
    N5 --> M
    M --> F[フィルタリング]
    F --> U[UI表示]
```

## ホロライブのデータフロー

```mermaid
sequenceDiagram
    participant C as クライアント
    participant API as ホロライブAPI
    participant P as 処理

    C->>API: GET /api/list/7
    API-->>C: 配信データ（タレント情報含む）
    Note over API,C: CORS制限なし<br/>直接アクセス可能

    C->>P: データ変換
    Note over P: HoloVideoDetail {<br/>  title<br/>  url<br/>  talent: {name, icon}<br/>  collaboTalents<br/>}
    P-->>C: LiverEvent形式
```

## にじさんじのデータフロー

```mermaid
sequenceDiagram
    participant C as クライアント
    participant P as プロキシAPI
    participant N as にじさんじAPI
    participant L as ローカルJSON
    participant PR as 処理

    C->>L: livers.json読み込み
    L-->>C: タレント情報（ID→名前マップ）

    C->>P: GET /streams
    P->>N: GET /streams?day_offset=-1
    P->>N: GET /streams?day_offset=0
    P->>N: GET /streams?day_offset=1
    N-->>P: 3日分の配信データ
    P-->>C: まとめた配信データ
    Note over P,C: CORS回避のため<br/>プロキシ経由

    C->>PR: データ結合処理
    Note over PR: NijiStream {<br/>  talentId: "abc123"<br/>} + nijiLiverMap
    PR-->>C: LiverEvent形式
```

## データ処理の比較

```mermaid
graph TD
    subgraph "ホロライブ処理"
        HA[APIレスポンス] -->|直接含まれる| HB[タレント情報]
        HB --> HC[LiverEvent作成]
    end

    subgraph "にじさんじ処理"
        NA[APIレスポンス] -->|talentId| NB[livers.json参照]
        NB --> NC[LiverEvent作成]
    end
```

## まとめ

| 項目           | ホロライブ       | にじさんじ                   |
| -------------- | ---------------- | ---------------------------- |
| タレント情報源 | APIレスポンス内  | 静的ファイル（livers.json）  |
| CORS制限       | なし             | あり（プロキシ必要）         |
| データ取得     | 1回のAPI呼び出し | 配信API + 事前のタレント情報 |

> [!NOTE]
> タレント情報と画像の管理については [talent-auto-update.md](./talent-auto-update.md) を参照。
