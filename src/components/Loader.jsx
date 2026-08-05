export default function Loader() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-6">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--series-1)] border-t-transparent" />
      <span className="text-sm text-[var(--text-secondary)]">Caricamento dati…</span>
    </div>
  );
}
