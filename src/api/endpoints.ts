/** ⚠️ API 명세서 미확정 — 아래 경로는 자리표시자(placeholder)입니다. */
export const ENDPOINTS = {
  auth: {
    kakaoLogin: '/auth/kakao', // POST { code } → LoginResponse
    refresh: '/auth/refresh', // POST { refreshToken } → TokenPair
    logout: '/auth/logout', // POST
  },
  search: {
    query: '/search/query', // POST { text, imageBase64? } → SearchResponse
    route: '/search/route', // POST (FNC-SRC-02 라우팅/템플릿 제안)
  },
  data: {
    upload: '/documents/upload', // POST multipart (PDF/DOCX ≤ 20MB)
    list: '/documents', // GET
  },
  catalog: {
    register: '/catalog/apis', // POST CatalogRegisterRequest (등록+연동 테스트)
    list: '/catalog/apis', // GET
  },
  report: {
    generate: '/reports/generate', // POST (SSE/stream 마크다운)
  },
  history: {
    list: '/history', // GET → HistoryEntry[] (최대 50, FIFO)
    snapshot: (sessionId: string) => `/history/${sessionId}`, // GET → HistorySnapshot
  },
} as const;
