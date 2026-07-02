import type { ReportTemplate } from '@/types/report';

/** FNC-REP-01 · 실무 양식 목록 */
export const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'safety-check',
    label: '안전 점검 일지',
    description: '현장 점검 결과·조치 사항 중심 일지 양식',
  },
  {
    id: 'civil-brief',
    label: '민원 대응 브리핑',
    description: '민원 통계·대응 현황 요약 브리핑 양식',
  },
  {
    id: 'analysis',
    label: '분석 보고서',
    description: '데이터 근거 중심의 종합 분석 보고서 양식',
  },
];
