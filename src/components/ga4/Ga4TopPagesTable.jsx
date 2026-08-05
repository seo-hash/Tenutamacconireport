import { useMemo, useState } from 'react';
import { formatNumber } from '../../utils/format';

export default function Ga4TopPagesTable({ rows }) {
  const [sortKey, setSortKey] = useState('pageViews');
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
    { key: 'title', label: 'Titolo pagina' },
    { key: 'path', label: 'URL' },
    { key: 'pageViews', label: 'Visualizzazioni' },
    { key: 'activeUsers', label: 'Utenti attivi' },
  ];

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4">
      <h3 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">Pagine più visitate</h3>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-left text-sm">
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
                <td className="px-2 py-1.5 text-[var(--text-primary)]">{r.title || '—'}</td>
                <td className="px-2 py-1.5 text-[var(--text-secondary)]">{r.path}</td>
                <td className="px-2 py-1.5 tabular-nums text-[var(--text-primary)]">{formatNumber(r.pageViews)}</td>
                <td className="px-2 py-1.5 tabular-nums text-[var(--text-primary)]">{formatNumber(r.activeUsers)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {sorted.length === 0 && (
          <p className="py-6 text-center text-sm text-[var(--text-secondary)]">Nessuna pagina nel periodo selezionato.</p>
        )}
      </div>
    </div>
  );
}
