import { defineConfig } from "cf/config";
import * as entrypoint from "./worker/index.ts" with { type: "cf-worker" };

export default defineConfig({
  worker: {
    name: "liver-streams",
    entrypoint,
    compatibilityDate: "2026-09-25",
    observability: { enabled: true },
    assets: {
      notFoundHandling: "single-page-application",
      // ブラウザのアドレスバーから開いた場合も SPA の index.html ではなく Worker が応答する
      runWorkerFirst: ["/api/*"],
    },
  },
});
