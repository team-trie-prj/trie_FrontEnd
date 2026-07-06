import { create } from 'zustand';
import * as historyApi from '@/api/historyApi';
import { clearSearchResults, setSearchResults } from './resultStore';
import { restoreReport } from './reportStore';
import { restoreSearchInput } from './searchStore';
import { toast } from './uiStore';
import type { HistoryEntry } from '@/types/history';

const MAX_ENTRIES = 50; // FNC-HIS-01 · 사용자당 최대 50개, FIFO

interface HistoryState {
  entries: HistoryEntry[];
  restoringId: string | null;
  actions: {
    load: () => Promise<void>;
    /** FNC-HIS-01 · 복원: 캐시 무효화 → 스냅샷 fetch → 상태 복원 */
    restore: (sessionId: string) => Promise<boolean>;
    remove: (sessionId: string) => Promise<void>;
  };
}

const useHistoryStore = create<HistoryState>()((set) => ({
  entries: [],
  restoringId: null,
  actions: {
    load: async () => {
      try {
        set({ entries: (await historyApi.listHistory()).slice(0, MAX_ENTRIES) });
      } catch {
        toast('히스토리를 불러오지 못했습니다.');
      }
    },
    restore: async (sessionId) => {
      set({ restoringId: sessionId });
      clearSearchResults(); // ① 강제 무효화 (기존 데모 캐시 꼬임 결함 차단)
      restoreReport(undefined);
      try {
        const snap = await historyApi.fetchSnapshot(sessionId); // ② on-demand fetch
        setSearchResults(snap.search); // ③ 복원
        restoreSearchInput(snap.entry.queryText);
        restoreReport(snap.report);
        return true;
      } catch {
        toast('세션 복원에 실패했습니다.');
        return false;
      } finally {
        set({ restoringId: null });
      }
    },
    remove: async (sessionId) => {
      try {
        await historyApi.deleteHistory(sessionId);
        set((s) => ({ entries: s.entries.filter((e) => e.sessionId !== sessionId) }));
      } catch {
        toast('이력 삭제에 실패했습니다.');
      }
    },
  },
}));

/** 검색 성공 시 목록에 즉시 반영 (서버 로깅과 별개의 화면용 상태) */
export function addHistoryEntry(entry: HistoryEntry) {
  useHistoryStore.setState((s) => ({
    entries: [entry, ...s.entries].slice(0, MAX_ENTRIES),
  }));
}
export const useHistoryEntries = () => useHistoryStore((s) => s.entries);
export const useRestoringId = () => useHistoryStore((s) => s.restoringId);
export const useHistoryActions = () => useHistoryStore((s) => s.actions);
