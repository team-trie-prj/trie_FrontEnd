import { markdownToHtml } from './markdown';

/**
 * FNC-REP-02 · 마크다운 → PDF 파일 즉시 다운로드 (html2pdf.js).
 * 인쇄 다이얼로그 없이 바로 저장 — 라이브러리는 클릭 시점에 동적 로드.
 */
const BASE_STYLE =
  'position:fixed;left:-10000px;top:0;width:720px;background:#fff;color:#1A1A18;' +
  "font-family:'Pretendard Variable',Pretendard,'Malgun Gothic',sans-serif;" +
  'font-size:13px;line-height:1.85;padding:8px 6px;';

/** html2canvas가 인라인 스타일만 안정적으로 반영하므로 태그별로 직접 주입 */
function applyDocStyles(root: HTMLElement): void {
  const styles: Record<string, string> = {
    h1: 'font-size:20px;font-weight:700;text-align:center;border-bottom:2px solid #1A1A18;padding-bottom:12px;margin:0 0 18px;',
    h2: 'font-size:15px;font-weight:700;margin:22px 0 8px;',
    h3: 'font-size:14px;font-weight:700;margin:16px 0 6px;',
    p: 'margin:0 0 8px;',
    ul: 'margin:0 0 12px;padding-left:22px;',
    li: 'margin:0 0 4px;',
  };
  for (const [tag, css] of Object.entries(styles)) {
    root.querySelectorAll(tag).forEach((el) => el.setAttribute('style', css));
  }
}

export async function exportPdf(markdown: string): Promise<void> {
  const { default: html2pdf } = await import('html2pdf.js');
  const host = document.createElement('div');
  host.setAttribute('style', BASE_STYLE);
  host.innerHTML = markdownToHtml(markdown);
  applyDocStyles(host);
  document.body.appendChild(host);
  try {
    await html2pdf()
      .set({
        margin: [12, 14],
        filename: `보고서_${new Date().toISOString().slice(0, 10)}.pdf`,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css'] },
      })
      .from(host)
      .save();
  } finally {
    host.remove();
  }
}
