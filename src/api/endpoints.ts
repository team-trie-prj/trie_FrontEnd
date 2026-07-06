/** 백엔드 API 명세(2026-07 APISpec) 기준 실경로.
 *  서버 미배포 상태 — VITE_USE_MOCK=false 전환 시 사용. 공백 항목은 docs/백엔드_연동_질의_2026-07-06.md 참조. */
export const ENDPOINTS = {
  auth: {
    kakaoLogin: '/auth/kakao', // GET + 쿼리(code, redirect_uri) — 2026-07-06 개정 명세로 확정
    refresh: '/auth/refresh', // POST { refresh_token }
    logout: '/auth/logout', // POST (Bearer)
    me: '/auth/me', // GET — 새로고침 시 인증 확인
  },
  session: {
    issue: '/sessions', // POST → { session_uuid } (검색 세션 UUID 서버 발급)
  },
  search: {
    query: '/search', // POST multipart(text, domain, image?) — CLARIFY(역제안) 포함
    analyze: '/search/analyze', // POST multipart — VLM 시각 맥락 + 통합 질의
    promptCheck: '/security/prompt-check', // POST — body 명세 미기재 (BE 확인 #2)
  },
  data: {
    upload: '/documents', // POST multipart files[] (+domain) — Ingest/bulk 제거, 단일 창구 확정
    list: '/documents', // GET
    remove: (id: string) => `/documents/${id}`, // DELETE (정식 명세 반영됨)
    detail: (id: string) => `/document/${id}`, // GET
  },
  catalog: {
    register: '/public-data/catalog', // POST — 등록 (연동 테스트는 fetchTest로 별도)
    list: '/public-data', // GET — 목록 응답 스키마 미기재 (BE 확인 #3)
    remove: (id: string) => `/public-data/catalog/${id}`, // DELETE
    fetchTest: (id: string) => `/public-data/${id}/fetch`, // PATCH { entities } — 연동 테스트
  },
  apiKeys: {
    upsert: '/api-keys', // POST { name, provider, secret, description }
    list: '/api-keys', // GET
    remove: (name: string) => `/api-keys/${name}`, // DELETE
  },
  report: {
    generate: '/reports', // POST { query, domain, report_type, session_id } — 단건 응답(SSE 아님)
    byId: (id: string) => `/reports/${id}`, // GET
  },
  system: {
    health: '/system', // GET
  },
  // history: BE 미제공 — 목록/스냅샷 API 필요 (BE 확인 #4). 전까지 클라이언트 로컬 보관.
} as const;
