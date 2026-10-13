import type { KnipConfig } from "knip";

const config: KnipConfig = {
  // bun の組み込みサブコマンド（knip は外部バイナリとして扱う）
  ignoreBinaries: ["check", "lint", "fmt"],
  workspaces: {
    ".": {
      // .oxlintrc.json の jsPlugins で使用（knip は jsPlugins を解析できない）
      ignoreDependencies: [
        "@miyaoka/eslint-plugin-barrel-import",
        "eslint-plugin-better-tailwindcss",
      ],
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
