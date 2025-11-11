// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        // nếu backend không cần cookie thì có thể bỏ credentials ở client
        // rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
