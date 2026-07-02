import { useEffect } from 'react';
import Icon from '@/components/common/Icon';
import { useSearchResponse } from '@/stores/resultStore';
import { useHistoryEntries, useHistoryActions } from '@/stores/historyStore';

interface Props {
  selected: string | null;
  onSelect: (sessionId: string) => void;
  disabled?: boolean;
}

/** 보고서 근거 데이터 선택 — 현재 검색 결과 또는 과거 검색 세션(FNC-HIS-01)을 */
export default function SourcePicker({ selected, onSelect, disabled }: Props) {
  const response = useSearchResponse();
  const entries = useHistoryEntries();
  const { load } = useHistoryActions();

  useEffect(() => {
    void load();
  }, [load]);

  const history = entries.filter((e) => e.sessionId !== response?.sessionId);
  const itemCls = (active: boolean) =>
    `flex w-full items-center gap-2.5 rounded-[12px] border px-3.5 py-2.5 text-left transition-colors disabled:opacity-50 ${
      active ? 'border-white bg-[#101010]' : 'border-line hover:border-[#333]'
    }`;

  return (
    <div className="mb-4">
      <div className="flex max-h-[380px] flex-col gap-2 overflow-y-auto pr-1">
        {response && (
          <button
            onClick={() => onSelect(response.sessionId)}
            disabled={disabled}
            className={itemCls(selected === response.sessionId)}
          >
            <Icon name="auto_awesome" size={15} className="shrink-0 text-mut" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-semibold">현재 검색 결과</span>
              <span className="block truncate text-[11px] text-mut3">
                결과 {response.hits.length}건 · 세션 {response.sessionId.slice(0, 8)}
              </span>
            </span>
          </button>
        )}
        {history.map((e) => (
          <button
            key={e.sessionId}
            onClick={() => onSelect(e.sessionId)}
            disabled={disabled}
            className={itemCls(selected === e.sessionId)}
          >
            <Icon name="history" size={15} className="shrink-0 text-mut3" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-medium">{e.queryText}</span>
              <span className="block truncate text-[11px] text-mut3">
                {e.createdAt.slice(5, 16).replace('T', ' ')}
                {e.hasImage ? ' · 이미지 포함' : ''}
              </span>
            </span>
          </button>
        ))}
        {!response && history.length === 0 && (
          <p className="py-3 text-center text-xs text-mut3">
            사용할 수 있는 검색 데이터가 없습니다. 먼저 통합 검색을 실행하세요.
          </p>
        )}
      </div>
    </div>
  );
}
