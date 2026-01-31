import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import { baseRules } from "./eslint.base";

export default defineConfig(
  // ファイル対象設定
  { files: ["**/*.ts"] },
  // packages と services は各自の eslint.config.ts で lint する
  { ignores: ["dist/**", "node_modules/**", "packages/**", "services/**"] },
  // TypeScript設定
  tseslint.configs.recommended,
  // 共有ルール
  baseRules,
  // tsconfigRootDir: モノレポで複数の tsconfig.json が存在する場合、
  // このパッケージの tsconfig.json を使用するよう明示的に指定
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
);
