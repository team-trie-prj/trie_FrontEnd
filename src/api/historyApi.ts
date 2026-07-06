import { del, get, post } from './client';
import { ENDPOINTS } from './endpoints';
import { USE_MOCK } from './config';
import { MOCK_HISTORY } from '@/mocks/commonMocks';
import { mockSearchResponse } from '@/mocks/searchMocks';
import { mapSearchResponse, type ServerSearchData } from './searchDto';
import type { HistoryEntry, HistorySnapshot } from '@/types/history';
import type { SearchResponse } from '@/types/search';

/** FNC-HIS-01 · 히스토리 — API 명세서 history 섹션(GET/POST /history, GET·DELETE /history/{session_uuid}) 기준.
 *  TODO(BE 확인 #4-1): 상세 스키마는 노션 내보내기 Part-2 미포함 — 목록 응답 { session_uuid, query, domain } 화면 캡처 기준 매핑 */

interface ServerHistoryEntry {
  session_uuid: string;
  query: string;
  domain?: string;
  has_image?: boolean;
  created_at?: string;
}

const toEntry = (h: ServerHistoryEntry): HistoryEntry => ({
  sessionId: h.session_uuid,
  queryText: h.query,
  hasImage: Boolean(h.has_image),
  createdAt: h.created_at ?? new Date().toISOString(),
});

/** 검색 성공 시 명시적 기록 (POST /history) — 실패해도 검색 흐름은 막지 않음 */
export function recordHistory(search: SearchResponse, queryText: string, hasImage: boolean) {
  if (USE_MOCK) return;
  void post(ENDPOINTS.history.record, {
    session_uuid: search.sessionId,
    query: queryText,
    domain: 'etc',
    has_image: hasImage,
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
  // TODO(BE 확인 #4-2): 스냅샷 응답 형태 가정 — { session_uuid, query, ..., agent, search } (/search data와 동형)
  const data = await get<ServerHistoryEntry & ServerSearchData>(
    ENDPOINTS.history.snapshot(sessionId),
  );
  const entry = toEntry(data);
  return { entry, search: mapSearchResponse(data, entry.sessionId) };
}

/** 이력 삭제 (DELETE /history/{session_uuid}) */
export async function deleteHistory(sessionId: string): Promise<void> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200));
    return;
  }
  await del(ENDPOINTS.history.remove(sessionId));
}
