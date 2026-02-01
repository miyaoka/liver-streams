import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import { docBlockPlugin } from "vite-plugin-doc-block";
import vueDevTools from "vite-plugin-vue-devtools";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [docBlockPlugin(), tailwindcss(), vue(), vueDevTools()],
  resolve: {
    tsconfigPaths: true,
  },
});
