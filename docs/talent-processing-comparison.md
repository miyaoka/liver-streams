# タレント処理の比較：ホロライブ vs にじさんじ

## 概要

liver-streams では、ホロライブとにじさんじのタレント情報を異なる方法で処理しています。この違いが、新規タレントの表示に関する挙動の差を生み出しています。

## 処理方法の比較

### ホロライブのタレント処理

**特徴**: タレント情報はAPIレスポンスに含まれる

```typescript
// src/services/hololive/index.ts
export interface HoloVideoDetail {
  // ...
  name: string; // タレント名がAPIレスポンスに含まれる
  talent: HoloTelent; // タレント情報（名前、アイコン）
  collaboTalents: HoloTelent[]; // コラボタレント情報
}

export interface HoloTelent {
  name: string; // タレント名
  iconImageUrl: string; // アイコン画像URL
}
```

**処理フロー**:

1. API (`https://schedule.hololive.tv/api/list/7`) から配信情報を取得
2. 各配信データに**タレント情報が含まれている**
3. そのままタレント情報を使用してLiverEventを作成

```typescript
// fetchHoloEventList 関数の処理
const talent = {
  name: video.name, // APIレスポンスから直接取得
  image: video.talent.iconImageUrl,
};
const collaboTalents = video.collaboTalents.map((collaboTalent) => {
  return {
    name: collaboTalent.name, // APIレスポンスから直接取得
    image: collaboTalent.iconImageUrl,
  };
});
```

**メリット**:

- 新規タレントが追加されても自動的に表示される
- タレント情報の更新が不要
- 常に最新のタレント情報を取得できる

### にじさんじのタレント処理

**特徴**: タレント情報を静的ファイルから取得し、IDで紐付け

**API構成**:

#### 配信情報API

- **公式API**: `https://www.nijisanji.jp/api/streams?day_offset={offset}`
  - CORS制限によりクライアントから直接アクセス不可
  - `day_offset`: -3〜3の範囲で指定可能
- **プロキシAPI**: `https://nijiapi-proxy.vercel.app/api/streams`
  - CORS制限を回避
  - day_offset=-1,0,1の3日分をまとめて取得・キャッシュ
  - ホロライブの取得範囲に合わせて統一

#### タレント情報API

- **公式API**:
  - にじさんじJP: `https://www.nijisanji.jp/api/livers?limit=300&orderKey=subscriber_count&order=asc&affiliation=nijisanji&locale=ja&includeAll=true`
  - VirtuaReal（中国）: `https://www.nijisanji.jp/api/livers?limit=300&orderKey=subscriber_count&order=asc&affiliation=virtuareal&locale=ja&includeAll=true`
  - にじさんじEN: `https://www.nijisanji.jp/api/livers?limit=300&orderKey=subscriber_count&order=asc&affiliation=nijisanjien&locale=ja&includeAll=true`
- **ローカルキャッシュ**: `src/services/nijisanji/sample3/livers.json`
  - タレントの追加・削除がない限り更新不要
  - VirtuaRealは除外
  - IDと名前のみに簡略化した情報を保存

```typescript
// にじさんじ公式APIのレスポンス形式（実際のデータ）
interface NijiLiverApiResponse {
  id: string; // "0kvf3utd91g"
  slug: string; // "nijisanji-official"
  name: string; // "にじさんじ公式"
  enName: string; // "Nijisanji Official"
  hidden?: boolean;
  subscriberCount: number;
  images: {
    head: {
      url: string; // "/api/image-proxy?url=..."
      height: number;
      width: number;
    };
    // その他の画像情報...
  };
  socialLinks: {
    twitter: string;
    youtube: string;
  };
  // その他のフィールド...
}

// アプリケーション内で使用する簡略化された形式
export interface NijiLiver {
  name: string; // タレント名
  enName?: string; // 英語名
  icon: string; // アイコン画像
  group: string; // 所属グループ
}

export type NijiLiverMap = Record<string, NijiLiver>; // IDをキーとするMap
```

**処理フロー**:

1. タレント情報を静的ファイル (`sample3/livers.json`) から読み込み
2. API (`https://nijiapi-proxy.vercel.app/api/streams`) から配信情報を取得
3. 配信データの `talentId` を使って `nijiLiverMap` から対応するタレント情報を検索
4. タレントが見つからない場合は**配信自体を除外**

