import skipFormatting from "@vue/eslint-config-prettier/skip-formatting";
import { defineConfigWithVueTs, vueTsConfigs } from "@vue/eslint-config-typescript";
import pluginImportX from "eslint-plugin-import-x";
import pluginTailwindcss from "eslint-plugin-tailwindcss";
import pluginUnusedImports from "eslint-plugin-unused-imports";
import pluginVue from "eslint-plugin-vue";
import type { ESLint } from "eslint";

export default defineConfigWithVueTs(
  // ファイル対象設定
  { files: ["**/*.{ts,vue}"] },
  { ignores: ["dist/**", "node_modules/**"] },

  // Vue推奨設定
  pluginVue.configs["flat/essential"],

  // TypeScript設定
  vueTsConfigs.recommended,

  // Tailwind設定
  ...pluginTailwindcss.configs["flat/recommended"],

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
      "import-x/order": [
        "warn",
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
          pathGroupsExcludedImportTypes: ["builtin"],
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],

      // Tailwind
      "tailwindcss/no-custom-classname": [
        "warn",
        {
          whitelist: ["_.*"],
        },
      ],
    },
  },
);
