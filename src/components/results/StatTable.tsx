import type { StatRow } from '@/types/search';

/** FNC-VIW-02 · 정형 데이터 테이블 뷰 */
export default function StatTable({ stats }: { stats: StatRow[] }) {
  return (
    <div className="overflow-x-auto rounded-[0.875rem] border border-line">
      <div className="grid grid-cols-2 border-b border-[#161616] px-5 py-3 text-[0.6875rem] tracking-[.1em] text-mut3">
        <span>구분</span>
        <span className="text-right">값</span>
      </div>
      {stats.map((row) => (
        <div
          key={row.label}
          className="grid grid-cols-2 border-b border-[#141414] px-5 py-3 text-sm last:border-b-0"
        >
          <span className="font-medium">{row.label}</span>
          <span className="text-right font-light">{row.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}
