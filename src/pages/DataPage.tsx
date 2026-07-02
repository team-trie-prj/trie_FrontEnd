import Hero from '@/components/common/Hero';
import Card from '@/components/common/Card';
import Label from '@/components/common/Label';
import UploadDropzone from '@/components/data/UploadDropzone';
import UploadList from '@/components/data/UploadList';

/** 데이터 관리 화면 (FNC-DAT-01/02) */
export default function DataPage() {
  return (
    <section className="screen-fade">
      <Hero
        eyebrow="데이터 관리 · 문서 적재"
        title={
          <>
            문서를 <b>지식</b>으로
          </>
        }
        description="도로 시설물·안전 관리 지침서(PDF/DOCX)를 업로드하면 텍스트 파싱과 정제를 거쳐 시맨틱 청킹 후 Vector DB에 적재됩니다."
      />
      <div className="mx-auto max-w-[760px]">
        <UploadDropzone />
        <UploadList />
        <Card className="mt-6">
          <Label className="mb-3.5">처리 파이프라인</Label>
          <ol className="space-y-2.5 text-[13px] leading-[1.7] text-mut2">
            <li>1. 확장자 변조 검증 후 서버 로컬 스토리지에 저장</li>
            <li>2. PyPDF·python-docx 백그라운드 파싱으로 텍스트 추출</li>
            <li>3. 공백 정제·인코딩 복원·특수문자 필터링 전처리</li>
            <li>4. 시맨틱 청킹 → BGE-m3 임베딩 → ChromaDB 인덱싱 (자동 트리거)</li>
          </ol>
          <p className="mt-4 text-xs text-mut4">
            악성 스크립트 감지 시 파싱이 전면 중단되고 파일은 영구 삭제됩니다.
          </p>
        </Card>
      </div>
    </section>
  );
}
