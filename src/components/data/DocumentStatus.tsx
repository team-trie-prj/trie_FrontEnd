import { useEffect, useState } from 'react';
import Card from '@/components/common/Card';
import Icon from '@/components/common/Icon';
import Label from '@/components/common/Label';
import { listDocuments } from '@/api/dataApi';
import { formatBytes } from '@/utils/fileValidators';
import type { StoredDocument } from '@/types/data';

/** 지식 베이스 적재 현황 — 문서 수·청크·용량 통계 + 문서 목록 (FNC-DAT-02) */
export default function DocumentStatus() {
  const [docs, setDocs] = useState<StoredDocument[] | null>(null);

  useEffect(() => {
    listDocuments()
      .then(setDocs)
      .catch(() => setDocs([]));
  }, []);

  const totalChunks = docs?.reduce((n, d) => n + d.chunkCount, 0) ?? 0;
  const totalSize = docs?.reduce((n, d) => n + d.size, 0) ?? 0;

  return (
    <Card className="mt-6 overflow-hidden p-0">
      <div className="px-5 py-4">
        <Label>지식 베이스 적재 현황</Label>
      </div>
      <div className="grid grid-cols-3 gap-px border-y border-line bg-line">
        {[
          ['적재 문서', docs ? `${docs.length}건` : '—'],
          ['임베딩 청크', docs ? totalChunks.toLocaleString() : '—'],
          ['총 용량', docs ? formatBytes(totalSize) : '—'],
        ].map(([k, v]) => (
          <div key={k} className="bg-black p-5 text-center">
            <div className="text-[26px] font-light">{v}</div>
            <div className="mt-1 text-xs text-mut2">{k}</div>
          </div>
        ))}
      </div>
      {docs === null && <p className="px-5 py-4 text-[13px] text-mut3">불러오는 중…</p>}
      {docs?.length === 0 && (
        <p className="px-5 py-4 text-[13px] text-mut3">적재된 문서가 없습니다.</p>
      )}
      {docs?.map((d) => (
        <div
          key={d.id}
          className="flex items-center gap-3 border-b border-[#141414] px-5 py-3.5 last:border-b-0"
        >
          <Icon name="description" size={18} className="shrink-0 text-mut" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{d.fileName}</p>
            <p className="mt-0.5 text-xs text-mut3">
              {d.domain} · 청크 {d.chunkCount}개 · {formatBytes(d.size)}
            </p>
          </div>
          <span className="shrink-0 text-[11px] text-mut4">{d.uploadedAt.slice(0, 10)}</span>
        </div>
      ))}
    </Card>
  );
}
