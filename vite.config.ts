import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  build: {
    rollupOptions: {
      output: {
        // recharts와 리액트 코어 청크 분리로 초기 로딩 최적화
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
        },
      },
    },
  },
  server: {
    port: 5173,
    // TODO: 백엔드 서버 주소 확정 시 프록시 설정
    // proxy: { '/api': { target: 'http://localhost:8000', changeOrigin: true } },
  },
});
