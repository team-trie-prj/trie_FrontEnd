import Icon from '@/components/common/Icon';
import Spinner from '@/components/common/Spinner';
import type { HistoryEntry } from '@/types/history';

interface Props {
  entry: HistoryEntry;
  restoring: boolean;
  onRestore: (sessionId: string) => void;
  onRemove: (sessionId: string) => void;
}

/** FNC-HIS-01 · 사이드바 히스토리 항목 (복원 + 삭제) */
export default function HistoryItem({ entry, restoring, onRestore, onRemove }: Props) {
  return (
    <div className="relative">
      <button
        onClick={() => onRestore(entry.sessionId)}
        disabled={restoring}
        className="w-full rounded-[12px] border border-line px-3.5 py-3 pr-10 text-left transition-colors hover:border-[#333] hover:bg-[#101010] disabled:opacity-50"
      >
        <div className="flex items-center gap-2">
          {restoring ? <Spinner /> : <Icon name="history" size={16} className="text-mut3" />}
          <span className="flex-1 truncate text-[13px] font-medium">{entry.queryText}</span>
        </div>
        <div className="mt-1.5 flex items-center gap-2 text-[11px] text-mut4">
          <span>{entry.createdAt.slice(5, 16).replace('T', ' ')}</span>
          {entry.hasImage && (
            <span className="inline-flex items-center gap-0.5">
              <Icon name="image" size={12} /> 이미지
            </span>
          )}
        </div>
      </button>
      <button
        onClick={() => onRemove(entry.sessionId)}
        className="absolute right-2.5 top-3 rounded p-1 text-mut4 transition-colors hover:bg-white/[.06] hover:text-danger"
        aria-label="이력 삭제"
        title="이력 삭제"
      >
        <Icon name="delete" size={15} />
      </button>
    </div>
  );
}
