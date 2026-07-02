import type { SearchResponse } from './search';
import type { ReportDraft } from './report';

/** FNC-HIS-01 · 세션별 히스토리 로깅 및 캐시 없는 세션 복원 */

export interface HistoryEntry {
  sessionId: string;
  queryText: string;
  hasImage: boolean;
  createdAt: string;
}

/** DB 스냅샷 — 복원 시 1회성 on-demand fetch 응답 */
export interface HistorySnapshot {
  entry: HistoryEntry;
  search: SearchResponse;
  report?: ReportDraft;
}
