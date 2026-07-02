import { post } from './client';
import { ENDPOINTS } from './endpoints';
import { USE_MOCK } from './config';
import { MOCK_LOGIN } from '@/mocks/commonMocks';
import type { LoginResponse, TokenPair } from '@/types/auth';

/** FNC-AUTH-01 · 카카오 인가 코드 → 서비스 토큰 발급 */
export async function loginWithKakao(code: string): Promise<LoginResponse> {
  if (USE_MOCK) return Promise.resolve(MOCK_LOGIN);
  // TODO: API 명세 확정 후 요청/응답 필드 맞추기
  return post<LoginResponse>(ENDPOINTS.auth.kakaoLogin, { code });
}

export async function refreshTokens(refreshToken: string): Promise<TokenPair> {
  if (USE_MOCK) return Promise.resolve(MOCK_LOGIN.tokens);
  return post<TokenPair>(ENDPOINTS.auth.refresh, { refreshToken });
}

export async function logout(): Promise<void> {
  if (USE_MOCK) return;
  await post(ENDPOINTS.auth.logout);
}
