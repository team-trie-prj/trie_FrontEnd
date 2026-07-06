import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/common/Icon';
import HistoryItem from '@/components/history/HistoryItem';
import { ROUTES } from '@/constants/navigation';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useHistoryEntries, useHistoryActions, useRestoringId } from '@/stores/historyStore';
import { useSidebarOpen, useUiActions, toast } from '@/stores/uiStore';

/** FNC-HIS-01 · 과거 검색 히스토리 사이드바 (최대 50개) — 포커스 트랩·ESC 지원 */
export default function HistorySidebar() {
  const open = useSidebarOpen();
  const { load } = useHistoryActions();
  const { toggleSidebar } = useUiActions();

  useEffect(() => {
    if (open) void load();
  }, [open, load]);

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/50" onClick={() => toggleSidebar(false)} />
      )}
      <aside
        className={`fixed right-0 top-0 z-50 h-full w-[320px] max-w-[85vw] border-l border-line bg-[#070707] transition-transform duration-200 ${
          open ? 'visible translate-x-0' : 'invisible translate-x-full'
        }`}
      >
        {open && <SidebarContent onClose={() => toggleSidebar(false)} />}
      </aside>
    </>
  );
}

/** 열림 상태에서만 마운트 — useFocusTrap이 포커스 이동/순환/복원을 담당 */
function SidebarContent({ onClose }: { onClose: () => void }) {
  const entries = useHistoryEntries();
  const restoringId = useRestoringId();
  const { restore, remove } = useHistoryActions();
  const navigate = useNavigate();
  const trapRef = useFocusTrap<HTMLDivElement>(onClose);

  const onRestore = async (sessionId: string) => {
    const ok = await restore(sessionId);
    if (ok) {
      onClose();
      toast('과거 세션을 복원했습니다.');
      navigate(ROUTES.results);
    }
  };

  return (
    <div ref={trapRef} className="flex h-full flex-col">
      <div className="flex h-[70px] shrink-0 items-center justify-between border-b border-line px-5">
        <span className="text-sm font-semibold tracking-[.06em]">검색 히스토리</span>
        <button onClick={onClose} className="text-mut hover:text-ink" aria-label="히스토리 닫기">
          <Icon name="close" size={20} />
        </button>
      </div>
      <div className="flex-1 space-y-2.5 overflow-y-auto p-4">
        {entries.length === 0 && (
          <p className="pt-8 text-center text-[13px] text-mut3">저장된 히스토리가 없습니다.</p>
        )}
        {entries.map((e) => (
          <HistoryItem
            key={e.sessionId}
            entry={e}
            restoring={restoringId === e.sessionId}
            onRestore={onRestore}
            onRemove={(id) => void remove(id)}
          />
        ))}
      </div>
      <div className="border-t border-line p-4 text-center text-[11px] text-mut4">
        최대 50개 보관 · 초과 시 오래된 항목부터 삭제 (FIFO)
      </div>
    </div>
  );
}
