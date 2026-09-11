export class Ga4ServiceError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

const VALID_REPORTS = ['overview', 'acquisition', 'pages', 'facebook', 'facebook_daily'];

/**
 * Chiama la function serverless /api/ga4, che interroga la GA4 Data API
 * lato server (le credenziali del service account non possono vivere nel
 * bundle client). Restituisce dati già aggregati e pronti per i grafici.
 */
export async function fetchGa4Report(report, { from, to } = {}) {
  if (!VALID_REPORTS.includes(report)) {
    throw new Ga4ServiceError('invalid-report', `Report GA4 sconosciuto: ${report}`);
  }

  const params = new URLSearchParams({ report });
  if (from) params.set('from', from.toISOString().slice(0, 10));
  if (to) params.set('to', to.toISOString().slice(0, 10));

  let response;
  try {
    response = await fetch(`/api/ga4?${params.toString()}`, { cache: 'no-store' });
  } catch {
    throw new Ga4ServiceError(
      'network',
      'Impossibile raggiungere il backend GA4. Verifica che la function /api/ga4 sia in esecuzione (vercel dev) e configurata con le credenziali del service account.'
    );
  }

  if (!response.ok) {
    let message = `Il backend GA4 ha risposto con errore ${response.status}.`;
    try {
      const body = await response.json();
      if (body?.error) message = body.error;
    } catch {
      // risposta non JSON, mantieni il messaggio generico
    }
    throw new Ga4ServiceError('http', message);
  }

  return response.json();
}
