import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { formatCurrencyPrecise, formatDate, formatNumber } from '../utils/format';

function MiniLineChart({ data, dataKey, name, color, formatter }) {
  return (
    <div>
      <h4 className="mb-2 text-xs font-medium text-[var(--text-secondary)]">{name}</h4>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--grid)" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(d) => formatDate(d)}
            stroke="var(--axis)"
            tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
          />
          <YAxis stroke="var(--axis)" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={formatter} width={70} />
          <Tooltip
            contentStyle={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 8 }}
            labelFormatter={(d) => formatDate(d)}
            formatter={(value) => [formatter(value), name]}
          />
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function TrendChart({ data }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4">
      <h3 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">
        Andamento nel tempo (per data report)
      </h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <MiniLineChart data={data} dataKey="results" name="Risultati" color="var(--series-1)" formatter={formatNumber} />
        <MiniLineChart
          data={data}
          dataKey="costPerResult"
          name="Costo per risultato"
          color="var(--series-2)"
          formatter={formatCurrencyPrecise}
        />
      </div>
    </div>
  );
}
