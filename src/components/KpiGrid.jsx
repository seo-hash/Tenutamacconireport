import KpiCard from './KpiCard';
import { formatCurrency, formatCurrencyPrecise, formatNumber } from '../utils/format';

export default function KpiGrid({ totals }) {
  if (!totals) return null;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      <KpiCard label="Spesa totale" value={formatCurrency(totals.spend)} calculated={totals.spendCalculated} />
      <KpiCard label="Risultati totali" value={formatNumber(totals.results)} />
      <KpiCard label="Impression totali" value={formatNumber(totals.impressions)} />
      <KpiCard label="Reach totale" value={formatNumber(totals.reach)} />
      <KpiCard label="Costo medio per risultato" value={formatCurrencyPrecise(totals.avgCostPerResult)} calculated={totals.spendCalculated} />
      <KpiCard
        label="Campagne attive / in pausa"
        value={`${formatNumber(totals.activeCount)} / ${formatNumber(totals.pausedCount)}`}
        sub={`${formatNumber(totals.campaignCount)} campagne totali`}
      />
      <KpiCard label="Budget totale allocato" value={formatCurrency(totals.budget)} />
    </div>
  );
}
