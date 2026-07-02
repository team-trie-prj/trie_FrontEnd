import { useEffect } from 'react';
import Hero from '@/components/common/Hero';
import CatalogForm from '@/components/catalog/CatalogForm';
import CatalogTable from '@/components/catalog/CatalogTable';
import { useCatalogActions } from '@/stores/catalogStore';

/** API 관리 화면 (FNC-PUB-01) */
export default function CatalogPage() {
  const { load } = useCatalogActions();

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <section className="screen-fade">
      <Hero
        eyebrow="API 관리 · 공공데이터 카탈로그"
        title={
          <>
            외부 데이터를 <b>잇다</b>
          </>
        }
        description="공공데이터포털 API의 엔드포인트와 파라미터 구조를 등록하면 연동 테스트를 거쳐 에이전트의 도구 목록에 동적 활성화됩니다."
      />
      <div className="mx-auto grid max-w-[980px] grid-cols-[minmax(250px,380px)_minmax(0,1fr)] items-start gap-5 max-[768px]:grid-cols-1">
        <CatalogForm />
        <CatalogTable />
      </div>
    </section>
  );
}