```typescript
// getNijiEvents 関数の処理
function getTalent(id: string) {
  const talent = nijiLiverMap[id]; // 静的ファイルから読み込んだMapで検索
  if (!talent) {
    console.warn(`talent not found: ${id}`);
    return null; // タレントが見つからない場合はnull
  }
  return {
    name: talent.name,
    image: getChannelIcon(talent.name),
  };
}

// タレントが見つからない配信は除外される
const talent = getTalent(talentId);
if (!talent) return null; // この配信は表示されない
```

**デメリット**:

- 新規タレントが追加されても、`livers.json` を更新しない限り表示されない
- タレント情報の定期的な更新が必要
- APIの `talentId` と静的ファイルの同期が必要

## 問題と影響

### 現在の問題

| 項目             | ホロライブ              | にじさんじ               |
| ---------------- | ----------------------- | ------------------------ |
| 新規タレント対応 | ✅ 自動対応             | ❌ 手動更新が必要        |
| データソース     | APIレスポンスに含まれる | 静的ファイル             |
| タレント識別     | 名前で直接取得          | IDで間接参照             |
| 更新頻度         | リアルタイム            | 手動更新時のみ           |
| エラー処理       | 不要                    | タレント不在時は配信除外 |

### 具体的な影響

**にじさんじで新規タレントが追加された場合**:

1. APIから新規タレントの配信情報は取得される
2. しかし、`livers.json` に該当タレントが存在しない
3. `getNijiEvents` でnullが返され、配信が除外される
4. ユーザーには配信が表示されない
5. コンソールに警告メッセージが出力される

## 解決策の提案

### 短期的な解決策

1. **スクリプトによる静的ファイルの更新**
   - このリポジトリ内でスクリプトを実行
   - にじさんじ公式APIから最新のタレント情報を取得:
     - にじさんじJP: `https://www.nijisanji.jp/api/livers?affiliation=nijisanji`
     - にじさんじEN: `https://www.nijisanji.jp/api/livers?affiliation=nijisanjien`
   - 取得したデータから必要な情報を抽出:
     ```javascript
     // APIレスポンスから簡略化
     {
       [liver.id]: {  // IDをキーに
         name: liver.name,
         enName: liver.enName,
         icon: "", // アイコンパスは別途管理
         group: liver.affiliation
       }
     }
     ```
   - `src/services/nijisanji/sample3/livers.json` を更新
   - アイコン画像を `images.head.url` からダウンロード
     - URLに `&w=88&fm=webp` を追加（ホロライブと同じ88pxサイズ）
     - WebP形式で軽量化
   - `public/icons/` に保存、`icons.json` を更新
   - プロキシAPIの変更は不要

2. **フォールバック処理の実装**
   ```typescript
   function getTalent(id: string) {
     const talent = nijiLiverMap[id];
     if (!talent) {
       // フォールバック: 最低限の情報で表示
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

### 長期的な解決策

1. **GitHub Actionsによる自動更新**
   - 定期的にタレント情報更新スクリプトを実行
   - 変更があれば自動でPRを作成
   - 新規タレント追加を自動検知

2. **キャッシュ戦略の実装**
   - タレント情報をローカルストレージにキャッシュ
   - 定期的にAPIから最新情報を取得
   - 新規タレントが検出された場合は自動更新

3. **統一的なタレント処理**
   - ホロライブとにじさんじで同じ処理フローを採用
   - タレント情報をAPIレスポンスに含める形式に統一

## コード上の該当箇所

- **ホロライブのタレント処理**: `src/services/hololive/index.ts:40-71`
- **にじさんじのタレント処理**: `src/services/api.ts:137-180`
- **静的タレント情報**: `src/services/nijisanji/sample3/livers.json`
- **タレント取得関数**: `src/services/nijisanji/index.ts:25-51`

## まとめ

現在の実装では、ホロライブは新規タレントに自動対応できるが、にじさんじは手動更新が必要という非対称性があります。

**重要な違い**:

- **ホロライブ**: 配信APIにタレント情報が含まれるため、新規タレントも自動的に表示
- **にじさんじ**: 配信APIとタレントAPIが分離しており、タレント情報の事前取得が必要

にじさんじには専用のタレント情報APIが存在するものの、現在は静的ファイルとして保存している実装のため、新規タレント追加時には手動更新が必要です。プロキシAPIを活用してタレント情報を動的に取得する仕組みを構築することで、この問題を解決できるでしょう。
