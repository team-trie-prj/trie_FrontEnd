import { markdownToHtml } from './markdown';
import type { ExportFormat } from '@/types/report';

/** 결재용 문서 레이아웃 (시스템 서식) */
const DOC_STYLE = `
  body{font-family:'Malgun Gothic','Pretendard',sans-serif;color:#1A1A18;line-height:1.85;
    max-width:720px;margin:40px auto;padding:0 30px;font-size:13px}
  h1{font-size:20px;border-bottom:2px solid #1A1A18;padding-bottom:12px;text-align:center}
  h2{font-size:15px;margin-top:24px}
  h3{font-size:14px}
`;

function buildHtmlDoc(markdown: string): string {
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>${DOC_STYLE}</style></head><body>${markdownToHtml(markdown)}</body></html>`;
}

/**
 * FNC-REP-02 · 최종 보고서 파일 내보내기.
 * - pdf: 인쇄 다이얼로그 → "PDF로 저장" (TODO: jsPDF 등 전용 라이브러리 검토)
 * - docx: Word 호환 HTML(.doc) 다운로드 (TODO: docx 라이브러리로 정식 .docx 빌드)
 */
export function exportReport(markdown: string, format: ExportFormat): void {
  const html = buildHtmlDoc(markdown);

  if (format === 'pdf') {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
    return;
  }

  const blob = new Blob(['﻿', html], { type: 'application/msword' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `보고서_${new Date().toISOString().slice(0, 10)}.doc`;
  a.click();
  URL.revokeObjectURL(a.href);
}
