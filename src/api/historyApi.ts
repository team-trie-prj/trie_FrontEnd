import { USE_MOCK } from './config';
import { MOCK_HISTORY } from '@/mocks/commonMocks';
import { mockSearchResponse } from '@/mocks/searchMocks';
import type { HistoryEntry, HistorySnapshot } from '@/types/history';
import type { SearchResponse } from '@/types/search';

/** FNC-HIS-01 · 히스토리.
 *  TODO(BE 확인 #4): 목록/스냅샷 API가 명세에 없음 — 제공 전까지 세션 로컬 보관(새로고침 시 소실). */
const MAX_LOCAL = 50;
const localSnapshots = new Map<string, HistorySnapshot>();

/** 검색 성공 시 스냅샷 로컬 적재 (실서버 모드 전용, FIFO 50) */
export function cacheSnapshot(search: SearchResponse, queryText: string, hasImage: boolean) {
  if (USE_MOCK) return;
  const entry: HistoryEntry = {
    sessionId: search.sessionId,
    queryText,
    hasImage,
    createdAt: new Date().toISOString(),
  };
  localSnapshots.set(entry.sessionId, { entry, search });
  while (localSnapshots.size > MAX_LOCAL) {
    const oldest = localSnapshots.keys().next().value;
    if (!oldest) break;
    localSnapshots.delete(oldest);
  }
}

export async function listHistory(): Promise<HistoryEntry[]> {
  if (USE_MOCK) return Promise.resolve([...MOCK_HISTORY]);
  return [...localSnapshots.values()].map((s) => s.entry).reverse();
}

/** 복원용 스냅샷 1회성 on-demand fetch — 캐시 없이 새로 호출 */
export async function fetchSnapshot(sessionId: string): Promise<HistorySnapshot> {
  if (USE_MOCK) {
    const entry = MOCK_HISTORY.find((h) => h.sessionId === sessionId) ?? MOCK_HISTORY[0];
    await new Promise((r) => setTimeout(r, 500));
    return { entry, search: mockSearchResponse(entry.queryText, entry.hasImage) };
  }
  const snap = localSnapshots.get(sessionId);
  if (!snap) throw new Error('세션 스냅샷을 찾을 수 없습니다 (BE 히스토리 API 제공 전까지 세션 내에서만 복원 가능)');
  return snap;
}
