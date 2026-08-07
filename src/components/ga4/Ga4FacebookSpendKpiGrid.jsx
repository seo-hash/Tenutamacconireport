import KpiCard from '../KpiCard';
import { formatCurrency, formatCurrencyPrecise } from '../../utils/format';

export default function Ga4FacebookSpendKpiGrid({ spend, sessions, conversions }) {
  const costPerSession = sessions > 0 ? spend / sessions : 0;
  const costPerConversion = conversions > 0 ? spend / conversions : 0;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <KpiCard label="Spesa Facebook Ads (periodo)" value={formatCurrency(spend)} />
      <KpiCard
        label="Costo per sessione"
        value={formatCurrencyPrecise(costPerSession)}
        calculated
      />
      <KpiCard
        label="Costo per conversione"
        value={conversions > 0 ? formatCurrencyPrecise(costPerConversion) : '—'}
        sub={conversions === 0 ? 'Nessuna conversione registrata in GA4 nel periodo' : undefined}
        calculated
      />
    </div>
  );
}
