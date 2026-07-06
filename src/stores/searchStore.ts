import { create } from 'zustand';
import * as searchApi from '@/api/searchApi';
import { ClarifyError, PromptBlockedError, VlmTimeoutError } from '@/api/searchApi';
import { setSearchResults } from './resultStore';
import { addHistoryEntry } from './historyStore';
import { toast } from './uiStore';
import { sanitizeQuery, validateQuery } from '@/utils/queryValidators';
import type { AttachedImage, QueryTemplate } from '@/types/search';

/** FNC-SRC-01/02 · 통합 검색 상태. vlm_timeout = 텍스트 단독 전환 확인 대기 */
type Phase = 'idle' | 'routing' | 'suggesting' | 'searching' | 'vlm_timeout' | 'error';

interface SearchState {
  queryText: string;
  image: AttachedImage | null;
  phase: Phase;
  templates: QueryTemplate[];
  skipOnce: boolean;
  actions: {
    setQueryText: (v: string) => void;
    attachImage: (img: AttachedImage) => void;
    clearImage: () => void;
    applyTemplate: (t: QueryTemplate) => void;
    dismissTemplates: () => void;
    resetPhase: () => void;
    submit: () => Promise<boolean>;
  };
}

const useSearchStore = create<SearchState>()((set, get) => ({
  queryText: '',
  image: null,
  phase: 'idle',
  templates: [],
  skipOnce: false,
  actions: {
    setQueryText: (queryText) => set({ queryText }),
    attachImage: (image) => set({ image }),
    clearImage: () => set({ image: null }),
    applyTemplate: (t) =>
      set({ queryText: t.queryText, templates: [], phase: 'idle', skipOnce: false }),
    dismissTemplates: () => set({ templates: [], phase: 'idle', skipOnce: true }),
    resetPhase: () => set({ phase: 'idle' }),
    submit: async () => {
      const { image, skipOnce } = get();
      const queryText = sanitizeQuery(get().queryText);
      if (!queryText && !image) {
        toast('질의를 입력하거나 이미지를 첨부하세요.');
        return false;
      }
      const invalid = validateQuery(queryText);
      if (invalid) {
        toast(invalid);
        return false;
      }
      try {
        set({ phase: 'routing', queryText });
        const routing = await searchApi.routeQuery(queryText, skipOnce);
        if (routing.suggestedTemplates?.length) {
          set({ phase: 'suggesting', templates: routing.suggestedTemplates });
          return false;
        }
        set({ phase: 'searching' });
        const res = await searchApi.runSearch(queryText, image?.dataUrl, skipOnce);
        setSearchResults(res);
        addHistoryEntry({
          sessionId: res.sessionId,
          queryText,
          hasImage: Boolean(image),
          createdAt: new Date().toISOString(),
        });
        set({ phase: 'idle', skipOnce: false });
        return true;
      } catch (e) {
        if (e instanceof VlmTimeoutError) {
          set({ phase: 'vlm_timeout' });
          return false;
        }
        if (e instanceof ClarifyError) {
          set({ phase: 'suggesting', templates: e.templates });
          return false;
        }
        if (e instanceof PromptBlockedError) {
          set({ phase: 'error' });
          toast(e.message);
          return false;
        }
        set({ phase: 'error' });
        toast('검색 중 오류가 발생했습니다.');
        return false;
      }
    },
  },
}));
export const useQueryText = () => useSearchStore((s) => s.queryText);
export const useAttachedImage = () => useSearchStore((s) => s.image);
export const useSearchPhase = () => useSearchStore((s) => s.phase);
export const useSuggestedTemplates = () => useSearchStore((s) => s.templates);
export const useSearchActions = () => useSearchStore((s) => s.actions);

/** FNC-HIS-01 · 히스토리 복원 시 검색 입력 상태 재설정 */
export function restoreSearchInput(queryText: string) {
  useSearchStore.setState({ queryText, image: null, phase: 'idle', templates: [] });
}
