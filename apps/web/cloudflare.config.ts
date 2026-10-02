import { defineConfig } from "cf/config";

export default defineConfig({
  worker: {
    name: "liver-streams",
    // Worker のコードは tsconfig.worker.json で型検査するため、import せずパスで渡す
    entrypoint: "./worker/index.ts",
    compatibilityDate: "2026-09-25",
    assets: {
      notFoundHandling: "single-page-application",
      // ブラウザのアドレスバーから開いた場合も SPA の index.html ではなく Worker が応答する
      runWorkerFirst: ["/api/*"],
    },
  },
});
