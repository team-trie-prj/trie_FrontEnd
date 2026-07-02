import { useState } from 'react';
import Hero from '@/components/common/Hero';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Spinner from '@/components/common/Spinner';
import TemplatePicker from '@/components/report/TemplatePicker';
import ReportEditor from '@/components/report/ReportEditor';
import { REPORT_TEMPLATES } from '@/constants/reportTemplates';
import { exportReport } from '@/utils/exporters';
import { useSearchResponse } from '@/stores/resultStore';
import { useReportDraft, useReportStatus, useReportActions } from '@/stores/reportStore';
import { toast } from '@/stores/uiStore';

/** 보고서 뷰어 (FNC-REP-01/02) — 데모 종이 질감 미리보기 유지 */
export default function ReportPage() {
  const response = useSearchResponse();
  const draft = useReportDraft();
  const status = useReportStatus();
  const { generate } = useReportActions();
  const [templateId, setTemplateId] = useState(REPORT_TEMPLATES[0].id);

  const onGenerate = () => {
    if (!response) {
      toast('먼저 통합 검색을 실행해 근거 데이터를 준비하세요.');
      return;
    }
    void generate(response.sessionId, templateId);
  };

  return (
    <section className="screen-fade">
      <Hero
        eyebrow="보고서 뷰어 · 생성·편집·내보내기"
        title={
          <>
            근거를 <b>문서</b>로
          </>
        }
        description="검색된 다중 출처 데이터를 종합해 실무 양식에 맞는 초안을 생성하고, 화면에서 직접 수정한 뒤 파일로 내보냅니다."
      />
      <div className="grid grid-cols-[300px_1fr] items-start gap-5 max-[900px]:grid-cols-1">
        <Card>
          <TemplatePicker
            selected={templateId}
            onSelect={setTemplateId}
            disabled={status === 'streaming'}
          />
          <Button onClick={onGenerate} disabled={status === 'streaming'} className="mt-5 w-full">
            {status === 'streaming' ? <Spinner /> : '보고서 자동 생성'}
          </Button>
          <div className="mt-5 flex gap-2.5">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1"
              disabled={!draft || status !== 'done'}
              onClick={() => exportReport(draft!.markdown, 'pdf')}
            >
              PDF
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1"
              disabled={!draft || status !== 'done'}
              onClick={() => exportReport(draft!.markdown, 'docx')}
            >
              DOCX
            </Button>
          </div>
          <p className="mt-3 text-center text-[11px] text-mut4">
            {!response ? '검색 결과가 없어 생성 시 안내가 표시됩니다' : '편집: 완료 후 본문 클릭'}
          </p>
        </Card>
        <Card className="flex justify-center bg-panel2 p-[26px]">
          <div className="min-h-[400px] w-full max-w-[560px] rounded-md bg-[#F4F4F0] px-[46px] py-10 shadow-[0_16px_50px_rgba(0,0,0,.6)]">
            <ReportEditor />
          </div>
        </Card>
      </div>
    </section>
  );
}
