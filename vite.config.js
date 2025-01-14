import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/', // 因为是 username.github.io，所以使用根路径 '/'
  build: {
    outDir: 'dist'
  }
}) 