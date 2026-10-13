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
    // defineVaporComponent の中だけを Vapor にし、外側は仮想 DOM のまま扱う
    vueJsxVapor({ interop: true }),
    vueDevTools(),
    // Workers の型はルートの check:types の cf workers types だけが生成する
    cloudflare({ types: { generate: false } }),
  ],
  resolve: {
    tsconfigPaths: true,
  },
});
