import KpiCard from '../KpiCard';
import { formatNumber, formatPercent } from '../../utils/format';

export default function Ga4AcquisitionKpiGrid({ rows }) {
  const totals = rows.reduce(
    (acc, r) => {
      acc.sessions += r.sessions ?? 0;
      acc.newUsers += r.newUsers ?? 0;
      acc.conversions += r.conversions ?? 0;
      return acc;
    },
    { sessions: 0, newUsers: 0, conversions: 0 }
  );

  const byBestSessions = [...rows].sort((a, b) => (b.sessions ?? 0) - (a.sessions ?? 0));
  const topChannel = byBestSessions[0];
  const topChannelShare = totals.sessions > 0 ? ((topChannel?.sessions ?? 0) / totals.sessions) * 100 : 0;

  const conversionRate = totals.sessions > 0 ? (totals.conversions / totals.sessions) * 100 : 0;

  const topNewUsersChannel = [...rows].sort((a, b) => (b.newUsers ?? 0) - (a.newUsers ?? 0))[0];
  const newUserShare = totals.sessions > 0 ? (totals.newUsers / totals.sessions) * 100 : 0;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <KpiCard label="Canale principale" value={topChannel?.channel ?? '—'} sub={topChannel ? `${formatNumber(topChannel.sessions)} sessioni` : undefined} />
      <KpiCard label="Quota canale principale" value={formatPercent(topChannelShare)} />
      <KpiCard label="Canali attivi" value={formatNumber(rows.length)} />
      <KpiCard label="Tasso di conversione medio" value={formatPercent(conversionRate)} />
      <KpiCard
        label="Canale con più nuovi utenti"
        value={topNewUsersChannel?.channel ?? '—'}
        sub={topNewUsersChannel ? `${formatNumber(topNewUsersChannel.newUsers)} nuovi utenti` : undefined}
      />
      <KpiCard label="Quota sessioni da nuovi utenti" value={formatPercent(newUserShare)} />
    </div>
  );
}
