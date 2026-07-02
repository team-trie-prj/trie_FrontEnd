import Card from '@/components/common/Card';
import Icon from '@/components/common/Icon';
import Pill from '@/components/common/Pill';
import type { SearchResponse } from '@/types/search';

/**
 * LLM 에이전트 종합 답변 카드 — 데모 버전 'AI 응답' 카드 디자인 유지.
 * 결과 나열 전에 질의에 대한 자연어 요약을 먼저 보여준다.
 */
export default function AnswerCard({ response }: { response: SearchResponse }) {
  if (!response.answer) return null;

  const internalCount = response.hits.filter((h) => h.source === 'internal_doc').length;
  const publicCount = response.hits.filter((h) => h.source === 'public_api').length;

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-white">
            <Icon name="auto_awesome" size={17} className="text-black" />
          </span>
          <span className="text-base font-semibold">AI 종합 답변</span>
        </div>
        <Pill>
          {response.routing.domain} · {response.routing.mode.toUpperCase()}
        </Pill>
      </div>
      <p className="mb-4 text-sm leading-[1.8] text-[#C8C8C8]">{response.answer}</p>
      <div className="flex flex-wrap gap-2">
        {internalCount > 0 && <Pill>사내 지침서 {internalCount}건</Pill>}
        {publicCount > 0 && <Pill>공공데이터 {publicCount}건</Pill>}
        {response.vlmContext && <Pill>이미지 분석 반영</Pill>}
      </div>
    </Card>
  );
}
