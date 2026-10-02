import { cloudflare } from "@cloudflare/vite-plugin";
import { docBlockPlugin } from "@miyaoka/vite-plugin-doc-block";
import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import vueDevTools from "vite-plugin-vue-devtools";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    open: true,
  },
  plugins: [
    docBlockPlugin(),
    tailwindcss(),
    vue(),
    vueDevTools(),
    // Worker コードを持たない静的アセットのみの構成なので、型生成は不要
    cloudflare({ types: { generate: false } }),
  ],
  resolve: {
    tsconfigPaths: true,
  },
});
