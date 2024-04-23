import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  server: {
    proxy: {
      "^/spheron_api": {
        target: "https://api-v2.spheron.network",
        secure: false,
        rewrite: (path) => path.replace(/^\/spheron_api/, ""),
      },
    },
    cors: true,
    port: 5173,
  },
  define: {
    "global": {},
    "ethereum": {}
  },
});
