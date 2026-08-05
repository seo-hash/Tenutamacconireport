import { formatCurrency, formatDate } from '../utils/format';

export default function CampaignStatusPanel({ campaigns }) {
  const sorted = [...campaigns].sort((a, b) => (a.status === 'active' ? -1 : 1) - (b.status === 'active' ? -1 : 1));

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4">
      <h3 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">Stato campagne</h3>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-[var(--text-secondary)]">
              <th className="px-2 py-2 font-medium">Campagna</th>
              <th className="px-2 py-2 font-medium">Stato</th>
              <th className="px-2 py-2 font-medium">Fine campagna</th>
              <th className="px-2 py-2 font-medium">Budget residuo stimato</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((c) => (
              <tr key={c.campaign} className="border-b border-[var(--border)]/60">
                <td className="px-2 py-1.5 text-[var(--text-primary)]">{c.campaign}</td>
                <td className="px-2 py-1.5">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                      c.status === 'active'
                        ? 'bg-[var(--status-good)]/15 text-[var(--status-good-ink)]'
                        : 'bg-[var(--text-muted)]/15 text-[var(--text-secondary)]'
                    }`}
                  >
                    {c.status === 'active' ? '● Active' : c.status === 'paused' ? '○ Paused' : c.status}
                  </span>
                </td>
                <td className="px-2 py-1.5 tabular-nums text-[var(--text-primary)]">{formatDate(c.endDate)}</td>
                <td className="px-2 py-1.5 tabular-nums text-[var(--text-primary)]">{formatCurrency(c.remainingBudget)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
