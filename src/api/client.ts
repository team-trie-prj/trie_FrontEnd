import { API_BASE_URL } from './config';
import { newSessionId } from '@/utils/uuid';

/** 공통 fetch 래퍼 (FNC-AUTH-01 / FNC-SRC-03)
 *  서버 응답은 { success, code, message, data } 공통 래퍼(Envelope)로 온다. */

export interface Envelope<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
}

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
    public code?: string,
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

export async function requestEnvelope<T>(
  path: string,
  init: RequestInit = {},
  retried = false,
): Promise<Envelope<T>> {
  const res = await fetch(API_BASE_URL + path, {
    ...init,
    headers: buildHeaders(init),
    cache: 'no-store',
  });

  if (res.status === 401) {
    if (!retried && (await tryRefresh())) return requestEnvelope<T>(path, init, true);
    throw new ApiError(401, '인증이 만료되었습니다. 다시 로그인해주세요.', 'UNAUTHORIZED');
  }

  const body = (await res.json().catch(() => null)) as Envelope<T> | null;
  if (!body) {
    if (!res.ok) throw new ApiError(res.status, res.statusText);
    throw new ApiError(res.status, '서버 응답 형식이 올바르지 않습니다.');
  }
  if (!res.ok || body.success === false) {
    throw new ApiError(res.status, body.message || res.statusText, body.code);
  }
  return body;
}

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  return (await requestEnvelope<T>(path, init)).data;
}

export const get = <T>(path: string) => request<T>(path);

export const post = <T>(path: string, body?: unknown) =>
  request<T>(path, {
    method: 'POST',
    body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
  });

export const postEnvelope = <T>(path: string, body?: unknown) =>
  requestEnvelope<T>(path, {
    method: 'POST',
    body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
  });

export const patch = <T>(path: string, body?: unknown) =>
  request<T>(path, { method: 'PATCH', body: JSON.stringify(body ?? {}) });

export const del = <T>(path: string) => request<T>(path, { method: 'DELETE' });
