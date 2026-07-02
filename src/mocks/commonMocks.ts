import type { LoginResponse } from '@/types/auth';
import type { ApiCatalogEntry } from '@/types/catalog';
import type { HistoryEntry } from '@/types/history';
import type { StoredDocument } from '@/types/data';

export const MOCK_LOGIN: LoginResponse = {
  user: { id: 'u1', nickname: '김성민', role: 'worker' },
  tokens: { accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token' },
};

export const MOCK_CATALOG: ApiCatalogEntry[] = [
  {
    id: 'c1',
    name: '도로교통공단 사고 통계',
    endpointUrl: 'https://apis.data.go.kr/B552061/AccidentStats',
    params: [
      { name: 'siDo', required: true, description: '시도 코드' },
      { name: 'year', required: false },
    ],
    apiKeyMasked: 'a3f9********',
    status: 'active',
    registeredAt: '2026-06-20T09:00:00Z',
  },
];

export const MOCK_HISTORY: HistoryEntry[] = [
  {
    sessionId: 'mock-session-1',
    queryText: '대전 유성구 포트홀 영역을 찾아줘',
    hasImage: true,
    createdAt: '2026-07-01T14:22:00Z',
  },
  {
    sessionId: 'mock-session-2',
    queryText: '노면 상태별 교통사고 통계 보고서로 만들어줘',
    hasImage: false,
    createdAt: '2026-06-30T10:05:00Z',
  },
];

export const MOCK_REPORT_MD = `# 유성구 포트홀 대응 분석 보고서

## 1. 개요
대전 유성구 관내 포트홀 민원 및 사내 지침을 종합 분석한 결과, 5월 민원(73건)이 최고치를 기록했다.

## 2. 탐지 현황
VLM 이미지 분석 결과 직경 약 40cm, 깊이 8cm 이상의 포트홀이 식별되었으며 2차 사고 위험이 높다.

## 3. 공공데이터 연계
도로교통공단 API 기준 최근 6개월 민원 총 318건, 월평균 53건으로 집계되었다.

## 4. 조치 권고
사내 응급복구 매뉴얼(p.12)에 따라 24시간 이내 응급복구 및 안전 표지 설치가 필요하다.`;

export const MOCK_DOCUMENTS: StoredDocument[] = [
  { id: 'd1', fileName: '도로파손_응급복구_매뉴얼_v3.pdf', size: 4718592, chunkCount: 182, domain: '도로', uploadedAt: '2026-06-18T10:12:00Z' },
  { id: 'd2', fileName: '산업현장_안전관리_지침서.docx', size: 2097152, chunkCount: 96, domain: '안전', uploadedAt: '2026-06-21T14:30:00Z' },
  { id: 'd3', fileName: '교통안전시설_설치기준.pdf', size: 8388608, chunkCount: 244, domain: '교통', uploadedAt: '2026-06-25T09:05:00Z' },
  { id: 'd4', fileName: '유성구_민원대응_표준절차.pdf', size: 1258291, chunkCount: 58, domain: '공통', uploadedAt: '2026-06-30T16:44:00Z' },
];
