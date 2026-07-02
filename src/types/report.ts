/** FNC-REP-01/02 · 보고서 생성 · 편집 · 내보내기 */

export interface ReportTemplate {
  id: string;
  label: string;
  description: string;
}

export type ReportStatus = 'idle' | 'streaming' | 'done' | 'error';

export interface ReportDraft {
  /** 마크다운 포맷 초안 (스트리밍 수신) */
  markdown: string;
  templateId: string;
  /** 참조 데이터 부족 시 상단 강제 경고 (FNC-REP-01 예외) */
  insufficientData: boolean;
  generatedAt: string;
}

export type ExportFormat = 'pdf' | 'docx';
