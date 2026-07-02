import { useState } from 'react';
import Icon from '@/components/common/Icon';
import { formatBytes } from '@/utils/fileValidators';
import type { StoredDocument } from '@/types/data';

interface Props {
  doc: StoredDocument;
  onDelete: (id: string) => void;
}

/** 적재 문서 행 — 삭제는 2단계 확인(휴지통 → 삭제 확인) */
export default function DocumentRow({ doc, onDelete }: Props) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="flex items-center gap-3 border-b border-[#141414] px-5 py-3.5 last:border-b-0">
      <Icon name="description" size={18} className="shrink-0 text-mut" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{doc.fileName}</p>
        <p className="mt-0.5 text-xs text-mut3">
          {doc.domain} · 청크 {doc.chunkCount}개 · {formatBytes(doc.size)} ·{' '}
          {doc.uploadedAt.slice(0, 10)}
        </p>
      </div>
      {confirming ? (
        <span className="flex shrink-0 items-center gap-1.5">
          <button
            onClick={() => onDelete(doc.id)}
            className="rounded-[14px] bg-danger px-3 py-1.5 text-[11px] font-semibold text-black"
          >
            삭제 확인
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="rounded-[14px] border border-line2 px-3 py-1.5 text-[11px] text-mut"
          >
            취소
          </button>
        </span>
      ) : (
        <button
          onClick={() => setConfirming(true)}
          className="shrink-0 text-mut3 transition-colors hover:text-danger"
          aria-label={`${doc.fileName} 삭제`}
        >
          <Icon name="delete" size={17} />
        </button>
      )}
    </div>
  );
}
