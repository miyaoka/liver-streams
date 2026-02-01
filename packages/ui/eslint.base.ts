import type { ESLint, Linter } from "eslint";
import pluginImportX from "eslint-plugin-import-x";
import pluginUnusedImports from "eslint-plugin-unused-imports";

// 共有ルール設定（TypeScript 設定は各パッケージで行う）
export const baseRules: Linter.Config = {
  plugins: {
    // eslint-plugin-import-x の型が @typescript-eslint/utils の型を使用しており、
    // ESLint の defineConfig 型と互換性がない (typescript-eslint/typescript-eslint#11543)
    "import-x": pluginImportX as unknown as ESLint.Plugin,
    "unused-imports": pluginUnusedImports,
  },
  rules: {
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
        groups: ["builtin", "external", "internal", "parent", "sibling", "index", "object"],
        pathGroupsExcludedImportTypes: ["builtin", "external", "type"],
        alphabetize: { order: "asc", caseInsensitive: true },
      },
    ],
  },
};
