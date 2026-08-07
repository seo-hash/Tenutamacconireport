import { useMemo, useState } from 'react';
import { formatNumber, formatPercent } from '../../utils/format';

function formatDuration(seconds) {
  if (seconds == null || Number.isNaN(seconds)) return '—';
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s}s`;
}

function formatSource(source) {
  if (source === 'fb') return 'Facebook';
  if (source === 'ig') return 'Instagram';
  return source || '—';
}

export default function Ga4FacebookCampaignsTable({ rows }) {
  const [sortKey, setSortKey] = useState('sessions');
  const [sortDir, setSortDir] = useState('desc');

  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      const diff = (av ?? 0) - (bv ?? 0);
      return sortDir === 'asc' ? diff : -diff;
    });
    return copy;
  }, [rows, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const columns = [
    { key: 'campaign', label: 'ID campagna' },
    { key: 'source', label: 'Sorgente' },
    { key: 'sessions', label: 'Sessioni' },
    { key: 'newUsers', label: 'Nuovi utenti' },
    { key: 'conversions', label: 'Conversioni' },
    { key: 'engagementRate', label: 'Engagement' },
    { key: 'bounceRate', label: 'Bounce rate' },
    { key: 'avgSessionDuration', label: 'Durata media' },
  ];

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4">
      <h3 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">Campagne Facebook Ads (via UTM)</h3>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              {columns.map((c) => (
                <th
                  key={c.key}
                  onClick={() => toggleSort(c.key)}
                  className="cursor-pointer whitespace-nowrap px-2 py-2 font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  {c.label}
                  {sortKey === c.key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((r, i) => (
              <tr key={i} className="border-b border-[var(--border)]/60">
                <td className="px-2 py-1.5 text-[var(--text-primary)]">{r.campaign || '(not set)'}</td>
                <td className="px-2 py-1.5 text-[var(--text-secondary)]">{formatSource(r.source)}</td>
                <td className="px-2 py-1.5 tabular-nums text-[var(--text-primary)]">{formatNumber(r.sessions)}</td>
                <td className="px-2 py-1.5 tabular-nums text-[var(--text-primary)]">{formatNumber(r.newUsers)}</td>
                <td className="px-2 py-1.5 tabular-nums text-[var(--text-primary)]">{formatNumber(r.conversions)}</td>
                <td className="px-2 py-1.5 tabular-nums text-[var(--text-primary)]">{formatPercent((r.engagementRate ?? 0) * 100)}</td>
                <td className="px-2 py-1.5 tabular-nums text-[var(--text-primary)]">{formatPercent((r.bounceRate ?? 0) * 100)}</td>
                <td className="px-2 py-1.5 tabular-nums text-[var(--text-primary)]">{formatDuration(r.avgSessionDuration)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {sorted.length === 0 && (
          <p className="py-6 text-center text-sm text-[var(--text-secondary)]">Nessuna sessione da Facebook Ads nel periodo selezionato.</p>
        )}
      </div>
    </div>
  );
}
