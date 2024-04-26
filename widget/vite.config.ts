import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, "./src/widget.tsx"),
      output: {
        format: "iife",
        dir: resolve(__dirname, "./dist"),
        entryFileNames: "widget.js",
        assetFileNames: "style.css",
      },
    },
  },
});
