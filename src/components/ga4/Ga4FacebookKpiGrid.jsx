import KpiCard from '../KpiCard';
import { formatNumber, formatPercent } from '../../utils/format';

export default function Ga4FacebookKpiGrid({ rows }) {
  const totals = rows.reduce(
    (acc, r) => {
      acc.sessions += r.sessions ?? 0;
      acc.newUsers += r.newUsers ?? 0;
      acc.conversions += r.conversions ?? 0;
      return acc;
    },
    { sessions: 0, newUsers: 0, conversions: 0 }
  );

  const topCampaign = [...rows].sort((a, b) => (b.sessions ?? 0) - (a.sessions ?? 0))[0];
  const conversionRate = totals.sessions > 0 ? (totals.conversions / totals.sessions) * 100 : 0;
  const newUserShare = totals.sessions > 0 ? (totals.newUsers / totals.sessions) * 100 : 0;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <KpiCard label="Sessioni da Facebook Ads" value={formatNumber(totals.sessions)} />
      <KpiCard label="Campagne rilevate" value={formatNumber(rows.length)} />
      <KpiCard
        label="Campagna principale"
        value={topCampaign?.campaign ?? '—'}
        sub={topCampaign ? `${formatNumber(topCampaign.sessions)} sessioni` : undefined}
      />
      <KpiCard label="Conversioni" value={formatNumber(totals.conversions)} />
      <KpiCard label="Tasso di conversione" value={formatPercent(conversionRate)} />
      <KpiCard label="Quota nuovi utenti" value={formatPercent(newUserShare)} />
    </div>
  );
}
