import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/zhenghuo/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // 确保构建输出是干净的
    emptyOutDir: true,
  }
}) 