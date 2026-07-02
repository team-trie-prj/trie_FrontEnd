import Spinner from '@/components/common/Spinner';
import RichTextEditor from './RichTextEditor';
import { markdownToHtml } from '@/utils/markdown';
import { useReportDraft, useReportStatus, useReportActions } from '@/stores/reportStore';

/**
 * FNC-REP-01/02 · 보고서 뷰어/에디터.
 * - 스트리밍 중: 실시간 마크다운 렌더링
 * - 완료 후: TipTap 위지윅 에디터로 본문 직접 수정 (마크다운 동기화)
 */
export default function ReportEditor() {
  const draft = useReportDraft();
  const status = useReportStatus();
  const { setMarkdown } = useReportActions();

  if (!draft) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-[13px] text-[#6B6B64]">
        양식을 선택하고 '보고서 자동 생성'을 누르면 초안이 스트리밍으로 작성됩니다.
      </div>
    );
  }

  if (status === 'streaming') {
    return (
      <div>
        <div
          className="report-doc text-[13px] leading-[1.85] text-[#3C3C38] [&_h1]:mb-4 [&_h1]:border-b-2 [&_h1]:border-[#1A1A18] [&_h1]:pb-3 [&_h1]:text-center [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-[#1A1A18] [&_h2]:mb-2 [&_h2]:mt-5 [&_h2]:text-sm [&_h2]:font-bold [&_h2]:text-[#1A1A18] [&_p]:mb-2 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5"
          dangerouslySetInnerHTML={{ __html: markdownToHtml(draft.markdown) }}
        />
        <p className="mt-3 flex items-center gap-2 text-xs text-[#6B6B64]">
          <Spinner /> 초안 작성 중…
        </p>
      </div>
    );
  }

  return (
    <div>
      {draft.insufficientData && (
        <p className="mb-4 rounded-md border border-[#B00020]/40 bg-[#B00020]/10 px-3 py-2 text-xs text-[#B00020]">
          ⚠ 참조 데이터 부족으로 분석이 제한적입니다.
        </p>
      )}
      {/* generatedAt 키로 새 초안마다 에디터 재마운트 */}
      <RichTextEditor
        key={draft.generatedAt}
        initialMarkdown={draft.markdown}
        onChange={setMarkdown}
      />
    </div>
  );
}
