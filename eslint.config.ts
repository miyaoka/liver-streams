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
    settings: {
      // Workaround: Project References の paths が自動解決されない問題
      // https://github.com/import-js/eslint-import-resolver-typescript/issues/474
      "import-x/resolver": {
        typescript: {
          project: ["tsconfig.app.json", "tsconfig.node.json"],
          // 複数プロジェクト指定は意図的なので警告を抑制
          noWarnOnMultipleProjects: true,
        },
      },
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
