import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import unocss from 'unocss/vite';

export default defineConfig({
  plugins: [vue(), unocss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: true,
    port: 5173,
  },
  build: {
    // ECharts 已单独分包并做 tree-shaking（core + 折线/柱状/饼图），519KB 是其精简下限
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          echarts: ['echarts'],
          vue: ['vue', 'vue-router', 'pinia'],
        },
      },
    },
  },
});
