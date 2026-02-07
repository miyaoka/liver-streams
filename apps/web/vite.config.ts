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
  plugins: [docBlockPlugin(), tailwindcss(), vue(), vueDevTools()],
  resolve: {
    tsconfigPaths: true,
  },
});
