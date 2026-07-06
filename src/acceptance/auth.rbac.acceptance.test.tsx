import { describe, expect, it, vi } from 'vitest';
import { act, render, renderHook, screen, cleanup } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

let mockRole: 'admin' | 'worker' = 'worker';
vi.mock('@/api/authApi', () => ({
  loginWithKakao: vi.fn(async () => ({
    user: { id: 'u1', nickname: '테스터', role: mockRole },
    tokens: { accessToken: 'at', refreshToken: 'rt' },
  })),
  refreshTokens: vi.fn(async () => ({ accessToken: 'at2', refreshToken: 'rt2' })),
  logout: vi.fn(async () => undefined),
}));

import RequireAuth from '@/components/layout/RequireAuth';
import RequireRole from '@/components/layout/RequireRole';
import { useAuthActions } from '@/stores/authStore';

/** App.tsx 가드 구조 복제 */
function Guarded({ initialPath }: { initialPath: string }) {
  return (
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<div>LOGIN_PAGE</div>} />
        <Route element={<RequireAuth />}>
          <Route path="/" element={<div>SEARCH_OK</div>} />
          <Route element={<RequireRole roles={['admin', 'worker']} />}>
            <Route path="/data" element={<div>DATA_OK</div>} />
          </Route>
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

const loginAs = async (role: 'admin' | 'worker') => {
  mockRole = role;
  const { result } = renderHook(() => useAuthActions());
  await act(async () => {
    await result.current.loginWithKakao('code');
  });
};
const logout = async () => {
  const { result } = renderHook(() => useAuthActions());
  await act(async () => {
    await result.current.logout();
  });
};

/** 01_auth.feature @FNC-AUTH-01-RBAC Scenario Outline */
describe('인수: RBAC 보호 라우트 접근 제어', () => {
  it('비로그인 → 통합 검색 화면 차단(로그인으로 리다이렉트)', async () => {
    await logout();
    render(<Guarded initialPath="/" />);
    expect(screen.getByText('LOGIN_PAGE')).toBeDefined();
    expect(screen.queryByText('SEARCH_OK')).toBeNull();
    cleanup();
  });

  it('실무자 → 통합 검색 화면 허용', async () => {
    await loginAs('worker');
    render(<Guarded initialPath="/" />);
    expect(screen.getByText('SEARCH_OK')).toBeDefined();
    cleanup();
  });

  it('관리자 → 데이터 관리 화면 허용', async () => {
    await loginAs('admin');
    render(<Guarded initialPath="/data" />);
    expect(screen.getByText('DATA_OK')).toBeDefined();
    cleanup();
  });

  // 협의 확정(2026-07-06): 기능명세서(78행) 기준 허용 — 인수 기준 문서 수정 요청 발행
  it('실무자 → 데이터 관리 화면 허용 (협의 확정)', async () => {
    await loginAs('worker');
    render(<Guarded initialPath="/data" />);
    expect(screen.getByText('DATA_OK')).toBeDefined();
    cleanup();
  });
});
