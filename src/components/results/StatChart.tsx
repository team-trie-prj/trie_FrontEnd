import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { StatRow } from '@/types/search';

/** FNC-VIW-02 · 공공데이터 수치 → Recharts 막대 차트 (다크 톤 유지) */
export default function StatChart({ stats }: { stats: StatRow[] }) {
  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer>
        <BarChart data={stats} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid stroke="#1A1A1A" vertical={false} />
          <XAxis dataKey="label" stroke="#6E6E6E" fontSize={12} tickLine={false} />
          <YAxis stroke="#6E6E6E" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip
            cursor={{ fill: 'rgba(255,255,255,.04)' }}
            contentStyle={{
              background: '#0C0C0C',
              border: '1px solid #262626',
              borderRadius: 10,
              color: '#F4F4F4',
              fontSize: 12,
            }}
          />
          <Bar dataKey="value" fill="#F4F4F4" radius={[4, 4, 0, 0]} maxBarSize={42} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
