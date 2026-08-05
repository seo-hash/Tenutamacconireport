import { useState } from 'react';

export default function AnomaliesLog({ anomalies }) {
  const [open, setOpen] = useState(false);
  if (anomalies.length === 0) return null;

  return (
    <div className="rounded-xl border border-[var(--status-warning)]/40 bg-[var(--status-warning)]/10 p-4">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between text-sm font-semibold text-[var(--status-warning-ink)]">
        {anomalies.length} righe con anomalie rilevate
        <span>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <ul className="mt-2 max-h-48 space-y-1 overflow-auto text-xs text-[var(--text-primary)]">
          {anomalies.map((a, i) => (
            <li key={i}>
              Riga {a.rowNumber}: {a.reason}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
