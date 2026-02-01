import { resolve } from "node:path";
import dts from "unplugin-dts/vite";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es"],
      fileName: "index",
    },
    outDir: "dist",
    watch: {
      include: ["src/**/*"],
    },
  },
  plugins: [dts({ exclude: ["**/*.test.ts"] })],
});
