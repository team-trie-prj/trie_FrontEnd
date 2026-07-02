import { ENDPOINTS } from './endpoints';
import { API_BASE_URL, USE_MOCK } from './config';
import { MOCK_REPORT_MD } from '@/mocks/commonMocks';

/** FNC-REP-01 · 보고서 초안 생성 (스트리밍). */
export async function generateReport(
  sessionId: string,
  templateId: string,
  onChunk: (chunk: string) => void,
): Promise<void> {
  if (USE_MOCK) {
    const words = MOCK_REPORT_MD.split(/(?<=\s)/);
    for (const w of words) {
      await new Promise((r) => setTimeout(r, 18));
      onChunk(w);
    }
    return;
  }
  // TODO: 명세 확정 후 SSE/fetch-stream 포맷 맞추기
  const res = await fetch(API_BASE_URL + ENDPOINTS.report.generate, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
    body: JSON.stringify({ sessionId, templateId }),
  });
  if (!res.ok || !res.body) throw new Error('보고서 생성 실패');
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    onChunk(decoder.decode(value, { stream: true }));
  }
}
