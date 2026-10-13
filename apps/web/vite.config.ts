import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import vueDevTools from "vite-plugin-vue-devtools";
import vueJsxVapor from "vue-jsx-vapor/vite";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    open: true,
  },
  plugins: [
    tailwindcss(),
    vueJsxVapor(),
    vueDevTools(),
    // Workers の型はルートの check:types の cf workers types だけが生成する
    cloudflare({ types: { generate: false } }),
  ],
  resolve: {
    tsconfigPaths: true,
  },
});
