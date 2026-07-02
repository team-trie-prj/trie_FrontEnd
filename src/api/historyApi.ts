import { get } from './client';
import { ENDPOINTS } from './endpoints';
import { USE_MOCK } from './config';
import { MOCK_HISTORY } from '@/mocks/commonMocks';
import { mockSearchResponse } from '@/mocks/searchMocks';
import type { HistoryEntry, HistorySnapshot } from '@/types/history';

/** FNC-HIS-01 · 히스토리 목록 (최대 50, FIFO는 서버 책임) */
export async function listHistory(): Promise<HistoryEntry[]> {
  if (USE_MOCK) return Promise.resolve([...MOCK_HISTORY]);
  return get<HistoryEntry[]>(ENDPOINTS.history.list);
}

/** 복원용 스냅샷 1회성 on-demand fetch — 캐시 없이 새로 호출 */
export async function fetchSnapshot(sessionId: string): Promise<HistorySnapshot> {
  if (USE_MOCK) {
    const entry = MOCK_HISTORY.find((h) => h.sessionId === sessionId) ?? MOCK_HISTORY[0];
    await new Promise((r) => setTimeout(r, 500));
    return { entry, search: mockSearchResponse(entry.queryText, entry.hasImage) };
  }
  return get<HistorySnapshot>(ENDPOINTS.history.snapshot(sessionId));
}
