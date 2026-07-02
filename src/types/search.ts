/** FNC-SRC-01/02/03 · 멀티모달 질의 → 라우팅 → 하이브리드 RAG 탐색 */

export interface AttachedImage {
  name: string;
  size: number;
  /** base64 data URL — 백엔드 전송용 인코딩 (FNC-SRC-01) */
  dataUrl: string;
}

export type RoutingMode = 'rdb' | 'vector' | 'hybrid';

/** FNC-SRC-02 · 모호 질의 시 역제안되는 맞춤형 질의 템플릿 */
export interface QueryTemplate {
  id: string;
  domain: '도로' | '안전' | '교통' | '공통';
  label: string;
  queryText: string;
}

export interface RoutingResult {
  mode: RoutingMode;
  intent: string;
  domain: string;
  /** 질의가 모호하여 검색 보류 + 템플릿 역제안 */
  suggestedTemplates?: QueryTemplate[];
}

export type HitSource = 'internal_doc' | 'public_api' | 'vlm_context';

export interface SourceMeta {
  /** 예: "안전지침 매뉴얼 p.12", "도로교통공단 API" — 없으면 출처 미상 처리 (FNC-VIW-01) */
  label: string | null;
  url?: string;
  /** 근거 전후 맥락 텍스트 (스니펫 모달용) */
  snippet?: string;
}

/** FNC-VIW-02 · 공공데이터 정형 수치 (차트/표 렌더링용) */
export interface StatRow {
  label: string;
  value: number;
}

export interface SearchHit {
  id: string;
  source: HitSource;
  title: string;
  text: string;
  score: number;
  provenance: SourceMeta | null;
  /** public_api 결과에만 존재. 비정형 줄글이면 undefined → 차트 우회 */
  stats?: StatRow[];
}

export interface SearchResponse {
  sessionId: string;
  routing: RoutingResult;
  /** LLM 에이전트가 검색 결과를 종합한 자연어 답변 (FNC-VIW-01 상단 노출) */
  answer?: string;
  /** 최대 10개 청크 제한 (FNC-SRC-03) */
  hits: SearchHit[];
  /** VLM 이미지 분석 맥락 텍스트 */
  vlmContext?: string;
}
