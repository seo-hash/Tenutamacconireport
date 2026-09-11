export class AuthServiceError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

export async function login(password) {
  let response;
  try {
    response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
  } catch {
    throw new AuthServiceError('network', 'Impossibile raggiungere il server di autenticazione.');
  }

  if (!response.ok) {
    let message = 'Accesso non riuscito.';
    try {
      const body = await response.json();
      if (body?.error) message = body.error;
    } catch {
      // risposta non JSON, mantieni il messaggio generico
    }
    throw new AuthServiceError('unauthorized', message);
  }
}

export async function checkSession() {
  try {
    const response = await fetch('/api/session', { cache: 'no-store' });
    if (!response.ok) return false;
    const body = await response.json();
    return !!body.authenticated;
  } catch {
    return false;
  }
}

export async function logout() {
  try {
    await fetch('/api/logout', { method: 'POST' });
  } catch {
    // se la chiamata fallisce la sessione lato server resta valida fino a
    // scadenza naturale; l'utente viene comunque riportato al login lato UI.
  }
}
