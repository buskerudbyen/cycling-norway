import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, './src/widget.tsx'),
      output: {
        format: 'iife',
        dir: resolve(__dirname, './dist'),
        entryFileNames: 'widget.js',
        assetFileNames: 'style.css',
      },
    },
  },
})
