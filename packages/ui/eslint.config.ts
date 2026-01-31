import skipFormatting from "@vue/eslint-config-prettier/skip-formatting";
import { defineConfigWithVueTs, vueTsConfigs } from "@vue/eslint-config-typescript";
import pluginBetterTailwindcss from "eslint-plugin-better-tailwindcss";
import pluginImportX from "eslint-plugin-import-x";
import pluginUnusedImports from "eslint-plugin-unused-imports";
import pluginVue from "eslint-plugin-vue";
import type { ESLint } from "eslint";

export default defineConfigWithVueTs(
  // ignores 設定
  { ignores: ["dist/**", "node_modules/**"] },

  // Vue推奨設定
  pluginVue.configs["flat/essential"],

  // TypeScript設定
  vueTsConfigs.recommended,

  // Tailwind設定
  {
    ...pluginBetterTailwindcss.configs.recommended,
    settings: {
      "better-tailwindcss": {
        entryPoint: "src/assets/main.css",
      },
    },
  },

  // Prettier（最後に配置）
  skipFormatting,

  // カスタムルール
  {
    plugins: {
      // eslint-plugin-import-x の型が @typescript-eslint/utils の型を使用しており、
      // ESLint の defineConfig 型と互換性がない (typescript-eslint/typescript-eslint#11543)
      "import-x": pluginImportX as unknown as ESLint.Plugin,
      "unused-imports": pluginUnusedImports,
    },
    rules: {
      // Vue
      "vue/no-ref-as-operand": "error",
      "vue/multi-word-component-names": "warn",

      // unused-imports
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "warn",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],

      // import-x
      "import-x/no-duplicates": "warn",
      // 保存時の自動 lint で並び替えが発生すると編集中に邪魔なので off
      // lint:fix や pre-commit hook では eslint.config.fix.ts で有効化
      "import-x/order": [
        "off",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
            "object",
            "type",
          ],
          pathGroupsExcludedImportTypes: ["builtin", "external", "type"],
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],

      // Tailwind
      // 各ルールは独立したワーカーで Tailwind Design System をロードするため、
      // 有効なルール数に比例して初期化コストが増加する（1ルールあたり約1秒）
      "better-tailwindcss/no-unknown-classes": [
        "warn",
        {
          ignore: ["_.*"],
        },
      ],
      // lint 実行に時間がかかるため off
      // このルールは初回呼び出しで全クラスのシグネチャを計算するため、
      // iconify のように大量のクラスがある場合に重くなる
      "better-tailwindcss/enforce-canonical-classes": "off",
      // Prettier と競合するため off
      // このルールはクラスを複数行に分割するが、Prettier が単一行に戻す
      "better-tailwindcss/enforce-consistent-line-wrapping": "off",
      // Prettier と競合するため off
      // VSCode で formatOnSave と source.fixAll を両方有効にしていると、
      // Prettier と ESLint が同時にファイルを編集して文字が消えることがある
      // 例: "flex  items-center" → "flex tems-center"
      "better-tailwindcss/no-unnecessary-whitespace": "off",
    },
  },
);
