import { useNavigate } from 'react-router-dom';
import Hero from '@/components/common/Hero';
import Chip from '@/components/common/Chip';
import Button from '@/components/common/Button';
import ResultCard from '@/components/results/ResultCard';
import StatsPanel from '@/components/results/StatsPanel';
import VlmContextCard from '@/components/results/VlmContextCard';
import SnippetModal from '@/components/results/SnippetModal';
import { ROUTES } from '@/constants/navigation';
import { useResultFilter, useResultActions, useSearchResponse } from '@/stores/resultStore';
import type { HitSource } from '@/types/search';

const FILTERS: { key: HitSource | 'all'; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'internal_doc', label: '사내 지침서' },
  { key: 'public_api', label: '공공데이터' },
];

/** 검색 결과 화면 (FNC-SRC-03 / FNC-VIW-01 / FNC-VIW-02) */
export default function ResultsPage() {
  const navigate = useNavigate();
  const response = useSearchResponse();
  const filter = useResultFilter();
  const { setFilter } = useResultActions();

  if (!response) {
    return (
      <section className="screen-fade py-20 text-center">
        <p className="mb-6 text-mut">표시할 검색 결과가 없습니다.</p>
        <Button onClick={() => navigate(ROUTES.search)}>통합 검색으로 이동</Button>
      </section>
    );
  }

  const hits = response.hits.filter((h) => filter === 'all' || h.source === filter);

  return (
    <section className="screen-fade">
      <Hero
        eyebrow={`검색 결과 · ${response.routing.mode.toUpperCase()} 라우팅 · 세션 ${response.sessionId.slice(0, 8)}`}
        title={
          <>
            근거와 <b>출처</b>를 함께
          </>
        }
        description="사내 문서 청크·공공데이터 수치·이미지 분석 맥락을 출처 배지와 함께 제공합니다. 배지를 클릭하면 근거 스니펫을 대조할 수 있어요."
      />
      <div className="mb-5 flex justify-center gap-2">
        {FILTERS.map((f) => (
          <Chip key={f.key} active={filter === f.key} onClick={() => setFilter(f.key)}>
            {f.label}
          </Chip>
        ))}
      </div>
      <div className="mx-auto flex max-w-[860px] flex-col gap-[13px]">
        {response.vlmContext && <VlmContextCard context={response.vlmContext} />}
        {hits.map((h) => (
          <ResultCard key={h.id} hit={h} />
        ))}
        {hits.length === 0 && <p className="py-8 text-center text-mut3">해당 출처의 결과 없음</p>}
        <StatsPanel hits={response.hits} />
        <div className="mt-2 flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={() => navigate(ROUTES.search)}>
            새 검색
          </Button>
          <Button className="flex-1" onClick={() => navigate(ROUTES.report)}>
            보고서로 만들기
          </Button>
        </div>
      </div>
      <SnippetModal />
    </section>
  );
}
