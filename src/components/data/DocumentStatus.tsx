import { useEffect, useState } from 'react';
import Card from '@/components/common/Card';
import Icon from '@/components/common/Icon';
import Label from '@/components/common/Label';
import DocumentRow from './DocumentRow';
import { deleteDocument, listDocuments } from '@/api/dataApi';
import { formatBytes } from '@/utils/fileValidators';
import { toast } from '@/stores/uiStore';
import type { StoredDocument } from '@/types/data';

/** 지식 베이스 적재 현황 — 통계 + 검색 + 삭제 (검색·삭제는 명세 외 기능) */
export default function DocumentStatus() {
  const [docs, setDocs] = useState<StoredDocument[] | null>(null);
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    listDocuments()
      .then(setDocs)
      .catch(() => setDocs([]));
  }, []);

  const onDelete = (id: string) => {
    void deleteDocument(id)
      .then(() => {
        setDocs((prev) => prev?.filter((d) => d.id !== id) ?? prev);
        toast('문서를 삭제했습니다.');
      })
      .catch(() => toast('문서 삭제에 실패했습니다.'));
  };

  const q = keyword.trim().toLowerCase();
  const filtered =
    docs?.filter(
      (d) => !q || d.fileName.toLowerCase().includes(q) || d.domain.toLowerCase().includes(q),
    ) ?? null;
  const totalChunks = docs?.reduce((n, d) => n + d.chunkCount, 0) ?? 0;
  const totalSize = docs?.reduce((n, d) => n + d.size, 0) ?? 0;

  return (
    <Card className="mt-6 overflow-hidden p-0">
      <div className="flex items-center justify-between gap-3 px-5 py-4 max-[640px]:flex-col max-[640px]:items-stretch">
        <Label>지식 베이스 적재 현황</Label>
        <div className="flex items-center gap-2 rounded-[10px] border border-line3 bg-panel2 px-3 py-2">
          <Icon name="search" size={15} className="shrink-0 text-mut3" />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            aria-label="적재 문서 검색"
            placeholder="파일명·도메인 검색"
            className="w-[170px] border-none bg-transparent text-[13px] text-ink outline-none placeholder:text-mut4 max-[640px]:w-full"
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-px border-y border-line bg-line">
        {[
          ['적재 문서', docs ? `${docs.length}건` : '—'],
          ['임베딩 청크', docs ? totalChunks.toLocaleString() : '—'],
          ['총 용량', docs ? formatBytes(totalSize) : '—'],
        ].map(([k, v]) => (
          <div key={k} className="bg-black p-5 text-center max-[480px]:p-3">
            <div className="text-[clamp(16px,2.6vw,26px)] font-light">{v}</div>
            <div className="mt-1 text-xs text-mut2">{k}</div>
          </div>
        ))}
      </div>
      {filtered === null && <p className="px-5 py-4 text-[13px] text-mut3">불러오는 중…</p>}
      {filtered?.length === 0 && (
        <p className="px-5 py-4 text-[13px] text-mut3">
          {q ? `'${keyword}' 검색 결과가 없습니다.` : '적재된 문서가 없습니다.'}
        </p>
      )}
      {filtered?.map((d) => <DocumentRow key={d.id} doc={d} onDelete={onDelete} />)}
    </Card>
  );
}
