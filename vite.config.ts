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
  },
  server: {
    port: 5173,
    // TODO: 백엔드 서버 주소 확정 시 프록시 설정
    // proxy: { '/api': { target: 'http://localhost:8000', changeOrigin: true } },
  },
});
