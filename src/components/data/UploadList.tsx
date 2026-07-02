import Icon from '@/components/common/Icon';
import { formatBytes } from '@/utils/fileValidators';
import { useUploadItems, useUploadActions } from '@/stores/uploadStore';
import type { UploadStatus } from '@/types/data';

const STATUS_KO: Record<UploadStatus, string> = {
  queued: '대기',
  uploading: '업로드 중',
  parsing: '텍스트 파싱 중',
  embedding: '임베딩·적재 중',
  done: '적재 완료',
  error: '실패',
};

/** FNC-DAT-01/02 · 업로드 큐 — 파싱→임베딩 단계 진행 표시 */
export default function UploadList() {
  const items = useUploadItems();
  const { remove } = useUploadActions();

  if (items.length === 0) return null;

  return (
    <div className="mt-5 flex flex-col gap-3">
      {items.map((it) => (
        <div key={it.id} className="rounded-[0.875rem] border border-line bg-panel p-4">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <Icon name="description" size={20} className="text-mut" />
            <span className="flex-1 truncate text-sm font-medium">{it.fileName}</span>
            <span className="text-xs text-mut4">{formatBytes(it.size)}</span>
            <span
              className={`text-xs font-semibold ${
                it.status === 'error'
                  ? 'text-danger'
                  : it.status === 'done'
                    ? 'text-ink'
                    : 'text-mut'
              }`}
            >
              {STATUS_KO[it.status]}
            </span>
            <button onClick={() => remove(it.id)} className="text-mut3 hover:text-ink" aria-label="제거">
              <Icon name="close" size={16} />
            </button>
          </div>
          {it.status !== 'done' && it.status !== 'error' && (
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#1A1A1A]">
              <div
                className="h-full rounded-full bg-white transition-all duration-500"
                style={{ width: `${it.progress}%` }}
              />
            </div>
          )}
          {it.errorMessage && <p className="mt-2 text-xs text-danger">{it.errorMessage}</p>}
        </div>
      ))}
    </div>
  );
}
