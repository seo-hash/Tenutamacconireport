import { ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { formatNumber } from '../../utils/format';

const SERIES_COLORS = [
  'var(--series-1)',
  'var(--series-2)',
  'var(--series-3)',
  'var(--series-4)',
  'var(--series-5)',
  'var(--series-6)',
  'var(--series-7)',
  'var(--series-8)',
];
const TOP_N = 10;

function shortLabel(row) {
  const label = row.title || row.path || '';
  return label.length > 40 ? `${label.slice(0, 37)}…` : label;
}

export default function Ga4TopPagesBarChart({ rows }) {
  const top = [...rows]
    .sort((a, b) => (b.pageViews ?? 0) - (a.pageViews ?? 0))
    .slice(0, TOP_N)
    .map((r) => ({ ...r, label: shortLabel(r) }));

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4">
      <h3 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">Top 10 pagine per visualizzazioni</h3>
      <ResponsiveContainer width="100%" height={Math.max(220, top.length * 40)}>
        <BarChart data={top} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
          <CartesianGrid stroke="var(--grid)" horizontal={false} />
          <XAxis type="number" stroke="var(--axis)" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={formatNumber} />
          <YAxis
            type="category"
            dataKey="label"
            stroke="var(--axis)"
            tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
            width={220}
          />
          <Tooltip
            contentStyle={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 8 }}
            formatter={(value) => [formatNumber(value), 'Visualizzazioni']}
            labelFormatter={(_, payload) => payload?.[0]?.payload?.path ?? ''}
          />
          <Bar dataKey="pageViews" radius={[0, 4, 4, 0]}>
            {top.map((entry, i) => (
              <Cell key={entry.path ?? i} fill={SERIES_COLORS[i % SERIES_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {top.length === 0 && (
        <p className="py-6 text-center text-sm text-[var(--text-secondary)]">Nessuna pagina nel periodo selezionato.</p>
      )}
    </div>
  );
}
