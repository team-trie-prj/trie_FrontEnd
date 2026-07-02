/** FNC-REP-02 · 마크다운 → 정식 .docx 빌드 (docx 라이브러리). */
type DocxModule = typeof import('docx');

/** **굵게** 마킹을 TextRun 배열로 분해 */
function toRuns(docx: DocxModule, text: string) {
  const { TextRun } = docx;
  return text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((seg) =>
    seg.startsWith('**') && seg.endsWith('**')
      ? new TextRun({ text: seg.slice(2, -2), bold: true })
      : new TextRun({ text: seg }),
  );
}

export async function exportDocx(markdown: string): Promise<void> {
  const docx = await import('docx');
  const { Document, HeadingLevel, Packer, Paragraph, AlignmentType } = docx;
  const strip = (s: string) => s.replace(/\*\*/g, '');
  const children = [];

  for (const raw of markdown.split('\n')) {
    const line = raw.trimEnd();
    if (!line.trim()) continue;
    if (line.startsWith('### ')) {
      children.push(new Paragraph({ text: strip(line.slice(4)), heading: HeadingLevel.HEADING_3 }));
    } else if (line.startsWith('## ')) {
      children.push(new Paragraph({ text: strip(line.slice(3)), heading: HeadingLevel.HEADING_2 }));
    } else if (line.startsWith('# ')) {
      children.push(
        new Paragraph({
          text: strip(line.slice(2)),
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
        }),
      );
    } else if (/^[-*]\s+/.test(line)) {
      children.push(
        new Paragraph({
          children: toRuns(docx, line.replace(/^[-*]\s+/, '')),
          bullet: { level: 0 },
        }),
      );
    } else {
      children.push(new Paragraph({ children: toRuns(docx, line), spacing: { after: 120 } }));
    }
  }

  const doc = new Document({
    creator: 'TRIE 지능형 정보 시스템',
    sections: [{ children }],
  });

  const blob = await Packer.toBlob(doc);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `보고서_${new Date().toISOString().slice(0, 10)}.docx`;
  a.click();
  URL.revokeObjectURL(a.href);
}
