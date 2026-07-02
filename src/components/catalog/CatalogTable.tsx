import { useState } from 'react';
import Card from '@/components/common/Card';
import Icon from '@/components/common/Icon';
import Label from '@/components/common/Label';
import Pill from '@/components/common/Pill';
import { useCatalogEntries, useCatalogLoading } from '@/stores/catalogStore';

/** FNC-PUB-01 · 등록된 API 카탈로그 목록 — 이름/URL/파라미터 검색 지원 */
export default function CatalogTable() {
  const entries = useCatalogEntries();
  const loading = useCatalogLoading();
  const [keyword, setKeyword] = useState('');

  const q = keyword.trim().toLowerCase();
  const filtered = q
    ? entries.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.endpointUrl.toLowerCase().includes(q) ||
          e.params.some((p) => p.name.toLowerCase().includes(q)),
      )
    : entries;

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between gap-3 px-5 py-4 max-[480px]:flex-col max-[480px]:items-stretch">
        <Label>등록된 카탈로그 · 에이전트 도구 목록(Tool Registry)</Label>
        <div className="flex items-center gap-2 rounded-[0.625rem] border border-line3 bg-panel2 px-3 py-2">
          <Icon name="search" size={15} className="shrink-0 text-mut3" />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            aria-label="등록 API 검색"
            placeholder="이름·URL·파라미터 검색"
            className="w-[11.875rem] border-none bg-transparent text-[0.8125rem] text-ink outline-none placeholder:text-mut4 max-[480px]:w-full"
          />
        </div>
      </div>
      <div className="min-w-0 overflow-x-auto">
      <div className="grid grid-cols-[1fr_100px_120px] border-b border-[#161616] px-5 py-3 text-[0.6875rem] tracking-[.1em] text-mut3 max-[480px]:hidden">
        <span>API</span>
        <span>상태</span>
        <span className="text-right">등록일</span>
      </div>
      {loading && <p className="px-5 py-5 text-[0.8125rem] text-mut3">불러오는 중…</p>}
      {!loading && filtered.length === 0 && (
        <p className="px-5 py-5 text-[0.8125rem] text-mut3">
          {q ? `'${keyword}' 검색 결과가 없습니다.` : '등록된 API가 없습니다.'}
        </p>
      )}
      {filtered.map((e) => (
        <div
          key={e.id}
          className="grid grid-cols-[1fr_100px_120px] items-center border-b border-[#141414] px-5 py-3.5 last:border-b-0 max-[480px]:grid-cols-1 max-[480px]:gap-1.5"
        >
          <div className="min-w-0 pr-3">
            <p className="truncate text-sm font-medium">{e.name}</p>
            <p className="mt-0.5 truncate text-xs text-mut3">
              {e.endpointUrl} · 키 {e.apiKeyMasked} ·{' '}
              {e.params.map((p) => p.name + (p.required ? '*' : '')).join(', ') || '파라미터 없음'}
            </p>
          </div>
          <span>
            <Pill tone={e.status === 'failed' ? 'danger' : 'default'}>
              {e.status === 'active' ? '연동 중' : e.status === 'testing' ? '테스트' : '실패'}
            </Pill>
          </span>
          <span className="text-right text-xs text-mut4 max-[480px]:text-left">
            {e.registeredAt.slice(0, 10)}
          </span>
        </div>
      ))}
      </div>
    </Card>
  );
}
