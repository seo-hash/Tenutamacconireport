import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import KpiCard from '../KpiCard';
import { formatDate, formatNumber, formatPercent } from '../../utils/format';

function matchRateColor(rate) {
  if (rate < 40) return 'var(--series-8)'; // rosso
  if (rate < 70) return 'var(--series-4)'; // arancione
  return 'var(--series-6)'; // verde
}

/**
 * Unisce le due serie giornaliere (click Meta e sessioni GA4) in un unico
 * array indicizzato per data, riempiendo con 0 i giorni mancanti da un lato.
 */
function mergeByDate(metaDaily, ga4Daily) {
  const map = new Map();
  for (const r of metaDaily) {
    if (!r.date) continue;
    map.set(r.date, { date: r.date, metaClicks: r.results ?? 0, ga4Sessions: 0 });
  }
  for (const r of ga4Daily) {
    if (!r.date) continue;
    const entry = map.get(r.date) ?? { date: r.date, metaClicks: 0, ga4Sessions: 0 };
    entry.ga4Sessions = r.sessions ?? 0;
    map.set(r.date, entry);
  }
  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export default function Ga4MetaComparisonSection({ metaDaily, ga4Daily, usingFallbackMetric }) {
  const merged = mergeByDate(metaDaily, ga4Daily);

  const totalMetaClicks = merged.reduce((acc, r) => acc + r.metaClicks, 0);
  const totalGa4Sessions = merged.reduce((acc, r) => acc + r.ga4Sessions, 0);
  const matchRate = totalMetaClicks > 0 ? (totalGa4Sessions / totalMetaClicks) * 100 : 0;
  const matchRateDisplay = totalMetaClicks > 0 ? formatPercent(matchRate) : '—';
  const metaMetricLabel = usingFallbackMetric ? 'Click Meta Ads (fallback)' : 'Landing page view (Meta)';

  return (
    <div className="space-y-4 border-t border-[var(--border)] pt-6">
      <h2 className="text-base font-semibold text-[var(--text-primary)]">Confronto Meta Ads vs Google Analytics 4</h2>

      {usingFallbackMetric && (
        <p className="rounded-lg border border-[var(--series-4)]/40 bg-[var(--series-4)]/10 p-2 text-xs text-[var(--text-secondary)]">
          Il foglio non riporta righe con action type "Visualizzazioni della pagina di destinazione": il confronto usa
          tutti i risultati registrati (tipicamente click sul link), quindi il tasso sottostimerà la corrispondenza
          reale rispetto a un confronto basato sulle landing page view.
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <KpiCard label={metaMetricLabel} value={formatNumber(totalMetaClicks)} />
        <KpiCard label="Sessioni GA4" value={formatNumber(totalGa4Sessions)} />
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4 shadow-sm">
          <span className="text-sm text-[var(--text-secondary)]">Tasso di corrispondenza</span>
          <div className="mt-1 text-2xl font-bold tabular-nums" style={{ color: matchRateColor(matchRate) }}>
            {matchRateDisplay}
          </div>
        </div>
      </div>

      <p className="text-xs text-[var(--text-secondary)]">
        Un tasso di corrispondenza tra il 60% e l'85% è considerato normale; valori più bassi indicano possibili
        problemi di tracciamento (referral non esclusi, UTM mancanti, blocco cookie).
      </p>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4">
        <h3 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">{metaMetricLabel} vs sessioni GA4 (per giorno)</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={merged} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="var(--grid)" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(d) => formatDate(d)}
              stroke="var(--axis)"
              tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
            />
            <YAxis stroke="var(--axis)" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={formatNumber} width={60} />
            <Tooltip
              contentStyle={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 8 }}
              labelFormatter={(d) => formatDate(d)}
              formatter={(value, name) => [formatNumber(value), name === 'metaClicks' ? metaMetricLabel : 'Sessioni GA4']}
            />
            <Legend
              formatter={(name) => (name === 'metaClicks' ? metaMetricLabel : 'Sessioni GA4')}
              wrapperStyle={{ fontSize: 12 }}
            />
            <Line type="monotone" dataKey="metaClicks" stroke="var(--series-1)" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="ga4Sessions" stroke="var(--series-2)" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
