import skipFormatting from "@vue/eslint-config-prettier/skip-formatting";
import { defineConfigWithVueTs, vueTsConfigs } from "@vue/eslint-config-typescript";
import pluginBetterTailwindcss from "eslint-plugin-better-tailwindcss";
import pluginVue from "eslint-plugin-vue";
import { baseRules } from "./eslint.base";

export default defineConfigWithVueTs(
  // ignores 設定
  { ignores: ["dist/**", "node_modules/**"] },

  // Vue推奨設定
  pluginVue.configs["flat/essential"],

  // TypeScript設定（Vue 用、tseslint.configs.recommended の代わり）
  vueTsConfigs.recommended,

  // 共有ルール（推奨設定より後に配置し、カスタムルールを優先）
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

  // Tailwind設定
  {
    ...pluginBetterTailwindcss.configs.recommended,
    settings: {
      "better-tailwindcss": {
        entryPoint: "src/assets/main.css",
      },
    },
  },

  // フォーマット系ルール無効化（最後に配置）
  skipFormatting,

  // Vue と Tailwind のカスタムルール
  {
    rules: {
      // Vue
      "vue/no-ref-as-operand": "error",
      "vue/multi-word-component-names": "warn",

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
      // フォーマッタと競合するため off
      // このルールはクラスを複数行に分割するが、フォーマッタが単一行に戻す
      "better-tailwindcss/enforce-consistent-line-wrapping": "off",
      // フォーマッタと競合するため off
      // VSCode で formatOnSave と source.fixAll を両方有効にしていると、
      // フォーマッタと ESLint が同時にファイルを編集して文字が消えることがある
      // 例: "flex  items-center" → "flex tems-center"
      "better-tailwindcss/no-unnecessary-whitespace": "off",
    },
  },
);
