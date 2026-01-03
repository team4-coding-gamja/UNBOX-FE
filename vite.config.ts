import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "localhost",
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [react()],  // 불필요한 componentTagger 제거
  resolve: {
    alias: {
      // @ 기호를 src 폴더 경로로 매핑 (파일 옮길 때 매우 중요!)
      "@": path.resolve(__dirname, "./src"),
    },
  },
});