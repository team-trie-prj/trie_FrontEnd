import { afterEach, describe, expect, it, vi } from 'vitest';
import { bindRefreshHandler, bindTokenProvider, request } from '@/api/client';

/** 01_auth.feature @FNC-AUTH-01 — Access Token 만료 시 Silent Refresh 재발급 */
describe('인수: Silent Refresh (FNC-AUTH-01)', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('보호 API 401 응답 시 백그라운드 재발급 후 동일 요청을 1회 재시도한다', async () => {
    let token = 'expired-token';
    bindTokenProvider(() => token);
    bindRefreshHandler(async () => {
      token = 'refreshed-token';
      return true;
    });
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('unauthorized', { status: 401 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ success: true, code: 'OK', message: '', data: { ok: true } }),
          { status: 200 },
        ),
      );
    vi.stubGlobal('fetch', fetchMock);

    const data = await request<{ ok: boolean }>('/protected');

    expect(data.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const retryHeaders = fetchMock.mock.calls[1][1].headers as Headers;
    expect(retryHeaders.get('Authorization')).toBe('Bearer refreshed-token');
  });

  it('재발급 실패 시 요청은 401로 종료되어 재로그인이 요구된다', async () => {
    bindTokenProvider(() => 'expired');
    bindRefreshHandler(async () => false);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('x', { status: 401 })));

    await expect(request('/protected')).rejects.toMatchObject({ status: 401 });
  });
});
