/** 백엔드 API 명세(2026-07 APISpec) 기준 실경로.
 *  서버 미배포 상태 — VITE_USE_MOCK=false 전환 시 사용. 공백 항목은 docs/백엔드_연동_질의_2026-07-06.md 참조. */
export const ENDPOINTS = {
  auth: {
    kakaoLogin: '/auth/kakao', // POST { code, redirect_uri? } — 백엔드 구현 확정
    refresh: '/auth/refresh', // POST { refresh_token }
    logout: '/auth/logout', // POST (Bearer)
    me: '/auth/me', // GET — 새로고침 시 인증 확인
  },
  session: {
    issue: '/sessions', // POST → { session_uuid } (선발급 불필요 — /search가 X-Session-Id 헤더로 세션 확정)
  },
  search: {
    query: '/api/v1/search', // POST multipart(text, domain, image?, skip_clarify) — raw 응답, search=null이면 CLARIFY
    analyze: '/api/v1/search/analyze', // POST multipart — raw AnalyzeResponse
    promptCheck: '/security/prompt-check', // POST { text } → { flagged, matches } (Envelope)
  },
  data: {
    upload: '/documents', // POST multipart files[] (+domain) — Ingest/bulk 제거, 단일 창구 확정
    list: '/documents', // GET
    remove: (id: string) => `/documents/${id}`, // DELETE (정식 명세 반영됨)
    detail: (id: string) => `/document/${id}`, // GET
  },
  catalog: {
    register: '/public-data/catalog', // POST — 등록 (연동 테스트는 fetchTest로 별도)
    list: '/public-data/catalog', // GET — 카탈로그 배열 (백엔드 구현 확정; 명세 문서의 /public-data는 미구현)
    remove: (id: string) => `/public-data/catalog/${id}`, // DELETE
    fetchTest: (id: string) => `/public-data/${id}/fetch`, // POST { entities } — 연동 테스트 (명세 PATCH → 구현 POST)
  },
  apiKeys: {
    upsert: '/api-keys', // POST { name, provider, secret, description }
    list: '/api-keys', // GET
    remove: (name: string) => `/api-keys/${name}`, // DELETE
  },
  report: {
    generate: '/api/v1/reports', // POST { query, domain, report_type, session_id } — raw 단건 응답
    byId: (id: string) => `/api/v1/reports/${id}`, // GET
  },
  system: {
    health: '/system', // GET
  },
  history: {
    list: '/history', // GET — 이력 목록
    record: '/history', // POST — 명시적 기록 (검색 성공 시)
    snapshot: (sessionId: string) => `/history/${sessionId}`, // GET — 스냅샷 복원(질의+검색 결과)
    remove: (sessionId: string) => `/history/${sessionId}`, // DELETE — 이력 삭제
  },
} as const;
