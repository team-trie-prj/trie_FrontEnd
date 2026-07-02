import { useEffect, useState } from 'react';
import Hero from '@/components/common/Hero';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Spinner from '@/components/common/Spinner';
import ReportControls from '@/components/report/ReportControls';
import ReportEditor from '@/components/report/ReportEditor';
import SourcePickerModal from '@/components/report/SourcePickerModal';
import { exportReport } from '@/utils/exporters';
import { REPORT_TEMPLATES } from '@/constants/reportTemplates';
import { useSearchResponse } from '@/stores/resultStore';
import { useHistoryEntries, useHistoryActions } from '@/stores/historyStore';
import { useReportDraft, useReportStatus, useReportActions } from '@/stores/reportStore';
import { toast } from '@/stores/uiStore';

/** 보고서 뷰어 (FNC-REP-01/02) — 근거 세션은 모달에서 선택 */
export default function ReportPage() {
  const response = useSearchResponse();
  const entries = useHistoryEntries();
  const { load } = useHistoryActions();
  const draft = useReportDraft();
  const status = useReportStatus();
  const { generate } = useReportActions();
  const [templateId, setTemplateId] = useState(REPORT_TEMPLATES[0].id);
  const [sessionId, setSessionId] = useState<string | null>(response?.sessionId ?? null);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    void load(); // 세션 라벨 표시용 히스토리 로드
  }, [load]);

  useEffect(() => {
    if (response) setSessionId(response.sessionId); // 새 검색 시 기본값 갱신
  }, [response]);

  const busy = status === 'streaming';
  const sourceLabel =
    sessionId === response?.sessionId && response
      ? '현재 검색 결과'
      : (entries.find((e) => e.sessionId === sessionId)?.queryText ?? '근거 데이터를 선택하세요');

  const onGenerate = () => {
    if (!sessionId) {
      toast('근거 데이터를 선택하세요. (통합 검색 실행 또는 과거 세션 선택)');
      return;
    }
    void generate(sessionId, templateId);
  };

  const onExport = (format: 'pdf' | 'docx') => {
    if (!draft) return;
    void exportReport(draft.markdown, format).catch(() => toast('내보내기에 실패했습니다.'));
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
        description="근거 데이터와 실무 양식을 선택해 초안을 생성하고, 화면에서 직접 수정한 뒤 파일로 내보냅니다."
      />
      <div className="grid grid-cols-[minmax(260px,320px)_minmax(0,1fr)] items-start gap-5 max-[640px]:grid-cols-1">
        <Card>
          <ReportControls
            sourceLabel={sourceLabel}
            sourceSelected={Boolean(sessionId)}
            templateId={templateId}
            busy={busy}
            onOpenPicker={() => setPickerOpen(true)}
            onSelectTemplate={setTemplateId}
          />
          <Button onClick={onGenerate} disabled={busy} className="mt-5 w-full">
            {busy ? <Spinner /> : '보고서 자동 생성'}
          </Button>
          <div className="mt-5 flex flex-wrap gap-2.5 [&>button]:min-w-[100px]">
            <Button variant="ghost" size="sm" className="flex-1" disabled={!draft || status !== 'done'} onClick={() => onExport('pdf')}>
              PDF
            </Button>
            <Button variant="ghost" size="sm" className="flex-1" disabled={!draft || status !== 'done'} onClick={() => onExport('docx')}>
              DOCX
            </Button>
          </div>
          <p className="mt-3 text-center text-[11px] leading-[1.6] text-mut4">
            생성 완료 후 본문을 클릭하면 바로 편집할 수 있습니다
            <br />
            HWP: 다운받은 DOCX를 한글(한컴오피스)에서 바로 열 수 있습니다
          </p>
        </Card>
        <Card className="flex justify-center bg-panel2 p-[26px]">
          <div className="min-h-[400px] w-full max-w-[560px] rounded-md bg-[#F4F4F0] px-[46px] py-10 shadow-[0_16px_50px_rgba(0,0,0,.6)] max-[640px]:px-5 max-[640px]:py-6">
            <ReportEditor />
          </div>
        </Card>
      </div>
      <SourcePickerModal
        open={pickerOpen}
        selected={sessionId}
        onSelect={setSessionId}
        onClose={() => setPickerOpen(false)}
      />
    </section>
  );
}
