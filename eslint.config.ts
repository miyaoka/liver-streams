import skipFormatting from "@vue/eslint-config-prettier/skip-formatting";
import { defineConfigWithVueTs, vueTsConfigs } from "@vue/eslint-config-typescript";
import { flatConfigs as importXConfigs } from "eslint-plugin-import-x";
import pluginTailwindcss from "eslint-plugin-tailwindcss";
import pluginUnusedImports from "eslint-plugin-unused-imports";
import pluginVue from "eslint-plugin-vue";

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

  // import-x設定
  importXConfigs.recommended,
  importXConfigs.typescript,

  // Prettier（最後に配置）
  skipFormatting,

  // カスタムルール
  {
    plugins: {
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
      // TypeScript が既にチェックしているため不要
      "import-x/no-unresolved": "off",
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
