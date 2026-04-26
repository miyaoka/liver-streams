import type { KnipConfig } from "knip";

const config: KnipConfig = {
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
