import { postRaw } from './client';
import { ENDPOINTS } from './endpoints';
import { USE_MOCK } from './config';
import { MOCK_REPORT_MD } from '@/mocks/commonMocks';

/** FE 양식 ID → 서버 report_type (허용값: inspection_log·civil_brief·analysis·improvement_reco·situation_brief) */
const REPORT_TYPE_BY_TEMPLATE: Record<string, string> = {
  'safety-check': 'inspection_log',
  'civil-brief': 'civil_brief',
  analysis: 'analysis',
};

interface ServerReport {
  id: number | null;
  session_id: string;
  content: string;
  sources?: { document_id: number; chunk_index: number; source: string }[];
  created_at: string;
}

/** FNC-REP-01 · 보고서 초안 생성.
 *  실서버는 단건 JSON 응답(SSE 아님) — 완성본을 1회 청크로 전달해 스트리밍 인터페이스를 유지한다. */
export async function generateReport(
  sessionId: string,
  templateId: string,
  onChunk: (chunk: string) => void,
  query?: string,
): Promise<void> {
  if (USE_MOCK) {
    const words = MOCK_REPORT_MD.split(/(?<=\s)/);
    for (const w of words) {
      await new Promise((r) => setTimeout(r, 18));
      onChunk(w);
    }
    return;
  }
  const data = await postRaw<ServerReport>(ENDPOINTS.report.generate, {
    query: query ?? '',
    domain: 'etc',
    report_type: REPORT_TYPE_BY_TEMPLATE[templateId] ?? templateId,
    session_id: sessionId || null,
  });
  onChunk(data.content);
}
