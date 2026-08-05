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
const MAX_CHANNELS = 8;

function foldIntoOther(rows) {
  if (rows.length <= MAX_CHANNELS) return rows;
  const top = rows.slice(0, MAX_CHANNELS - 1);
  const rest = rows.slice(MAX_CHANNELS - 1);
  const other = rest.reduce(
    (acc, r) => ({
      channel: 'Altro',
      sessions: acc.sessions + (r.sessions ?? 0),
      activeUsers: acc.activeUsers + (r.activeUsers ?? 0),
      conversions: acc.conversions + (r.conversions ?? 0),
    }),
    { channel: 'Altro', sessions: 0, activeUsers: 0, conversions: 0 }
  );
  return [...top, other];
}

export default function Ga4SourceBarChart({ rows }) {
  const sorted = foldIntoOther([...rows].sort((a, b) => b.sessions - a.sessions));

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4">
      <h3 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">Sessioni per canale di acquisizione</h3>
      <ResponsiveContainer width="100%" height={Math.max(220, sorted.length * 40)}>
        <BarChart data={sorted} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
          <CartesianGrid stroke="var(--grid)" horizontal={false} />
          <XAxis type="number" stroke="var(--axis)" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={formatNumber} />
          <YAxis
            type="category"
            dataKey="channel"
            stroke="var(--axis)"
            tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
            width={160}
          />
          <Tooltip
            contentStyle={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 8 }}
            formatter={(value, name) => [formatNumber(value), name === 'sessions' ? 'Sessioni' : name]}
          />
          <Bar dataKey="sessions" radius={[0, 4, 4, 0]}>
            {sorted.map((entry, i) => (
              <Cell key={entry.channel} fill={SERIES_COLORS[i % SERIES_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
