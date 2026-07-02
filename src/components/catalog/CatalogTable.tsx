import Card from '@/components/common/Card';
import Label from '@/components/common/Label';
import Pill from '@/components/common/Pill';
import { useCatalogEntries, useCatalogLoading } from '@/stores/catalogStore';

/** FNC-PUB-01 · 등록된 API 카탈로그 목록 */
export default function CatalogTable() {
  const entries = useCatalogEntries();
  const loading = useCatalogLoading();

  return (
    <Card className="overflow-hidden p-0">
      <div className="px-5 py-4">
        <Label>등록된 카탈로그 · 에이전트 도구 목록(Tool Registry)</Label>
      </div>
      <div className="grid grid-cols-[1fr_100px_120px] border-b border-[#161616] px-5 py-3 text-[11px] tracking-[.1em] text-mut3">
        <span>API</span>
        <span>상태</span>
        <span className="text-right">등록일</span>
      </div>
      {loading && <p className="px-5 py-5 text-[13px] text-mut3">불러오는 중…</p>}
      {!loading && entries.length === 0 && (
        <p className="px-5 py-5 text-[13px] text-mut3">등록된 API가 없습니다.</p>
      )}
      {entries.map((e) => (
        <div
          key={e.id}
          className="grid grid-cols-[1fr_100px_120px] items-center border-b border-[#141414] px-5 py-3.5 last:border-b-0"
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
          <span className="text-right text-xs text-mut4">{e.registeredAt.slice(0, 10)}</span>
        </div>
      ))}
    </Card>
  );
}
