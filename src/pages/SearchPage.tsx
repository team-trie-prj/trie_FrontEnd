import Hero from '@/components/common/Hero';
import QueryInput from '@/components/search/QueryInput';
import TemplateSuggest from '@/components/search/TemplateSuggest';
import VlmFallbackModal from '@/components/search/VlmFallbackModal';
import Chip from '@/components/common/Chip';
import { MOCK_TEMPLATES } from '@/mocks/searchMocks';
import { useSearchActions } from '@/stores/searchStore';

/** 통합 검색 화면 (FNC-SRC-01/02) — 데모 메인 히어로 디자인 유지 */
export default function SearchPage() {
  const { setQueryText } = useSearchActions();

  return (
    <section className="screen-fade">
      <Hero
        eyebrow="통합 검색 · 멀티모달"
        title={
          <>
            무엇을 <b>분석</b>할까요?
          </>
        }
        description="텍스트 질의와 현장 이미지를 함께 입력하면 에이전트가 최적의 검색 방식을 결정해 하이브리드 탐색을 수행합니다."
      />
      <QueryInput />
      <div className="mt-4 flex flex-wrap justify-center gap-[0.5625rem]">
        {MOCK_TEMPLATES.map((t) => (
          <Chip key={t.id} onClick={() => setQueryText(t.queryText)}>
            {t.label}
          </Chip>
        ))}
      </div>
      <TemplateSuggest />
      <VlmFallbackModal />
      <p className="mt-10 text-center text-xs text-mut4">
        이미지는 JPG/PNG · 최대 5MB — VLM 분석 지연 시 텍스트 단독 검색으로 전환을 안내합니다.
      </p>
    </section>
  );
}
