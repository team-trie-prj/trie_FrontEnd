/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import path from 'node:path';

// 백엔드 통합 테스트 — 로컬 trie_backend 기동 후 `npm run test:integration`
export default defineConfig({
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  test: {
    environment: 'node',
    include: ['integration/**/*.test.ts'],
    testTimeout: 30000,
    hookTimeout: 30000,
    fileParallelism: false,
  },
});
