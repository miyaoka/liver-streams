import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    open: true,
  },
  plugins: [
    tailwindcss(),
    react(),
    // Workers の型はルートの check:types の cf workers types だけが生成する
    cloudflare({ types: { generate: false } }),
  ],
  resolve: {
    tsconfigPaths: true,
  },
});
