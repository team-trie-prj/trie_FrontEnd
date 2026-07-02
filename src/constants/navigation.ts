/** 명세서 화면 기준 라우트 — 데모의 그룹형 상단 네비 구조 유지 */
export const ROUTES = {
  login: '/login',
  search: '/',
  results: '/results',
  data: '/data',
  catalog: '/catalog',
  report: '/report',
} as const;

export interface NavItem {
  to: string;
  icon: string;
  title: string;
  desc: string;
}

export interface NavGroup {
  key: string;
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    key: 'search',
    label: '검색',
    items: [
      {
        to: ROUTES.search,
        icon: 'auto_awesome',
        title: '통합 검색',
        desc: '텍스트·이미지 멀티모달 질의',
      },
      {
        to: ROUTES.results,
        icon: 'search',
        title: '검색 결과',
        desc: '하이브리드 RAG · 출처 표기',
      },
    ],
  },
  {
    key: 'data',
    label: '데이터',
    items: [
      {
        to: ROUTES.data,
        icon: 'upload_file',
        title: '데이터 관리',
        desc: '문서 업로드·파싱·임베딩',
      },
      {
        to: ROUTES.catalog,
        icon: 'api',
        title: 'API 관리',
        desc: '공공데이터 카탈로그 연동',
      },
    ],
  },
  {
    key: 'output',
    label: '산출',
    items: [
      {
        to: ROUTES.report,
        icon: 'description',
        title: '보고서 뷰어',
        desc: '초안 생성·편집·내보내기',
      },
    ],
  },
];
