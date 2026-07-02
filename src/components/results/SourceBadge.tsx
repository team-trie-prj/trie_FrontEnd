import Pill from '@/components/common/Pill';
import Icon from '@/components/common/Icon';
import type { SearchHit } from '@/types/search';

interface Props {
  hit: SearchHit;
  onOpenSnippet: (hit: SearchHit) => void;
}

/**
 * FNC-VIW-01 · 원본 출처 배지.
 * 출처 메타데이터가 없으면 "출처 미상 (확인 주의)" 붉은 배지를 강제 부여한다.
 * 클릭 시 근거 스니펫 모달을 연다.
 */
export default function SourceBadge({ hit, onOpenSnippet }: Props) {
  if (!hit.provenance?.label) {
    return (
      <Pill tone="danger">
        <Icon name="warning" size={13} />
        출처 미상 (확인 주의)
      </Pill>
    );
  }
  return (
    <button onClick={() => onOpenSnippet(hit)} title="근거 스니펫 보기">
      <Pill className="cursor-pointer transition-colors hover:border-[#555]">
        <Icon name="verified" size={13} />
        {hit.provenance.label}
      </Pill>
    </button>
  );
}
