import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { formatCurrencyPrecise, formatNumber } from '../utils/format';

function MiniBarChart({ data, dataKey, name, color, formatter }) {
  return (
    <div>
      <h4 className="mb-2 text-xs font-medium text-[var(--text-secondary)]">{name}</h4>
      <ResponsiveContainer width="100%" height={Math.max(220, data.length * 32)}>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
          <CartesianGrid stroke="var(--grid)" horizontal={false} />
          <XAxis type="number" stroke="var(--axis)" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={formatter} />
          <YAxis
            type="category"
            dataKey="campaign"
            stroke="var(--axis)"
            tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
            width={140}
          />
          <Tooltip
            contentStyle={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 8 }}
            formatter={(value) => [formatter(value), name]}
          />
          <Bar dataKey={dataKey} fill={color} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function CampaignBarChart({ data }) {
  const sorted = [...data].sort((a, b) => b.results - a.results).slice(0, 15);
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4">
      <h3 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">Confronto campagne</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <MiniBarChart data={sorted} dataKey="results" name="Risultati" color="var(--series-1)" formatter={formatNumber} />
        <MiniBarChart
          data={sorted}
          dataKey="costPerResult"
          name="Costo per risultato"
          color="var(--series-2)"
          formatter={formatCurrencyPrecise}
        />
      </div>
    </div>
  );
}
