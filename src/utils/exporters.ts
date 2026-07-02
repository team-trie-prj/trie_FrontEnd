import { exportDocx } from './docxExport';
import { exportPdf } from './pdfExport';
import type { ExportFormat } from '@/types/report';

/**
 * FNC-REP-02 · 최종 보고서 파일 내보내기 디스패처.
 * - pdf: html2pdf.js로 PDF 파일 즉시 다운로드
 * - docx: docx 라이브러리로 정식 .docx 빌드
 *   (HWP는 다운받은 DOCX를 한글에서 바로 열 수 있음 — 화면 안내 문구 참조)
 * 두 라이브러리 모두 클릭 시점 동적 import — 초기 청크 영향 없음.
 */
export async function exportReport(markdown: string, format: ExportFormat): Promise<void> {
  if (format === 'docx') {
    await exportDocx(markdown);
    return;
  }
  await exportPdf(markdown);
}
