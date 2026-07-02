import { create } from 'zustand';
import * as dataApi from '@/api/dataApi';
import { validateDocument } from '@/utils/fileValidators';
import { toast } from './uiStore';
import { newSessionId } from '@/utils/uuid';
import type { UploadItem } from '@/types/data';

/** FNC-DAT-01 · 문서 업로드 큐 상태 */
interface UploadState {
  items: UploadItem[];
  actions: {
    /** 검증 통과 파일만 큐에 넣고 순차 업로드 */
    enqueue: (files: File[]) => void;
    remove: (id: string) => void;
  };
}

const useUploadStore = create<UploadState>()((set) => ({
  items: [],
  actions: {
    enqueue: (files) => {
      for (const file of files) {
        const error = validateDocument(file);
        if (error) {
          toast(error); // 20MB 초과/확장자 위반 → 업로드 차단 + 안내 (FNC-DAT-01 예외)
          continue;
        }
        const id = newSessionId();
        const item: UploadItem = {
          id,
          fileName: file.name,
          size: file.size,
          status: 'queued',
          progress: 0,
          uploadedAt: new Date().toISOString(),
        };
        set((s) => ({ items: [item, ...s.items] }));
        dataApi
          .uploadDocument(file, (status, progress) =>
            set((s) => ({
              items: s.items.map((it) => (it.id === id ? { ...it, status, progress } : it)),
            })),
          )
          .catch(() =>
            set((s) => ({
              items: s.items.map((it) =>
                it.id === id
                  ? { ...it, status: 'error', errorMessage: '업로드에 실패했습니다.' }
                  : it,
              ),
            })),
          );
      }
    },
    remove: (id) => set((s) => ({ items: s.items.filter((it) => it.id !== id) })),
  },
}));
export const useUploadItems = () => useUploadStore((s) => s.items);
export const useUploadActions = () => useUploadStore((s) => s.actions);
