import { ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { formatNumber } from '../utils/format';

const SERIES_COLORS = ['var(--series-1)', 'var(--series-2)', 'var(--series-3)', 'var(--series-4)'];

export default function ActionTypeChart({ data }) {
  if (data.length <= 1) return null;
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4">
      <h3 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">Breakdown per tipo di azione</h3>
      <ResponsiveContainer width="100%" height={Math.max(200, data.length * 40)}>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
          <CartesianGrid stroke="var(--grid)" horizontal={false} />
          <XAxis type="number" stroke="var(--axis)" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={formatNumber} />
          <YAxis
            type="category"
            dataKey="actionType"
            stroke="var(--axis)"
            tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
            width={220}
          />
          <Tooltip
            contentStyle={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 8 }}
            formatter={(value) => [formatNumber(value), 'Risultati']}
          />
          <Bar dataKey="results" radius={[0, 4, 4, 0]}>
            {data.map((entry, i) => (
              <Cell key={entry.actionType} fill={SERIES_COLORS[i % SERIES_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
