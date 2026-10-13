# @liver-streams/web

VTuber 配信情報アプリケーションのフロントエンド。Vue（TSX）+ Vite で構築し、Cloudflare Workers で配信する。

## 開発コマンド

```bash
pnpm dev         # 開発サーバー起動（http://localhost:5173）
pnpm build       # ビルド
pnpm preview     # ビルドプレビュー
```

チェック（型チェック・lint・format・テスト）はリポジトリルートで実行する。

## ディレクトリ構造

- `src/features/<機能>/` - 機能ごとのコンポーネント・store・composable。外からは各ディレクトリの `index.ts`（barrel）を通して import する
- `src/shared/` - features から使う共通部品（`composables` / `lib` / `services` / `stores` / `utils`）。shared から features は import しない（barrel-import ルールで強制）
- `src/views/` - ページコンポーネント
- `src/router/` - Vue Router 設定
- `src/assets/main.css` - Tailwind のエントリ。コンポーネント用の CSS もここから読み込む
- `worker/` - Cloudflare Worker。`/api/*` を処理し、CORS を許可しないにじさんじ API を同じオリジンへ中継する
