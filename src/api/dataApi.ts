import { del, get, post } from './client';
import { ENDPOINTS } from './endpoints';
import { USE_MOCK } from './config';
import { MOCK_DOCUMENTS } from '@/mocks/commonMocks';
import type { StoredDocument, UploadStatus } from '@/types/data';

/** /documents 서버 DTO */
interface ServerDocument {
  id: number;
  title: string;
  doc_type: string;
  domain: string;
  status: string;
  char_count: number;
  chunk_count: number;
  created_at: string;
}
interface UploadResult {
  items: { document_id: number; title: string; original_filename?: string }[];
  failed: { filename: string; detail: string }[];
}

const toStored = (d: ServerDocument): StoredDocument => ({
  id: String(d.id),
  fileName: `${d.title}.${d.doc_type}`,
  charCount: d.char_count,
  chunkCount: d.chunk_count,
  domain: d.domain,
  uploadedAt: d.created_at,
});

/** FNC-DAT-01 · 문서 업로드 (POST /documents · multipart files[]) */
export async function uploadDocument(
  file: File,
  onStage: (status: UploadStatus, progress: number) => void,
): Promise<void> {
  if (USE_MOCK) {
    const stages: [UploadStatus, number][] = [
      ['uploading', 30],
      ['parsing', 60],
      ['embedding', 85],
      ['done', 100],
    ];
    for (const [status, progress] of stages) {
      await new Promise((r) => setTimeout(r, 600));
      onStage(status, progress);
    }
    return;
  }
  const form = new FormData();
  form.append('files', file);
  form.append('domain', 'etc');
  onStage('uploading', 40);
  onStage('parsing', 70); // 서버가 파싱→임베딩까지 동기 처리 후 응답 (진행 이벤트 미제공)
  const data = await post<UploadResult>(ENDPOINTS.data.upload, form);
  const failed = data.failed?.[0];
  if (data.items.length === 0 && failed) throw new Error(failed.detail);
  onStage('done', 100);
}

/** FNC-DAT-02 · 적재 완료 문서 목록 */
export async function listDocuments(): Promise<StoredDocument[]> {
  if (USE_MOCK) return Promise.resolve([...MOCK_DOCUMENTS]);
  return (await get<ServerDocument[]>(ENDPOINTS.data.list)).map(toStored);
}

/** 적재 문서 삭제 (DELETE /documents/{id} — 정식 명세 반영) */
export async function deleteDocument(id: string): Promise<void> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    return;
  }
  await del(ENDPOINTS.data.remove(id));
}
