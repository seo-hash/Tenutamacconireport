import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { formatDate, formatNumber } from '../../utils/format';

function parseGa4Date(raw) {
  // GA4 restituisce le date come stringa YYYYMMDD
  const y = raw.slice(0, 4);
  const m = raw.slice(4, 6);
  const d = raw.slice(6, 8);
  return new Date(Number(y), Number(m) - 1, Number(d));
}

function MiniLineChart({ data, dataKey, name, color }) {
  return (
    <div>
      <h4 className="mb-2 text-xs font-medium text-[var(--text-secondary)]">{name}</h4>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--grid)" vertical={false} />
          <XAxis
            dataKey="dateObj"
            tickFormatter={(d) => formatDate(d)}
            stroke="var(--axis)"
            tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
          />
          <YAxis
            stroke="var(--axis)"
            tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
            tickFormatter={formatNumber}
            width={60}
          />
          <Tooltip
            contentStyle={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 8 }}
            labelFormatter={(d) => formatDate(d)}
            formatter={(value) => [formatNumber(value), name]}
          />
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function Ga4TrendChart({ rows }) {
  const data = rows.map((r) => ({ ...r, dateObj: parseGa4Date(r.date) }));

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4">
      <h3 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">Andamento nel tempo</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <MiniLineChart data={data} dataKey="sessions" name="Sessioni" color="var(--series-1)" />
        <MiniLineChart data={data} dataKey="activeUsers" name="Utenti attivi" color="var(--series-2)" />
      </div>
    </div>
  );
}
