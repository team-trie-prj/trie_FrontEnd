import Card from '@/components/common/Card';
import Chip from '@/components/common/Chip';
import Label from '@/components/common/Label';
import StatChart from './StatChart';
import StatTable from './StatTable';
import { useChartMode, useResultActions } from '@/stores/resultStore';
import type { SearchHit } from '@/types/search';

/** FNC-VIW-02 · 공공 통계 시각화 패널. */
export default function StatsPanel({ hits }: { hits: SearchHit[] }) {
  const chartMode = useChartMode();
  const { toggleChartMode } = useResultActions();
  const statHits = hits.filter((h) => h.stats && h.stats.length > 0);

  if (statHits.length === 0) return null;

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <Label>공공 통계 시각화</Label>
        <div className="flex gap-2">
          <Chip active={chartMode} onClick={() => !chartMode && toggleChartMode()}>
            차트
          </Chip>
          <Chip active={!chartMode} onClick={() => chartMode && toggleChartMode()}>
            표
          </Chip>
        </div>
      </div>
      {statHits.map((h) => (
        <div key={h.id} className="mb-5 last:mb-0">
          <p className="mb-3 text-sm font-semibold">{h.title}</p>
          {chartMode ? <StatChart stats={h.stats!} /> : <StatTable stats={h.stats!} />}
        </div>
      ))}
    </Card>
  );
}
