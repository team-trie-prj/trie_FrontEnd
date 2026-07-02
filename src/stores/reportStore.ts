import { create } from 'zustand';
import * as reportApi from '@/api/reportApi';
import { toast } from './uiStore';
import type { ReportDraft, ReportStatus } from '@/types/report';

/** FNC-REP-01/02 · 보고서 초안 생성·편집 상태 */
interface ReportState {
  draft: ReportDraft | null;
  status: ReportStatus;
  actions: {
    /** 스트리밍 생성 — 청크 수신마다 markdown append */
    generate: (sessionId: string, templateId: string) => Promise<void>;
    /** WYSIWYG 인라인 편집 반영 (FNC-REP-02) */
    setMarkdown: (markdown: string) => void;
    reset: () => void;
  };
}

const useReportStore = create<ReportState>()((set) => ({
  draft: null,
  status: 'idle',
  actions: {
    generate: async (sessionId, templateId) => {
      set({
        status: 'streaming',
        draft: {
          markdown: '',
          templateId,
          insufficientData: false,
          generatedAt: new Date().toISOString(),
        },
      });
      try {
        await reportApi.generateReport(sessionId, templateId, (chunk) =>
          set((s) =>
            s.draft ? { draft: { ...s.draft, markdown: s.draft.markdown + chunk } } : s,
          ),
        );
        set({ status: 'done' });
      } catch {
        set({ status: 'error' });
        toast('보고서 생성에 실패했습니다.');
      }
    },
    setMarkdown: (markdown) =>
      set((s) => (s.draft ? { draft: { ...s.draft, markdown } } : s)),
    reset: () => set({ draft: null, status: 'idle' }),
  },
}));

// ===== 히스토리 복원용 이벤트 함수 =====
export function restoreReport(draft: ReportDraft | undefined) {
  useReportStore.setState({ draft: draft ?? null, status: draft ? 'done' : 'idle' });
}

// ===== atomic selectors =====
export const useReportDraft = () => useReportStore((s) => s.draft);
export const useReportStatus = () => useReportStore((s) => s.status);
export const useReportActions = () => useReportStore((s) => s.actions);
