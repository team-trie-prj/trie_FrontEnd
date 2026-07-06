/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  build: {
    // html2pdf(656KB)·docx 등 내보내기 라이브러리는 버튼 클릭 시에만 로드되는
    // 지연 청크라 초기 로딩과 무관 — 500KB 기본 경고 기준만 상향
    chunkSizeWarningLimit: 700,
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
  test: {
    environment: 'jsdom',
    exclude: ['**/node_modules/**', 'integration/**'],
  },
  server: {
    port: 5173,
    // 백엔드 로컬 기동 시: VITE_API_BASE_URL 미설정(/api) → 아래 프록시가 루트 경로로 전달
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ''),
      },
    },
  },
});
