import { create } from 'zustand';
import * as authApi from '@/api/authApi';
import { bindRefreshHandler, bindTokenProvider } from '@/api/client';
import { toast } from './uiStore';
import type { User } from '@/types/auth';

/**
 * FNC-AUTH-01 · 인증 상태. Access Token은 메모리에만 보관.
 * TODO: Refresh Token은 HttpOnly 쿠키 방식 권장 — 백엔드 명세 확정 후 결정.
 */
interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  status: 'idle' | 'authenticating' | 'authenticated' | 'error';
  actions: {
    loginWithKakao: (code: string) => Promise<boolean>;
    logout: () => Promise<void>;
  };
}

const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  status: 'idle',
  actions: {
    loginWithKakao: async (code) => {
      set({ status: 'authenticating' });
      try {
        const res = await authApi.loginWithKakao(code);
        set({
          user: res.user,
          accessToken: res.tokens.accessToken,
          refreshToken: res.tokens.refreshToken,
          status: 'authenticated',
        });
        return true;
      } catch {
        set({ status: 'error' });
        toast('로그인에 실패했습니다. 다시 시도해주세요.');
        return false;
      }
    },
    logout: async () => {
      await authApi.logout().catch(() => undefined);
      set({ user: null, accessToken: null, refreshToken: null, status: 'idle' });
    },
  },
}));

// ===== client.ts 바인딩 (순환 의존 방지) =====
bindTokenProvider(() => useAuthStore.getState().accessToken);
bindRefreshHandler(async () => {
  const { refreshToken } = useAuthStore.getState();
  if (!refreshToken) return false;
  try {
    const tokens = await authApi.refreshTokens(refreshToken);
    useAuthStore.setState({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
    return true;
  } catch {
    useAuthStore.setState({ user: null, accessToken: null, refreshToken: null, status: 'idle' });
    return false;
  }
});

// ===== atomic selectors =====
export const useUser = () => useAuthStore((s) => s.user);
export const useIsAuthenticated = () => useAuthStore((s) => s.status === 'authenticated');
export const useAuthStatus = () => useAuthStore((s) => s.status);
export const useAuthActions = () => useAuthStore((s) => s.actions);
