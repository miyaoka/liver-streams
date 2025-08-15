# API データフロー図

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
        N1 -.->|スクリプトで取得<br/>手動更新| N4
        N3 --> N5
        N4 --> N5
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

    Note over L: 事前準備：<br/>スクリプトで更新

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
    Note over PR: talentIdが<br/>livers.jsonにない場合<br/>配信を除外
```

## タレント情報の更新フロー

```mermaid
graph LR
    subgraph "現在の方法（手動）"
        A1[開発者] -->|手動実行| B1[更新スクリプト]
        B1 --> C1[にじさんじAPI<br/>livers?affiliation=nijisanji]
        B1 --> C2[にじさんじAPI<br/>livers?affiliation=nijisanjien]
        C1 --> D1[データ簡略化<br/>ID・名前のみ]
        C2 --> D1
        D1 --> E1[livers.json<br/>更新]
        E1 --> F1[コミット・プッシュ]
    end
```

## 将来の自動更新フロー（提案）

```mermaid
graph LR
    subgraph "GitHub Actions（自動）"
        A2[定期実行<br/>週1回など] -->|自動| B2[更新スクリプト]
        B2 --> C3[にじさんじAPI<br/>タレント情報取得]
        C3 --> D2[差分チェック]
        D2 -->|変更あり| E2[livers.json<br/>更新]
        E2 --> F2[PR作成]
        F2 --> G2[レビュー・マージ]
    end
```

## データ処理の比較

```mermaid
graph TD
    subgraph "ホロライブ処理"
        HA[APIレスポンス] -->|直接含まれる| HB[タレント情報]
        HB --> HC[LiverEvent作成]
        HC --> HD[✅ 全配信表示]
    end

    subgraph "にじさんじ処理"
        NA[APIレスポンス] -->|talentId| NB[livers.json参照]
        NB -->|存在する| NC1[LiverEvent作成]
        NB -->|存在しない| NC2[null返却]
        NC1 --> ND1[✅ 配信表示]
        NC2 --> ND2[❌ 配信除外]
    end
```

## 問題発生のフロー

```mermaid
sequenceDiagram
    participant API as にじさんじAPI
    participant P as プロキシ
    participant C as クライアント
    participant L as livers.json

    Note over API: 新タレント追加

    C->>P: 配信情報取得
    P->>API: streams取得
    API-->>P: 新タレントID含む
    P-->>C: 配信データ

    C->>L: タレント情報検索
    Note over L: 新タレントID<br/>存在しない❌
    L-->>C: null

    C->>C: 配信を除外
    Note over C: console.warn<br/>"talent not found"
```

## アイコン画像の処理

```mermaid
graph TD
    subgraph "ホロライブのアイコン"
        HI1[APIレスポンス] -->|iconImageUrl| HI2[yt3.ggpht.com]
        HI2 -->|直接表示| HI3[画像表示]
        Note1[キャッシュ不要]
    end

    subgraph "にじさんじのアイコン"
        NI1[APIレスポンス] -->|image URL| NI2[nijisanji.jp/api/image-proxy]
        NI2 -.->|事前取得| NI3[public/icons/<br/>ローカルキャッシュ]
        NI3 -->|GitHub経由| NI4[raw.githubusercontent.com]
        NI4 --> NI5[画像表示]
        Note2[キャッシュ必要]
    end
```

### アイコン処理の詳細

**ホロライブ**:

- APIレスポンスの `talent.iconImageUrl` を直接使用
- YouTubeのCDN（`yt3.ggpht.com`）から配信
- 画像サイズ: 幅88px
- CORS制限なし、キャッシュ不要

**にじさんじ**:

- 公式APIレスポンスの `images.head.url` にアイコンURL
- URLは `/api/image-proxy?url=...` 形式（署名付き）
- にじさんじ公式は `&w=200&fm=webp` でリサイズ・WebP形式指定
- 本アプリでは `&w=88&fm=webp` でホロライブと同じサイズに統一
- 事前に `public/icons/` にダウンロード・キャッシュ（88px WebP形式）
- `src/assets/icons.json` でタレント名とファイルパスをマッピング
- GitHub Raw経由（`raw.githubusercontent.com`）で配信
- 新規タレント追加時はアイコンもダウンロードが必要

```typescript
// src/utils/icons.ts（現在の実装）
const iconBase = "https://raw.githubusercontent.com/miyaoka/liver-streams/main/public/icons";
export function getChannelIcon(name: string) {
  const path = talentIcons[name]; // icons.jsonから取得
  return path ? `${iconBase}${path}` : `${iconBase}${defaultIcon}`;
}

