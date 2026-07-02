import Icon from '@/components/common/Icon';
import Spinner from '@/components/common/Spinner';
import type { HistoryEntry } from '@/types/history';

interface Props {
  entry: HistoryEntry;
  restoring: boolean;
  onRestore: (sessionId: string) => void;
}

/** FNC-HIS-01 · 사이드바 히스토리 항목 */
export default function HistoryItem({ entry, restoring, onRestore }: Props) {
  return (
    <button
      onClick={() => onRestore(entry.sessionId)}
      disabled={restoring}
      className="w-full rounded-[0.75rem] border border-line px-3.5 py-3 text-left transition-colors hover:border-[#333] hover:bg-[#101010] disabled:opacity-50"
    >
      <div className="flex items-center gap-2">
        {restoring ? <Spinner /> : <Icon name="history" size={16} className="text-mut3" />}
        <span className="flex-1 truncate text-[0.8125rem] font-medium">{entry.queryText}</span>
      </div>
      <div className="mt-1.5 flex items-center gap-2 text-[0.6875rem] text-mut4">
        <span>{entry.createdAt.slice(5, 16).replace('T', ' ')}</span>
        {entry.hasImage && (
          <span className="inline-flex items-center gap-0.5">
            <Icon name="image" size={12} /> 이미지
          </span>
        )}
      </div>
    </button>
  );
}
