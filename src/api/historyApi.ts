import { del, get, post } from './client';
import { ENDPOINTS } from './endpoints';
import { USE_MOCK } from './config';
import { MOCK_HISTORY } from '@/mocks/commonMocks';
import { mockSearchResponse } from '@/mocks/searchMocks';
import { mapSearchResponse, type ServerSearchData } from './searchDto';
import type { HistoryEntry, HistorySnapshot } from '@/types/history';

/** FNC-HIS-01 · 히스토리 — 확정 명세(2026-07-06 CSV 내보내기) 기준.
 *  기록(POST)은 result_snapshot(검색 결과 원본) 포함, 복원(GET)은 result_snapshot을 되돌려준다. */

interface ServerHistoryEntry {
  session_uuid: string;
  query: string;
  domain?: string;
  created_at?: string;
}

interface ServerHistorySnapshot extends ServerHistoryEntry {
  result_snapshot: ServerSearchData;
}

const toEntry = (h: ServerHistoryEntry): HistoryEntry => ({
  sessionId: h.session_uuid,
  queryText: h.query,
  hasImage: false, // 명세에 이미지 여부 필드 없음 — 스냅샷 복원으로 대체
  createdAt: h.created_at ?? new Date().toISOString(),
});

/** 검색 성공 시 명시적 기록 (POST /history) — 서버 원본 결과를 result_snapshot으로 동봉.
 *  실패해도 검색 흐름은 막지 않는다. */
export function recordHistory(sessionId: string, queryText: string, snapshot: ServerSearchData) {
  if (USE_MOCK) return;
  void post(ENDPOINTS.history.record, {
    session_uuid: sessionId,
    query: queryText,
    domain: snapshot.agent?.domain ?? 'etc',
    result_snapshot: snapshot,
  }).catch(() => undefined);
}

export async function listHistory(): Promise<HistoryEntry[]> {
  if (USE_MOCK) return Promise.resolve([...MOCK_HISTORY]);
  return (await get<ServerHistoryEntry[]>(ENDPOINTS.history.list)).map(toEntry);
}

/** 복원용 스냅샷 1회성 on-demand fetch — 캐시 없이 새로 호출 (질의 + 검색 결과) */
export async function fetchSnapshot(sessionId: string): Promise<HistorySnapshot> {
  if (USE_MOCK) {
    const entry = MOCK_HISTORY.find((h) => h.sessionId === sessionId) ?? MOCK_HISTORY[0];
    await new Promise((r) => setTimeout(r, 500));
    return { entry, search: mockSearchResponse(entry.queryText, entry.hasImage) };
  }
  const data = await get<ServerHistorySnapshot>(ENDPOINTS.history.snapshot(sessionId));
  const entry = toEntry(data);
  return { entry, search: mapSearchResponse(data.result_snapshot, entry.sessionId) };
}

/** 이력 삭제 (DELETE /history/{session_uuid}) */
export async function deleteHistory(sessionId: string): Promise<void> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200));
    return;
  }
  await del(ENDPOINTS.history.remove(sessionId));
}
