import { markdownToHtml } from './markdown';
import { exportDocx } from './docxExport';
import type { ExportFormat } from '@/types/report';

/** 결재용 문서 레이아웃 (PDF 인쇄용) */
const DOC_STYLE = `
  body{font-family:'Malgun Gothic','Pretendard',sans-serif;color:#1A1A18;line-height:1.85;
    max-width:720px;margin:40px auto;padding:0 30px;font-size:13px}
  h1{font-size:20px;border-bottom:2px solid #1A1A18;padding-bottom:12px;text-align:center}
  h2{font-size:15px;margin-top:24px}
  h3{font-size:14px}
`;

/**
 * FNC-REP-02 · 최종 보고서 파일 내보내기.
 * - pdf: 인쇄 다이얼로그 → "PDF로 저장"
 * - docx: docx 라이브러리로 정식 .docx 빌드 후 다운로드
 */
export async function exportReport(markdown: string, format: ExportFormat): Promise<void> {
  if (format === 'docx') {
    await exportDocx(markdown);
    return;
  }
  const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>${DOC_STYLE}</style></head><body>${markdownToHtml(markdown)}</body></html>`;
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();
}
