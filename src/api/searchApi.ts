import { post } from './client';
import { ENDPOINTS } from './endpoints';
import { USE_MOCK } from './config';
import { MOCK_TEMPLATES, mockSearchResponse } from '@/mocks/searchMocks';
import type { RoutingResult, SearchResponse } from '@/types/search';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** FNC-SRC-01 예외 · VLM 응답 지연 — 텍스트 단독 검색 전환 확인 트리거 */
export class VlmTimeoutError extends Error {
  constructor() {
    super('VLM 분석 응답 지연');
  }
}

/** 실서버 연동 시 사용할 VLM 타임아웃 한계 (TODO: 명세 확정 후 조정) */
export const VLM_TIMEOUT_MS = 15000;

/** 모호 질의 판별 (mock) — 실제로는 백엔드 LLM 에이전트가 판단 (FNC-SRC-02) */
const isAmbiguous = (text: string) => text.trim().length > 0 && text.trim().length < 6;

/** FNC-SRC-01/02 · 질의 라우팅. 모호하면 검색 보류 + 템플릿 역제안. */
export async function routeQuery(text: string, skipSuggestion: boolean): Promise<RoutingResult> {
  if (USE_MOCK) {
    await delay(400);
    if (!skipSuggestion && isAmbiguous(text)) {
      return {
        mode: 'hybrid',
        intent: '판별 불가',
        domain: '공통',
        suggestedTemplates: MOCK_TEMPLATES,
      };
    }
    return { mode: 'hybrid', intent: '통합 조회', domain: '도로' };
  }
  return post<RoutingResult>(ENDPOINTS.search.route, { text, skipSuggestion });
}

/** FNC-SRC-03 · 하이브리드 RAG 탐색 (세션 UUID·no-cache는 client.ts에서 부착) */
export async function runSearch(text: string, imageDataUrl?: string): Promise<SearchResponse> {
  if (USE_MOCK) {
    await delay(900);
    // mock: 질의에 "지연" 포함 + 이미지 첨부 시 VLM 타임아웃 시뮬레이션
    if (imageDataUrl && text.includes('지연')) throw new VlmTimeoutError();
    return mockSearchResponse(text, Boolean(imageDataUrl));
  }
  const req = post<SearchResponse>(ENDPOINTS.search.query, { text, imageBase64: imageDataUrl });
  if (!imageDataUrl) return req;
  // 이미지 포함 시 VLM 타임아웃 감시 (FNC-SRC-01 예외)
  const timeout = new Promise<never>((_, rej) =>
    setTimeout(() => rej(new VlmTimeoutError()), VLM_TIMEOUT_MS),
  );
  return Promise.race([req, timeout]);
}
