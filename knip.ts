import type { KnipConfig } from "knip";

const config: KnipConfig = {
  // knip は lint を 2 か所で実行ファイルと誤認する。bun の解決は組み込みコマンドの一覧に
  // lint を持たず、lefthook.yml の `bun lint` を誤認する。pnpm の解決は root に lint
  // スクリプトが無いため、lint:all の `pnpm -r ... lint` を誤認する
  ignoreBinaries: ["lint"],
  workspaces: {
    "packages/core": {
      project: ["src/**/*.ts"],
    },
    "packages/hololive": {
      entry: ["scripts/*.ts"],
      project: ["src/**/*.ts", "scripts/**/*.ts"],
    },
    "packages/nijisanji": {
      entry: ["scripts/*.ts"],
      project: ["src/**/*.ts", "scripts/**/*.ts"],
    },
    "apps/web": {
      project: ["src/**/*.{ts,vue}"],

      ignoreDependencies: [
        // CSS で使用（knip は CSS の @plugin を解析できない）
        "@egoist/tailwindcss-icons",
        "@iconify-json/eva",
        "@iconify-json/icon-park-outline",
        "@iconify-json/icon-park-solid",
        "@iconify-json/mdi",
        // bunfig.toml preload で使用（knip は bun preload を解析できない）
        "@happy-dom/global-registrator",
        "happy-dom",
      ],

      eslint: {
        config: ["eslint.config.ts", "eslint.config.fix.ts", "eslint.base.ts"],
      },
    },
  },
};

export default config;
