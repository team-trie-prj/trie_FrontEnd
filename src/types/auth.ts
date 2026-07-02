/** FNC-AUTH-01 · 인증 토큰 발급 및 검증 */
export interface User {
  id: string;
  nickname: string;
  profileImageUrl?: string;
  role: 'admin' | 'worker' | 'viewer';
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: User;
  tokens: TokenPair;
}
