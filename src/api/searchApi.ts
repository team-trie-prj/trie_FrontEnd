import { post, postRaw } from './client';
import { ENDPOINTS } from './endpoints';
import { USE_MOCK } from './config';
import { MOCK_TEMPLATES, mockSearchResponse } from '@/mocks/searchMocks';
import {
  dataUrlToBlob,
  mapClarifyTemplates,
  mapSearchResponse,
  type ServerAnalyzeData,
  type ServerSearchData,
} from './searchDto';
import { newSessionId } from '@/utils/uuid';
import type { QueryTemplate, RoutingResult, SearchResponse } from '@/types/search';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** FNC-SRC-01 예외 · VLM 응답 지연 — 텍스트 단독 검색 전환 확인 트리거 */
export class VlmTimeoutError extends Error {
  constructor() {
    super('VLM 분석 응답 지연');
  }
}

/** FNC-SRC-02 · 모호 질의 — 서버가 검색을 보류(search=null)하고 보완을 요구 */
export class ClarifyError extends Error {
  constructor(public templates: QueryTemplate[]) {
    super('질의가 모호하여 재질의가 필요합니다');
  }
}

/** 서버 프롬프트 인젝션 검사에서 차단 권고된 질의 */
export class PromptBlockedError extends Error {}

export const VLM_TIMEOUT_MS = 15000;

/** FNC 보안 · 질의 프롬프트 인젝션 사전 검사 (POST /security/prompt-check) */
async function promptCheck(text: string): Promise<void> {
  const data = await post<{ flagged: boolean; matches: string[] }>(
    ENDPOINTS.search.promptCheck,
    { text },
  );
  if (data.flagged) {
    throw new PromptBlockedError('허용되지 않는 질의 패턴이 감지되어 검색이 차단되었습니다.');
  }
}

const isAmbiguous = (text: string) => text.trim().length > 0 && text.trim().length < 6;

/** 라우팅/역제안은 실서버에선 /search 응답(search=null)에 통합 — mock 전용 사전 라우팅 */
export async function routeQuery(text: string, skipSuggestion: boolean): Promise<RoutingResult> {
  if (USE_MOCK) {
    await delay(400);
    if (!skipSuggestion && isAmbiguous(text)) {
      return { mode: 'hybrid', intent: '판별 불가', domain: '공통', suggestedTemplates: MOCK_TEMPLATES };
    }
    return { mode: 'hybrid', intent: '통합 조회', domain: '도로' };
  }
  return { mode: 'hybrid', intent: '', domain: 'etc' };
}

/** 이미지 첨부 시 VLM 시각 맥락 분석 — 타임아웃 감시 (FNC-SRC-01) */
async function analyzeWithImage(text: string, imageDataUrl: string): Promise<ServerAnalyzeData> {
  const form = new FormData();
  form.append('text', text);
  form.append('domain', 'etc');
  form.append('image', await dataUrlToBlob(imageDataUrl), 'attachment.jpg');
  const req = postRaw<ServerAnalyzeData>(ENDPOINTS.search.analyze, form);
  const timeout = new Promise<never>((_, rej) =>
    setTimeout(() => rej(new VlmTimeoutError()), VLM_TIMEOUT_MS),
  );
  return Promise.race([req, timeout]);
}

/** FNC-SRC-03 · 통합 검색 — 세션은 X-Session-Id 헤더 기반(서버가 응답 session_id로 확정).
 *  이력은 백엔드 미들웨어가 자동 로깅한다. */
export async function runSearch(
  text: string,
  imageDataUrl?: string,
  skipClarify = false,
): Promise<SearchResponse> {
  if (USE_MOCK) {
    await delay(900);
    if (imageDataUrl && text.includes('지연')) throw new VlmTimeoutError();
    return mockSearchResponse(text, Boolean(imageDataUrl));
  }

  await promptCheck(text);
  let queryText = text;
  let vlmContext: string | undefined;
  if (imageDataUrl) {
    const analyzed = await analyzeWithImage(text, imageDataUrl);
    queryText = analyzed.unified_query || text;
    vlmContext = analyzed.visual_context?.context_text;
  }

  const form = new FormData();
  form.append('text', queryText);
  form.append('domain', 'etc');
  form.append('skip_clarify', String(skipClarify));
  const data = await postRaw<ServerSearchData & { session_id?: string | null }>(
    ENDPOINTS.search.query,
    form,
  );
  if (data.search === null || data.agent.route === 'clarify') {
    throw new ClarifyError(mapClarifyTemplates(data, text));
  }
  return mapSearchResponse(data, data.session_id ?? newSessionId(), vlmContext);
}
