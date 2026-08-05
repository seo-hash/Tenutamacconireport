import MultiSelect from './MultiSelect';

function toInputDate(d) {
  if (!d) return '';
  return d.toISOString().slice(0, 10);
}

export default function FiltersBar({
  from,
  to,
  onFromChange,
  onToChange,
  campaigns,
  selectedCampaigns,
  onCampaignsChange,
  status,
  onStatusChange,
  onRefresh,
  loading,
}) {
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-[var(--text-secondary)]">Data report da</label>
        <input
          type="date"
          value={toInputDate(from)}
          onChange={(e) => onFromChange(e.target.value ? new Date(e.target.value) : null)}
          className="rounded-lg border border-[var(--border)] bg-transparent px-2 py-1.5 text-sm text-[var(--text-primary)]"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-[var(--text-secondary)]">a</label>
        <input
          type="date"
          value={toInputDate(to)}
          onChange={(e) => onToChange(e.target.value ? new Date(e.target.value) : null)}
          className="rounded-lg border border-[var(--border)] bg-transparent px-2 py-1.5 text-sm text-[var(--text-primary)]"
        />
      </div>

      <div className="flex min-w-[220px] flex-col gap-1">
        <label className="text-xs font-medium text-[var(--text-secondary)]">Campagne</label>
        <MultiSelect options={campaigns} selected={selectedCampaigns} onChange={onCampaignsChange} placeholder="Tutte le campagne" />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-[var(--text-secondary)]">Stato</label>
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="rounded-lg border border-[var(--border)] bg-transparent px-2 py-1.5 text-sm text-[var(--text-primary)]"
        >
          <option value="all">Tutti</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
        </select>
      </div>

      <button
        onClick={onRefresh}
        disabled={loading}
        className="ml-auto rounded-lg bg-[var(--brand)] px-4 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
      >
        {loading ? 'Aggiornamento…' : '↻ Aggiorna dati'}
      </button>
    </div>
  );
}
