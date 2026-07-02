import { useNavigate } from 'react-router-dom';
import Icon from '@/components/common/Icon';
import Spinner from '@/components/common/Spinner';
import ImageAttach from './ImageAttach';
import { ROUTES } from '@/constants/navigation';
import { useQueryText, useSearchPhase, useSearchActions } from '@/stores/searchStore';

/** FNC-SRC-01/02 · 통합 검색 입력 바 (데모 .input-bar 유지) */
export default function QueryInput() {
  const queryText = useQueryText();
  const phase = useSearchPhase();
  const { setQueryText, submit } = useSearchActions();
  const navigate = useNavigate();

  const busy = phase === 'routing' || phase === 'searching';

  const onSubmit = async () => {
    const ok = await submit();
    if (ok) navigate(ROUTES.results);
  };

  return (
    <div className="mx-auto flex w-full max-w-[42.5rem] flex-wrap items-center gap-3 rounded-[1.875rem] border border-line3 bg-panel py-[0.4375rem] pl-[1.375rem] pr-[0.4375rem] max-[480px]:gap-2 max-[480px]:pl-4">
      <Icon name="auto_awesome" size={21} className="text-ink" />
      <input
        value={queryText}
        onChange={(e) => setQueryText(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && !busy && void onSubmit()}
        aria-label="검색 질의 입력"
        placeholder="예) 대전 유성구 포트홀 민원 통계를 찾아줘"
        className="min-w-[11.25rem] flex-1 border-none bg-transparent text-base text-ink outline-none placeholder:text-mut3"
      />
      <ImageAttach />
      <button
        onClick={() => void onSubmit()}
        disabled={busy}
        className="inline-flex h-[2.875rem] items-center gap-2 rounded-[1.4375rem] bg-white px-[1.375rem] text-sm font-semibold text-black hover:bg-[#e9e9e9] disabled:opacity-50 max-[480px]:h-10 max-[480px]:px-4"
      >
        {busy ? <Spinner /> : '검색'}
      </button>
    </div>
  );
}
