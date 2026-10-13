import type { KnipConfig } from "knip";

const config: KnipConfig = {
  // bun の組み込みサブコマンド（knip は外部バイナリとして扱う）
  ignoreBinaries: ["check", "lint", "fmt"],
  workspaces: {
    ".": {
      // oxlint を依存に持たないため自動では有効にならない。.oxlintrc.json の jsPlugins を依存として解決させる
      oxlint: true,
      // typescript を依存に持たないため自動では有効にならない。tsconfig の extends を依存として解決させる
      typescript: true,
    },
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
      project: ["src/**/*.{ts,tsx,css}"],
      typescript: true,

      ignoreDependencies: [
        // @egoist/tailwindcss-icons が CSS の @plugin 経由で読む（knip は辿れない）
        "@iconify-json/eva",
        "@iconify-json/icon-park-outline",
        "@iconify-json/icon-park-solid",
        "@iconify-json/mdi",
      ],
    },
  },
};

export default config;
