export default function KpiCard({ label, value, sub, calculated }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm text-[var(--text-secondary)]">{label}</span>
        {calculated && (
          <span
            title="Valore calcolato: risultati × costo per risultato, in assenza di una colonna di spesa dedicata"
            className="whitespace-nowrap rounded-full bg-[var(--series-4)]/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--series-4-ink)]"
          >
            calcolato
          </span>
        )}
      </div>
      <div className="mt-1 text-2xl font-bold tabular-nums text-[var(--text-primary)]">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-[var(--text-secondary)]">{sub}</div>}
    </div>
  );
}
