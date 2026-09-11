import crypto from 'node:crypto';

const COOKIE_NAME = 'dash_session';
const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 ore

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error('missing-session-secret');
  return secret;
}

function sign(value) {
  return crypto.createHmac('sha256', getSecret()).update(value).digest('base64url');
}

export function createSessionCookie() {
  const expiry = Date.now() + SESSION_TTL_SECONDS * 1000;
  const payload = String(expiry);
  const token = `${payload}.${sign(payload)}`;
  return `${COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${SESSION_TTL_SECONDS}`;
}

export function clearSessionCookie() {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

function parseCookies(header) {
  const out = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    out[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
  }
  return out;
}

export function isAuthenticated(req) {
  try {
    const cookies = parseCookies(req.headers?.cookie);
    const token = cookies[COOKIE_NAME];
    if (!token) return false;
    const [payload, signature] = token.split('.');
    if (!payload || !signature) return false;
    // timingSafeEqual richiede buffer della stessa lunghezza: un controllo di
    // lunghezza diversa è già di per sé un mismatch, non serve confronto costante.
    const expected = sign(payload);
    if (expected.length !== signature.length) return false;
    if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) return false;
    return Number(payload) > Date.now();
  } catch {
    return false;
  }
}
