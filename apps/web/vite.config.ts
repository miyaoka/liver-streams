import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import vueJsx from "@vitejs/plugin-vue-jsx";
import { defineConfig } from "vite";
import vueDevTools from "vite-plugin-vue-devtools";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    open: true,
  },
  plugins: [
    tailwindcss(),
    vueJsx(),
    vueDevTools(),
    // Workers の型はルートの check:types の cf workers types だけが生成する
    cloudflare({ types: { generate: false } }),
  ],
  resolve: {
    tsconfigPaths: true,
  },
});
