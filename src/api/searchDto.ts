import type { QueryTemplate, RoutingMode, SearchHit, SearchResponse } from '@/types/search';

/** /search · /search/analyze 서버 DTO ↔ FE 도메인 타입 매퍼 */

export interface ServerAgent {
  query: string;
  domain: string;
  intent?: string;
  route: string;
  is_ambiguous: boolean;
  keywords?: string[];
  template?: { title: string; message: string; required: string[] } | null;
}

export interface ServerHit {
  source: string;
  document_id: number;
  chunk_index: number;
  score: number;
  domain?: string;
  text: string;
}

export interface ServerSearchData {
  agent: ServerAgent;
  search: {
    route: string;
    query: string;
    hits: ServerHit[];
    used_tokens?: number;
    truncated?: boolean;
    note?: string | null;
  } | null;
}

export interface ServerAnalyzeData {
  unified_query: string;
  keywords?: string[];
  domain_hint?: string;
  visual_context?: { context_text: string; labels?: string[]; situation?: string } | null;
}

const toMode = (route: string): RoutingMode =>
  route === 'rdb' || route === 'bm25' ? 'rdb' : route === 'vector' ? 'vector' : 'hybrid';

function toHit(h: ServerHit, i: number): SearchHit {
  const label = `문서 #${h.document_id} · 청크 ${h.chunk_index}`;
  return {
    id: `${h.document_id}-${h.chunk_index}-${i}`,
    // TODO(BE 확인 #5): 공공데이터 수치 hit의 source 값·stats 포맷 명세 미기재 — vector/bm25/rdb 외는 public_api로 간주
    source: ['vector', 'bm25', 'rdb'].includes(h.source) ? 'internal_doc' : 'public_api',
    title: label,
    text: h.text,
    score: h.score,
    provenance: { label, snippet: h.text },
  };
}

export function mapSearchResponse(
  data: ServerSearchData,
  sessionId: string,
  vlmContext?: string,
): SearchResponse {
  return {
    sessionId,
    routing: {
      mode: toMode(data.search?.route ?? data.agent.route),
      intent: data.agent.intent ?? '',
      domain: data.agent.domain,
    },
    hits: (data.search?.hits ?? []).map(toHit),
    vlmContext,
  };
}

/** CLARIFY(모호 질의) 템플릿 → FE 역제안 템플릿. 서버는 보완 항목 안내만 주므로 질의 보강 문구를 구성한다. */
export function mapClarifyTemplates(data: ServerSearchData, originalText: string): QueryTemplate[] {
  const t = data.agent.template;
  const required = t?.required ?? data.agent.keywords ?? [];
  return [
    {
      id: 'clarify-0',
      domain: '공통',
      label: t ? `${t.title} — ${t.message}` : '질의를 구체화해 주세요',
      queryText: required.length ? `${originalText} (${required.join(', ')} 포함해 구체적으로)` : originalText,
    },
  ];
}

/** 리사이징된 dataURL → multipart 전송용 Blob */
export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  return (await fetch(dataUrl)).blob();
}
