import { useState } from 'react';
import Card from '@/components/common/Card';
import Icon from '@/components/common/Icon';
import SourceBadge from './SourceBadge';
import { useResultActions } from '@/stores/resultStore';
import type { SearchHit } from '@/types/search';

const SOURCE_LABEL: Record<SearchHit['source'], string> = {
  internal_doc: '사내 지침서',
  public_api: '공공데이터',
  vlm_context: '이미지 분석',
};

/** FNC-VIW-01 · 결과 카드 (아코디언 확장 + 출처 배지) */
export default function ResultCard({ hit }: { hit: SearchHit }) {
  const [expanded, setExpanded] = useState(false);
  const { openSnippet } = useResultActions();

  return (
    <Card hover className="p-[18px]">
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <SourceBadge hit={hit} onOpenSnippet={openSnippet} />
        <div className="flex items-center gap-3">
          <span className="text-[11px] tracking-[.1em] text-mut3">
            {SOURCE_LABEL[hit.source]}
          </span>
          <span className="text-xl font-light">{hit.score.toFixed(2)}</span>
        </div>
      </div>
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <span className="text-base font-semibold">{hit.title}</span>
        <Icon
          name="expand_more"
          size={20}
          className={`shrink-0 text-mut3 transition-transform ${expanded ? 'rotate-180' : ''}`}
        />
      </button>
      <p
        className={`mt-1.5 text-[13px] leading-[1.7] text-mut2 ${expanded ? '' : 'line-clamp-2'}`}
      >
        {hit.text}
      </p>
    </Card>
  );
}
