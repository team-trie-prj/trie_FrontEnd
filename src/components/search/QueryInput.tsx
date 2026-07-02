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
    <div className="mx-auto flex max-w-[680px] items-center gap-3 rounded-[30px] border border-line3 bg-panel py-[7px] pl-[22px] pr-[7px]">
      <Icon name="auto_awesome" size={21} className="text-ink" />
      <input
        value={queryText}
        onChange={(e) => setQueryText(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && !busy && void onSubmit()}
        aria-label="검색 질의 입력"
        placeholder="예) 대전 유성구 포트홀 민원 통계를 찾아줘"
        className="flex-1 border-none bg-transparent text-base text-ink outline-none placeholder:text-mut3"
      />
      <ImageAttach />
      <button
        onClick={() => void onSubmit()}
        disabled={busy}
        className="inline-flex h-[46px] items-center gap-2 rounded-[23px] bg-white px-[22px] text-sm font-semibold text-black hover:bg-[#e9e9e9] disabled:opacity-50"
      >
        {busy ? <Spinner /> : '검색'}
      </button>
    </div>
  );
}
