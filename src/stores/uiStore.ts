import { create } from 'zustand';

/**
 * UI 전역 상태 (토스트/사이드바).
 * 규칙: 스토어 자체는 export하지 않고 atomic selector 훅만 export.
 * 상태와 액션은 분리된 네임스페이스로 관리한다.
 */
interface UiState {
  toastMessage: string | null;
  sidebarOpen: boolean;
  actions: {
    showToast: (message: string) => void;
    hideToast: () => void;
    toggleSidebar: (open?: boolean) => void;
  };
}

let toastTimer: ReturnType<typeof setTimeout> | undefined;

const useUiStore = create<UiState>()((set) => ({
  toastMessage: null,
  sidebarOpen: false,
  actions: {
    showToast: (message) => {
      set({ toastMessage: message });
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => set({ toastMessage: null }), 2300);
    },
    hideToast: () => set({ toastMessage: null }),
    toggleSidebar: (open) => set((s) => ({ sidebarOpen: open ?? !s.sidebarOpen })),
  },
}));

// ===== atomic selectors =====
export const useToastMessage = () => useUiStore((s) => s.toastMessage);
export const useSidebarOpen = () => useUiStore((s) => s.sidebarOpen);
export const useUiActions = () => useUiStore((s) => s.actions);

/** 컴포넌트 밖(스토어/API 레이어)에서도 호출 가능한 토스트 */
export const toast = (message: string) => useUiStore.getState().actions.showToast(message);