// 将来の実装案：環境による切り替え
const iconBase = import.meta.env.DEV
  ? "/icons" // ローカル開発環境
  : "https://raw.githubusercontent.com/miyaoka/liver-streams/main/public/icons"; // 本番環境
```

### デプロイとアイコン配信戦略

**本アプリのデプロイ**:

- Vercelでホスティング: `https://liver-streams.vercel.app/`
- `public/icons/` は `/icons/` でアクセス可能

**Vercel無料プランの制限**:

- **帯域幅**: 100GB/月
- **エッジリクエスト**: 制限なし（静的ファイル）
- **サーバーレス関数の実行**: 100GB-時間/月
- 画像ファイル（WebP 88px）: 約3-5KB/枚
- 200人分 × 3-5KB = 600KB-1MB/回
- 問題点: 多数のユーザーが同時アクセスすると帯域幅を消費

**GitHub Raw の利点**:

- **リクエスト制限**:
  - 認証なし: 60リクエスト/時（API）
  - Raw コンテンツ: **制限なし**（CDN経由）
- `raw.githubusercontent.com` はCDN配信のため実質無制限
- キャッシュヘッダーが適切に設定される
- 世界中のエッジサーバーから配信

**配信パスの選択理由**:

```javascript
// 本番環境: GitHub Raw経由（推奨）
// - CDN経由で実質無制限
// - Vercelの帯域幅を消費しない
// - ブラウザキャッシュも効く
"https://raw.githubusercontent.com/miyaoka/liver-streams/main/public/icons/[filename]";

// ローカル開発環境: 直接配信（将来実装）
// - Viteの開発サーバーから直接配信
// - ネットワーク遅延なし
// - オフライン開発可能
"/icons/[filename]";

// Vercel経由（本番では避けるべき）
// - 200リクエスト × ユーザー数 = 大量のトラフィック
// - 無料プランの帯域幅を消費
"https://liver-streams.vercel.app/icons/[filename]";
```

**環境別の配信戦略（将来実装）**:
| 環境 | 配信元 | メリット |
|------|--------|----------|
| ローカル開発 | `/icons/` | 高速、オフライン可能 |
| 本番（Vercel） | GitHub Raw | 帯域幅節約、無制限 |
| プレビュー | GitHub Raw | 本番と同じ挙動 |

## まとめ

### 主な違い

| 項目               | ホロライブ                  | にじさんじ                            |
| ------------------ | --------------------------- | ------------------------------------- |
| タレント情報源     | APIレスポンス内             | 静的ファイル（livers.json）           |
| アイコン画像       | yt3.ggpht.com（88px、直接） | public/icons（88px WebP、キャッシュ） |
| CORS制限           | なし                        | あり（プロキシ必要）                  |
| 新規タレント対応   | 自動                        | 手動更新必要                          |
| データ取得         | 1回のAPI呼び出し            | 配信API + 事前のタレント情報          |
| エラーハンドリング | 不要                        | talentId不在で除外                    |

### 現在の課題

- にじさんじの新規タレントは `livers.json` を更新するまで表示されない
- タレント情報の更新は手動で行う必要がある
- アイコン画像も事前にダウンロード・キャッシュが必要
- プロキシAPIはCORS回避のためだけに使用（タレント情報は提供しない）

### 設計上の工夫

- **リクエスト最適化**: GitHub RawをCDNとして活用し、Vercelの帯域幅制限を回避
- **画像最適化**: 88px WebP形式で統一し、ファイルサイズを最小化（3-5KB/枚）
- **キャッシュ戦略**: 静的ファイルとして事前キャッシュすることで、実行時の負荷を軽減
- **コスト最適化**: GitHub Rawの無制限CDN配信を活用し、Vercel無料プランでも運用可能

### まとめ：配信戦略の妥当性

**Vercel経由の問題点**:

- 200人分のアイコン = 200リクエスト/ユーザー
- 1000ユーザー/日 × 1MB = 1GB/日 = 30GB/月
- 無料プラン（100GB/月）の30%を消費

**GitHub Raw経由の利点**:

- ✅ リクエスト数: 実質無制限（CDN配信）
- ✅ 帯域幅: Vercelの制限に影響しない
- ✅ パフォーマンス: 世界中のCDNエッジから配信
- ✅ コスト: 完全無料

**結論**: GitHub Rawからの配信は技術的・経済的に最適な選択
