import KpiCard from '../KpiCard';
import { formatNumber, formatDecimal, formatPercent } from '../../utils/format';

export default function Ga4PagesKpiGrid({ rows }) {
  const totalPageViews = rows.reduce((sum, r) => sum + (r.pageViews ?? 0), 0);
  const totalUsers = rows.reduce((sum, r) => sum + (r.activeUsers ?? 0), 0);
  const topPage = [...rows].sort((a, b) => (b.pageViews ?? 0) - (a.pageViews ?? 0))[0];
  const topPageShare = totalPageViews > 0 ? ((topPage?.pageViews ?? 0) / totalPageViews) * 100 : 0;
  const avgViewsPerPage = rows.length > 0 ? totalPageViews / rows.length : 0;

  const topEngagedPage = [...rows].sort((a, b) => (b.activeUsers ?? 0) - (a.activeUsers ?? 0))[0];
  const viewsPerUser = totalUsers > 0 ? totalPageViews / totalUsers : 0;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <KpiCard label="Pagine monitorate" value={formatNumber(rows.length)} />
      <KpiCard
        label="Pagina più vista"
        value={topPage?.title || topPage?.path || '—'}
        sub={topPage ? `${formatNumber(topPage.pageViews)} visualizzazioni` : undefined}
      />
      <KpiCard label="Quota pagina più vista" value={formatPercent(topPageShare)} />
      <KpiCard label="Media visualizzazioni/pagina" value={formatDecimal(avgViewsPerPage)} />
      <KpiCard
        label="Pagina con più utenti attivi"
        value={topEngagedPage?.title || topEngagedPage?.path || '—'}
        sub={topEngagedPage ? `${formatNumber(topEngagedPage.activeUsers)} utenti` : undefined}
      />
      <KpiCard label="Visualizzazioni per utente" value={formatDecimal(viewsPerUser)} />
    </div>
  );
}
