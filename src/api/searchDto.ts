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
  source: string; // vector | keyword | public_api
  document_id: number | null;
  chunk_index: number | null;
  score: number;
  domain?: string;
  text: string;
  stats?: Record<string, unknown> | { label: string; value: number }[] | null;
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
  route === 'rdb' || route === 'bm25' || route === 'keyword' ? 'rdb' : route === 'vector' ? 'vector' : 'hybrid';

/** 공공 수치 stats — 배열([{label,value}]) 또는 객체({라벨:수치})를 모두 수용 */
function toStats(raw: ServerHit['stats']): { label: string; value: number }[] | undefined {
  if (!raw) return undefined;
  if (Array.isArray(raw)) {
    const rows = raw.filter((r) => r && typeof r.value === 'number' && r.label != null);
    return rows.length ? rows : undefined;
  }
  const rows = Object.entries(raw)
    .filter(([, v]) => typeof v === 'number' || (typeof v === 'string' && v !== '' && !Number.isNaN(Number(v))))
    .map(([label, v]) => ({ label, value: Number(v) }));
  return rows.length ? rows : undefined;
}

function toHit(h: ServerHit, i: number): SearchHit {
  const internal = ['vector', 'bm25', 'rdb', 'keyword'].includes(h.source);
  const label = internal
    ? `문서 #${h.document_id ?? '-'} · 청크 ${h.chunk_index ?? '-'}`
    : '공공데이터 API';
  return {
    id: `${h.document_id ?? 'pub'}-${h.chunk_index ?? 0}-${i}`,
    source: internal ? 'internal_doc' : 'public_api',
    title: label,
    text: h.text,
    score: h.score,
    provenance: { label, snippet: h.text },
    stats: toStats(h.stats),
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
