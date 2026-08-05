const SHEETS_PUBLISH_CODES = new Set(['network', 'http', 'missing-url']);
const GA4_CODES = new Set(['network', 'http']);

export default function ErrorPanel({ error, source = 'sheets' }) {
  const showSheetsHelp = source === 'sheets' && SHEETS_PUBLISH_CODES.has(error?.code);
  const showGa4Help = source === 'ga4' && GA4_CODES.has(error?.code);

  return (
    <div className="rounded-xl border border-[var(--status-critical)]/40 bg-[var(--status-critical)]/10 p-4">
      <p className="text-sm font-semibold text-[var(--status-critical-ink)]">Errore nel caricamento dati</p>
      <p className="mt-1 text-sm text-[var(--text-primary)]">{error?.message || 'Errore sconosciuto.'}</p>
      {showSheetsHelp && (
        <div className="mt-3 rounded-lg bg-[var(--surface-1)] p-3 text-xs text-[var(--text-secondary)]">
          <p className="mb-1 font-medium text-[var(--text-primary)]">Come pubblicare il Google Sheet come CSV:</p>
          <ol className="list-decimal space-y-0.5 pl-4">
            <li>Apri il Google Sheet con i dati delle campagne.</li>
            <li>File → Condividi → Pubblica sul web.</li>
            <li>Seleziona il foglio corretto e come formato scegli "Valori separati da virgola (.csv)".</li>
            <li>Clicca "Pubblica" e copia il link generato.</li>
            <li>Incolla il link nel campo URL CSV in configurazione.</li>
          </ol>
        </div>
      )}
      {showGa4Help && (
        <div className="mt-3 rounded-lg bg-[var(--surface-1)] p-3 text-xs text-[var(--text-secondary)]">
          <p className="mb-1 font-medium text-[var(--text-primary)]">Possibili cause:</p>
          <ul className="list-disc space-y-0.5 pl-4">
            <li>In locale: la function serverless non è in esecuzione (serve "vercel dev", non "npm run dev").</li>
            <li>Variabili d'ambiente mancanti: GA4_PROPERTY_ID, GA4_CLIENT_EMAIL, GA4_PRIVATE_KEY.</li>
            <li>Il service account non ha accesso Viewer alla property GA4.</li>
          </ul>
        </div>
      )}
    </div>
  );
}
