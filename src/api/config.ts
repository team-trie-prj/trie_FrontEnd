/** API 설정 — 백엔드 API 명세서 확정 전까지 mock 모드로 동작. */
export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL || '/api';

export const USE_MOCK: boolean = (import.meta.env.VITE_USE_MOCK ?? 'true') === 'true';

export const KAKAO_CLIENT_ID: string = import.meta.env.VITE_KAKAO_CLIENT_ID ?? '';
export const KAKAO_REDIRECT_URI: string =
  import.meta.env.VITE_KAKAO_REDIRECT_URI ?? window.location.origin + '/oauth/kakao/callback';
