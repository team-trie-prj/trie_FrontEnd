import { create } from 'zustand';
import type { HitSource, SearchHit, SearchResponse } from '@/types/search';

/** FNC-VIW-01/02 · 검색 결과 화면 상태 */
interface ResultState {
  response: SearchResponse | null;
  filter: HitSource | 'all';
  /** 스니펫 모달에 띄울 hit (FNC-VIW-01) */
  snippetHit: SearchHit | null;
  /** true=차트, false=표 (FNC-VIW-02) */
  chartMode: boolean;
  actions: {
    setFilter: (f: HitSource | 'all') => void;
    openSnippet: (hit: SearchHit) => void;
    closeSnippet: () => void;
    toggleChartMode: () => void;
  };
}

const useResultStore = create<ResultState>()((set) => ({
  response: null,
  filter: 'all',
  snippetHit: null,
  chartMode: true,
  actions: {
    setFilter: (filter) => set({ filter }),
    openSnippet: (snippetHit) => set({ snippetHit }),
    closeSnippet: () => set({ snippetHit: null }),
    toggleChartMode: () => set((s) => ({ chartMode: !s.chartMode })),
  },
}));
export function setSearchResults(response: SearchResponse) {
  useResultStore.setState({ response, filter: 'all', snippetHit: null });
}

/** FNC-HIS-01 · 복원 전 로컬 캐시 강제 무효화 */
export function clearSearchResults() {
  useResultStore.setState({ response: null, filter: 'all', snippetHit: null });
}
export const useSearchResponse = () => useResultStore((s) => s.response);
export const useResultFilter = () => useResultStore((s) => s.filter);
export const useSnippetHit = () => useResultStore((s) => s.snippetHit);
export const useChartMode = () => useResultStore((s) => s.chartMode);
export const useResultActions = () => useResultStore((s) => s.actions);
