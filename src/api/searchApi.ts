import { post, postEnvelope } from './client';
import { recordHistory } from './historyApi';
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
import type { QueryTemplate, RoutingResult, SearchResponse } from '@/types/search';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** FNC-SRC-01 예외 · VLM 응답 지연 — 텍스트 단독 검색 전환 확인 트리거 */
export class VlmTimeoutError extends Error {
  constructor() {
    super('VLM 분석 응답 지연');
  }
}

/** FNC-SRC-02 · 모호 질의 — 서버가 검색을 보류(code=CLARIFY)하고 보완을 요구 */
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

/** 라우팅/역제안은 실서버에선 /search 응답(CLARIFY)에 통합 — mock 전용 사전 라우팅 */
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

async function issueSession(): Promise<string> {
  const data = await post<{ session_uuid: string }>(ENDPOINTS.session.issue);
  return data.session_uuid;
}

/** 이미지 첨부 시 VLM 시각 맥락 분석 — 타임아웃 감시 (FNC-SRC-01) */
async function analyzeWithImage(text: string, imageDataUrl: string): Promise<ServerAnalyzeData> {
  const form = new FormData();
  form.append('text', text);
  form.append('domain', 'etc');
  form.append('image', await dataUrlToBlob(imageDataUrl), 'attachment.jpg');
  const req = post<ServerAnalyzeData>(ENDPOINTS.search.analyze, form);
  const timeout = new Promise<never>((_, rej) =>
    setTimeout(() => rej(new VlmTimeoutError()), VLM_TIMEOUT_MS),
  );
  return Promise.race([req, timeout]);
}

/** FNC-SRC-03 · 통합 검색. 세션 UUID 서버 발급 → (이미지면 VLM 분석) → /search */
export async function runSearch(text: string, imageDataUrl?: string): Promise<SearchResponse> {
  if (USE_MOCK) {
    await delay(900);
    if (imageDataUrl && text.includes('지연')) throw new VlmTimeoutError();
    return mockSearchResponse(text, Boolean(imageDataUrl));
  }

  await promptCheck(text);
  const sessionId = await issueSession();
  let queryText = text;
  let vlmContext: string | undefined;
  if (imageDataUrl) {
    // TODO(BE 확인 #6): analyze→search 2단계 흐름 확인 (search가 image를 직접 받는 경로와 중복)
    const analyzed = await analyzeWithImage(text, imageDataUrl);
    queryText = analyzed.unified_query || text;
    vlmContext = analyzed.visual_context?.context_text;
  }

  const form = new FormData();
  form.append('text', queryText);
  form.append('domain', 'etc');
  // TODO(BE 확인 #7): 1회 스킵(skipOnce)·세션 UUID를 /search에 전달하는 필드 명세 필요
  const env = await postEnvelope<ServerSearchData>(ENDPOINTS.search.query, form);
  if (env.code === 'CLARIFY' || env.data.search === null) {
    throw new ClarifyError(mapClarifyTemplates(env.data, text));
  }
  recordHistory(sessionId, text, env.data); // FNC-HIS-01 명시적 기록 (스냅샷 동봉)
  return mapSearchResponse(env.data, sessionId, vlmContext);
}
