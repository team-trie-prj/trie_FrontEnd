import { describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';

vi.mock('@/api/authApi', () => ({
  loginWithKakao: vi.fn(async (code: string) => {
    if (code === 'bad-code') throw new Error('유효하지 않은 인가 코드');
    return {
      user: { id: 'u1', nickname: '김성민', role: 'worker' },
      tokens: { accessToken: 'at-1', refreshToken: 'rt-1' },
    };
  }),
  refreshTokens: vi.fn(async () => {
    throw new Error('Refresh Token 만료');
  }),
  logout: vi.fn(async () => undefined),
}));

import { request } from '@/api/client';
import { useAuthStatus, useUser, useAuthActions } from '@/stores/authStore';

const setup = () =>
  renderHook(() => ({
    user: useUser(),
    status: useAuthStatus(),
    actions: useAuthActions(),
  }));

/** 01_auth.feature — 로그인 성공/실패, 만료 Refresh 차단 시 세션 종료 */
describe('인수: 인증 세션 (FNC-AUTH-01)', () => {
  it('유효한 인가 코드 전달 시 토큰 발급 완료 상태가 된다', async () => {
    const { result } = setup();
    await act(async () => {
      await result.current.actions.loginWithKakao('good-code');
    });
    expect(result.current.status).toBe('authenticated');
    expect(result.current.user?.nickname).toBe('김성민');
  });

  it('만료·위조 Refresh Token이면 재발급이 거부되고 세션이 종료된다(재로그인 요구)', async () => {
    const { result } = setup();
    await act(async () => {
      await result.current.actions.loginWithKakao('good-code');
    });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('x', { status: 401 })));

    await act(async () => {
      await expect(request('/protected')).rejects.toMatchObject({ status: 401 });
    });
    expect(result.current.user).toBeNull();
    expect(result.current.status).toBe('idle');
    vi.unstubAllGlobals();
  });

  it('유효하지 않은 인가 코드는 토큰 미발급 + 실패 사유 노출(error 상태)', async () => {
    const { result } = setup();
    let ok = true;
    await act(async () => {
      ok = await result.current.actions.loginWithKakao('bad-code');
    });
    expect(ok).toBe(false);
    expect(result.current.status).toBe('error');
    expect(result.current.user).toBeNull();
  });
});
