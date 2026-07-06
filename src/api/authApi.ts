import { get, post } from './client';
import { ENDPOINTS } from './endpoints';
import { KAKAO_REDIRECT_URI, USE_MOCK } from './config';
import { MOCK_LOGIN } from '@/mocks/commonMocks';
import type { LoginResponse, TokenPair, User } from '@/types/auth';

/** /auth/* 서버 DTO */
interface ServerUser {
  id: number;
  name: string;
  email: string | null;
  provider: string;
  role?: string; // TODO(BE 확인 #8): RBAC 권한 필드 명세 없음 — 기본 worker 처리
}
interface ServerTokens {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
  user?: ServerUser;
}

const toUser = (u: ServerUser): User => ({
  id: String(u.id),
  nickname: u.name,
  role: u.role === 'admin' || u.role === 'viewer' ? u.role : 'worker',
});

/** FNC-AUTH-01 · 카카오 인가 코드 → 서비스 토큰 발급 (POST — 백엔드 구현 확정) */
export async function loginWithKakao(code: string): Promise<LoginResponse> {
  if (USE_MOCK) return Promise.resolve(MOCK_LOGIN);
  const data = await post<ServerTokens>(ENDPOINTS.auth.kakaoLogin, {
    code,
    redirect_uri: KAKAO_REDIRECT_URI,
  });
  return {
    user: data.user ? toUser(data.user) : { id: '0', nickname: '사용자', role: 'worker' },
    tokens: { accessToken: data.access_token, refreshToken: data.refresh_token ?? '' },
  };
}

/** Silent Refresh — 서버는 refresh_token을 회전하지 않으므로 기존 값을 유지한다 */
export async function refreshTokens(refreshToken: string): Promise<TokenPair> {
  if (USE_MOCK) return Promise.resolve(MOCK_LOGIN.tokens);
  const data = await post<ServerTokens>(ENDPOINTS.auth.refresh, { refresh_token: refreshToken });
  return { accessToken: data.access_token, refreshToken: data.refresh_token ?? refreshToken };
}

export async function logout(): Promise<void> {
  if (USE_MOCK) return;
  await post(ENDPOINTS.auth.logout);
}

/** 새로고침 등에서 세션 확인용 (GET /auth/me) */
export async function fetchMe(): Promise<User> {
  const data = await get<{ user: ServerUser }>(ENDPOINTS.auth.me);
  return toUser(data.user);
}
