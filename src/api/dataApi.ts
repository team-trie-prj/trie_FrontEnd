import { post } from './client';
import { ENDPOINTS } from './endpoints';
import { USE_MOCK } from './config';
import type { UploadStatus } from '@/types/data';

/**
 * FNC-DAT-01 · 문서 업로드. mock 모드에선 업로드→파싱→임베딩 단계를 시뮬레이션.
 * onStage 콜백으로 진행 단계를 알려 스토어가 UI를 갱신한다.
 */
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
