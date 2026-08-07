import KpiCard from '../KpiCard';
import { formatNumber, formatPercent, formatDecimal } from '../../utils/format';

function formatDuration(seconds) {
  if (seconds == null || Number.isNaN(seconds)) return '—';
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s}s`;
}

export default function Ga4KpiGrid({ rows }) {
  const totals = rows.reduce(
    (acc, r) => {
      acc.sessions += r.sessions ?? 0;
      acc.users += r.activeUsers ?? 0;
      acc.newUsers += r.newUsers ?? 0;
      acc.pageViews += r.pageViews ?? 0;
      acc.conversions += r.conversions ?? 0;
      acc.engagementSum += (r.engagementRate ?? 0) * (r.sessions ?? 0);
      acc.durationSum += (r.avgSessionDuration ?? 0) * (r.sessions ?? 0);
      acc.bounceSum += (r.bounceRate ?? 0) * (r.sessions ?? 0);
      return acc;
    },
    { sessions: 0, users: 0, newUsers: 0, pageViews: 0, conversions: 0, engagementSum: 0, durationSum: 0, bounceSum: 0 }
  );

  const avgEngagement = totals.sessions > 0 ? (totals.engagementSum / totals.sessions) * 100 : 0;
  const avgDuration = totals.sessions > 0 ? totals.durationSum / totals.sessions : 0;
  const avgBounce = totals.sessions > 0 ? (totals.bounceSum / totals.sessions) * 100 : 0;
  const pagesPerSession = totals.sessions > 0 ? totals.pageViews / totals.sessions : 0;
  const conversionRate = totals.sessions > 0 ? (totals.conversions / totals.sessions) * 100 : 0;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <KpiCard label="Sessioni totali" value={formatNumber(totals.sessions)} />
      <KpiCard label="Utenti attivi" value={formatNumber(totals.users)} />
      <KpiCard label="Nuovi utenti" value={formatNumber(totals.newUsers)} />
      <KpiCard label="Visualizzazioni pagina" value={formatNumber(totals.pageViews)} />
      <KpiCard label="Tasso di engagement medio" value={formatPercent(avgEngagement)} />
      <KpiCard label="Durata media sessione" value={formatDuration(avgDuration)} />
      <KpiCard label="Frequenza di rimbalzo" value={formatPercent(avgBounce)} />
      <KpiCard label="Pagine per sessione" value={formatDecimal(pagesPerSession)} />
      <KpiCard label="Conversioni" value={formatNumber(totals.conversions)} />
      <KpiCard label="Tasso di conversione" value={formatPercent(conversionRate)} />
    </div>
  );
}
