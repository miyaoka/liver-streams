import { defineConfig } from "cf/config";

export default defineConfig({
  worker: {
    name: "liver-streams",
    compatibilityDate: "2026-09-25",
    assets: { notFoundHandling: "single-page-application" },
  },
});
