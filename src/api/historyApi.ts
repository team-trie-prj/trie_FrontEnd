import { del, get } from './client';
import { ENDPOINTS } from './endpoints';
import { USE_MOCK } from './config';
import { MOCK_HISTORY } from '@/mocks/commonMocks';
import { mockSearchResponse } from '@/mocks/searchMocks';
import { mapSearchResponse, type ServerSearchData } from './searchDto';
import type { HistoryEntry, HistorySnapshot } from '@/types/history';

/** FNC-HIS-01 · 히스토리 — 기록은 백엔드 미들웨어가 /api/v1/search·reports 응답을 X-Session-Id 기준
 *  자동 로깅(명시적 POST 불필요). 복원(GET)은 result_snapshot(+report_snapshot)을 되돌려준다. */

interface ServerHistoryEntry {
  session_uuid: string;
  query: string;
  domain?: string;
  created_at?: string;
}

interface ServerHistorySnapshot extends ServerHistoryEntry {
  result_snapshot: (ServerSearchData & { session_id?: string | null }) | null;
  report_snapshot?: { content?: string; report_type?: string; created_at?: string } | null;
}

const toEntry = (h: ServerHistoryEntry): HistoryEntry => ({
  sessionId: h.session_uuid,
  queryText: h.query,
  hasImage: false, // 명세에 이미지 여부 필드 없음 — 스냅샷 복원으로 대체
  createdAt: h.created_at ?? new Date().toISOString(),
});

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
  if (!data.result_snapshot?.agent) {
    throw new Error('복원 가능한 검색 스냅샷이 없습니다.');
  }
  const report = data.report_snapshot?.content
    ? {
        markdown: data.report_snapshot.content,
        templateId: data.report_snapshot.report_type ?? 'safety-check',
        insufficientData: false,
        generatedAt: data.report_snapshot.created_at ?? entry.createdAt,
      }
    : undefined;
  return { entry, search: mapSearchResponse(data.result_snapshot, entry.sessionId), report };
}

/** 이력 삭제 (DELETE /history/{session_uuid}) */
export async function deleteHistory(sessionId: string): Promise<void> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200));
    return;
  }
  await del(ENDPOINTS.history.remove(sessionId));
}
