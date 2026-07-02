import type { QueryTemplate, SearchResponse } from '@/types/search';
import { newSessionId } from '@/utils/uuid';

/** FNC-SRC-02 · 도메인별 맞춤형 질의 템플릿 (사전 등록분) */
export const MOCK_TEMPLATES: QueryTemplate[] = [
  {
    id: 't1',
    domain: '도로',
    label: '유성구 포트홀 공공 민원 통계 검색',
    queryText: '대전 유성구 포트홀 민원 접수 통계를 최근 1년 기준으로 보여줘',
  },
  {
    id: 't2',
    domain: '안전',
    label: '산업현장 안전모 미착용 조치 절차',
    queryText: '산업현장에서 안전모 미착용 발견 시 조치 절차와 관련 지침을 알려줘',
  },
  {
    id: 't3',
    domain: '교통',
    label: '노면 상태별 교통사고 통계 조회',
    queryText: '대전 노면 상태별 교통사고 발생 건수를 연도별로 조회해줘',
  },
];

export function mockSearchResponse(text: string, hasImage: boolean): SearchResponse {
  return {
    sessionId: newSessionId(),
    routing: { mode: 'hybrid', intent: '통계+지침 융합 조회', domain: '도로' },
    answer:
      `'${text || '첨부 이미지'}' 질의에 대해 사내 지침서 2건과 공공데이터 통계 1건을 종합했습니다. ` +
      '최근 6개월 포트홀 민원은 총 318건으로 5월(73건)이 최고치이며, 사내 응급복구 매뉴얼 기준 ' +
      '깊이 5cm 이상 포트홀은 24시간 이내 응급복구 대상입니다.' +
      (hasImage ? ' 첨부 이미지에서는 깊이 8cm급 포트홀이 식별되어 우선 조치가 필요합니다.' : ''),
    vlmContext: hasImage
      ? '이미지 분석: 아스팔트 노면에 직경 약 40cm, 깊이 8cm 이상의 포트홀이 식별됨. 차선 인접부로 2차 사고 위험이 높음.'
      : undefined,
    hits: [
      {
        id: 'h1',
        source: 'internal_doc',
        title: '도로 파손 응급복구 매뉴얼',
        text: '포트홀 발견 시 심각도(깊이 5cm 이상) 기준으로 24시간 이내 응급복구를 실시하며…',
        score: 0.92,
        provenance: {
          label: '안전지침 매뉴얼 p.12',
          snippet:
            '…제3절 응급복구 기준. 포트홀 발견 시 심각도(깊이 5cm 이상) 기준으로 24시간 이내 응급복구를 실시하며, 복구 전 안전 표지 설치를 의무화한다. 복구 후 7일 이내 재점검을…',
        },
      },
      {
        id: 'h2',
        source: 'public_api',
        title: `${text.includes('유성') ? '유성구' : '대전'} 포트홀 민원 월별 통계`,
        text: '최근 6개월 포트홀 관련 민원 접수 건수 집계',
        score: 0.88,
        provenance: { label: '도로교통공단 API', url: 'https://www.data.go.kr' },
        stats: [
          { label: '1월', value: 42 },
          { label: '2월', value: 38 },
          { label: '3월', value: 61 },
          { label: '4월', value: 55 },
          { label: '5월', value: 73 },
          { label: '6월', value: 49 },
        ],
      },
      {
        id: 'h3',
        source: 'internal_doc',
        title: '긴급 보수 우선순위 산정 기준',
        text: '교통량·심각도·민원 빈도를 가중 합산하여 보수 우선순위를 산정한다…',
        score: 0.81,
        provenance: null, // 출처 미상 → "확인 주의" 붉은 배지 (FNC-VIW-01 예외)
      },
    ],
  };
}
