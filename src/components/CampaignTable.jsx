import { useMemo, useState } from 'react';
import Papa from 'papaparse';
import { formatCurrency, formatCurrencyPrecise, formatDate, formatNumber } from '../utils/format';

const COLUMNS = [
  { key: 'data_report', label: 'Data report', fmt: formatDate },
  { key: 'nome_campagna', label: 'Campagna', fmt: (v) => v },
  { key: 'stato', label: 'Stato', fmt: (v) => v },
  { key: 'risultati', label: 'Risultati', fmt: formatNumber },
  { key: 'tipo_azione', label: 'Tipo azione', fmt: (v) => v },
  { key: 'costo_per_risultato', label: 'Costo/risultato', fmt: formatCurrencyPrecise },
  { key: 'budget_totale', label: 'Budget', fmt: formatCurrency },
  { key: 'impression', label: 'Impression', fmt: formatNumber },
  { key: 'reach', label: 'Reach', fmt: formatNumber },
  { key: 'data_fine_campagna', label: 'Fine campagna', fmt: formatDate },
];

export default function CampaignTable({ records, anomalousRowNumbers }) {
  const [sortKey, setSortKey] = useState('data_report');
  const [sortDir, setSortDir] = useState('desc');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return records;
    const q = query.trim().toLowerCase();
    return records.filter((r) => r.nome_campagna?.toLowerCase().includes(q) || r.tipo_azione?.toLowerCase().includes(q));
  }, [records, query]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      let av = a[sortKey];
      let bv = b[sortKey];
      if (av instanceof Date) av = av.getTime();
      if (bv instanceof Date) bv = bv.getTime();
      if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      const diff = (av ?? 0) - (bv ?? 0);
      return sortDir === 'asc' ? diff : -diff;
    });
    return copy;
  }, [filtered, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const exportCsv = () => {
    const csv = Papa.unparse(
      sorted.map((r) => Object.fromEntries(COLUMNS.map((c) => [c.label, r[c.key] instanceof Date ? formatDate(r[c.key]) : r[c.key]])))
    );
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'campagne_export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Tabella dettagliata</h3>
        <div className="flex items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filtra per campagna o tipo azione…"
            className="rounded-lg border border-[var(--border)] bg-transparent px-2 py-1 text-sm text-[var(--text-primary)]"
          />
          <button
            onClick={exportCsv}
            className="rounded-lg border border-[var(--border)] px-3 py-1 text-sm text-[var(--text-primary)] hover:bg-[var(--surface-2)]"
          >
            Esporta CSV
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              {COLUMNS.map((c) => (
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
            {sorted.map((r, i) => {
              const isAnomalous = anomalousRowNumbers?.has(r.__rowNumber);
              return (
                <tr
                  key={i}
                  className={`border-b border-[var(--border)]/60 ${
                    isAnomalous ? 'bg-[var(--status-critical)]/10' : ''
                  }`}
                >
                  {COLUMNS.map((c) => (
                    <td key={c.key} className="whitespace-nowrap px-2 py-1.5 tabular-nums text-[var(--text-primary)]">
                      {c.fmt(r[c.key])}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
        {sorted.length === 0 && (
          <p className="py-6 text-center text-sm text-[var(--text-secondary)]">Nessuna riga corrisponde ai filtri.</p>
        )}
      </div>
    </div>
  );
}
