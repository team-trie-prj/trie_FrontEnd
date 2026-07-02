import { get, post, request } from './client';
import { ENDPOINTS } from './endpoints';
import { USE_MOCK } from './config';
import { MOCK_DOCUMENTS } from '@/mocks/commonMocks';
import type { StoredDocument, UploadStatus } from '@/types/data';

/** FNC-DAT-01 · 문서 업로드. mock 모드에선 업로드→파싱→임베딩 단계를 시뮬레이션. */
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
  form.append('file', file);
  onStage('uploading', 30);
  await post(ENDPOINTS.data.upload, form);
  // TODO: 파싱/임베딩 진행 상태 폴링 or SSE (명세 확정 후)
  onStage('done', 100);
}

/** FNC-DAT-02 · 적재 완료 문서 목록 (지식 베이스 현황) */
export async function listDocuments(): Promise<StoredDocument[]> {
  if (USE_MOCK) return Promise.resolve([...MOCK_DOCUMENTS]);
  return get<StoredDocument[]>(ENDPOINTS.data.list);
}

/** 적재 문서 삭제 (명세 외 기능 — 명세외_추가기능.txt 참조) */
export async function deleteDocument(id: string): Promise<void> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    return;
  }
  await request(ENDPOINTS.data.remove(id), { method: 'DELETE' });
}
