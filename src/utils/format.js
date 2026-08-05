const intFmt = new Intl.NumberFormat('it-IT', { maximumFractionDigits: 0 });
const decimalFmt = new Intl.NumberFormat('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const currencyFmt = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' });
const currencyPreciseFmt = new Intl.NumberFormat('it-IT', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
});
const dateFmt = new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });

export function formatNumber(n) {
  if (n == null || Number.isNaN(n)) return '—';
  return intFmt.format(n);
}

export function formatDecimal(n) {
  if (n == null || Number.isNaN(n)) return '—';
  return decimalFmt.format(n);
}

export function formatCurrency(n) {
  if (n == null || Number.isNaN(n)) return '—';
  return currencyFmt.format(n);
}

export function formatCurrencyPrecise(n) {
  if (n == null || Number.isNaN(n)) return '—';
  return currencyPreciseFmt.format(n);
}

export function formatDate(d) {
  if (!d) return '—';
  const date = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(date.getTime())) return '—';
  return dateFmt.format(date);
}

export function formatPercent(n) {
  if (n == null || Number.isNaN(n)) return '—';
  return `${decimalFmt.format(n)}%`;
}
