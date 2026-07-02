import { create } from 'zustand';
import * as catalogApi from '@/api/catalogApi';
import { toast } from './uiStore';
import type { ApiCatalogEntry, CatalogRegisterRequest } from '@/types/catalog';

/** FNC-PUB-01 · 공공데이터 API 카탈로그 상태 */
interface CatalogState {
  entries: ApiCatalogEntry[];
  loading: boolean;
  registering: boolean;
  actions: {
    load: () => Promise<void>;
    /** 등록 + 연동 테스트. 실패 시 저장 차단 + 경고 (FNC-PUB-01 예외) */
    register: (req: CatalogRegisterRequest) => Promise<boolean>;
  };
}

const useCatalogStore = create<CatalogState>()((set) => ({
  entries: [],
  loading: false,
  registering: false,
  actions: {
    load: async () => {
      set({ loading: true });
      try {
        set({ entries: await catalogApi.listCatalog() });
      } catch {
        toast('카탈로그를 불러오지 못했습니다.');
      } finally {
        set({ loading: false });
      }
    },
    register: async (req) => {
      set({ registering: true });
      try {
        const entry = await catalogApi.registerCatalog(req);
        set((s) => ({ entries: [entry, ...s.entries] }));
        toast('연동 테스트 성공 · 카탈로그에 등록되었습니다.');
        return true;
      } catch (e) {
        toast(e instanceof Error ? e.message : 'API 연동 실패');
        return false;
      } finally {
        set({ registering: false });
      }
    },
  },
}));

// ===== atomic selectors =====
export const useCatalogEntries = () => useCatalogStore((s) => s.entries);
export const useCatalogLoading = () => useCatalogStore((s) => s.loading);
export const useCatalogRegistering = () => useCatalogStore((s) => s.registering);
export const useCatalogActions = () => useCatalogStore((s) => s.actions);
