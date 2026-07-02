import { exportDocx } from './docxExport';
import { exportPdf } from './pdfExport';
import type { ExportFormat } from '@/types/report';

/** FNC-REP-02 · 최종 보고서 파일 내보내기 디스패처. */
export async function exportReport(markdown: string, format: ExportFormat): Promise<void> {
  if (format === 'docx') {
    await exportDocx(markdown);
    return;
  }
  await exportPdf(markdown);
}
