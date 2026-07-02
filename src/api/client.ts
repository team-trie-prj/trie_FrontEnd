import { API_BASE_URL } from './config';
import { newSessionId } from '@/utils/uuid';

/**
 * 공통 fetch 래퍼 (FNC-AUTH-01 / FNC-SRC-03)
 * - Authorization: Bearer <accessToken> 자동 부착
 * - X-Session-Id: 매 호출 고유 UUID · Cache-Control: no-cache 강제
 * - 401 수신 시 Refresh Token 재발급 후 1회 재시도
 */

let getToken: () => string | null = () => null;
let tryRefresh: () => Promise<boolean> = async () => false;

export function bindTokenProvider(fn: () => string | null) {
  getToken = fn;
}
export function bindRefreshHandler(fn: () => Promise<boolean>) {
  tryRefresh = fn;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

function buildHeaders(init: RequestInit): Headers {
  const headers = new Headers(init.headers);
  headers.set('Cache-Control', 'no-cache');
  headers.set('X-Session-Id', newSessionId());
  if (!(init.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return headers;
}

export async function request<T>(path: string, init: RequestInit = {}, retried = false): Promise<T> {
  const res = await fetch(API_BASE_URL + path, {
    ...init,
    headers: buildHeaders(init),
    cache: 'no-store',
  });

  if (res.status === 401) {
    if (!retried && (await tryRefresh())) return request<T>(path, init, true);
    throw new ApiError(401, '인증이 만료되었습니다. 다시 로그인해주세요.');
  }
  if (!res.ok) throw new ApiError(res.status, await res.text().catch(() => res.statusText));
  return (await res.json()) as T;
}

export const get = <T>(path: string) => request<T>(path);
export const post = <T>(path: string, body?: unknown) =>
  request<T>(path, {
    method: 'POST',
    body: body instanceof FormData ? body : JSON.stringify(body ?? {}),
  });
