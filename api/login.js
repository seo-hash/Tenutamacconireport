import crypto from 'node:crypto';
import { createSessionCookie } from './_auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Metodo non consentito.' });
    return;
  }

  const expectedPassword = process.env.DASHBOARD_PASSWORD;
  if (!expectedPassword || !process.env.SESSION_SECRET) {
    res.status(500).json({ error: 'Autenticazione non configurata lato server (DASHBOARD_PASSWORD / SESSION_SECRET).' });
    return;
  }

  const password = req.body?.password;
  if (typeof password !== 'string' || password.length === 0) {
    res.status(400).json({ error: 'Password mancante.' });
    return;
  }

  const provided = Buffer.from(password);
  const expected = Buffer.from(expectedPassword);
  const matches = provided.length === expected.length && crypto.timingSafeEqual(provided, expected);
  if (!matches) {
    res.status(401).json({ error: 'Password errata.' });
    return;
  }

  res.setHeader('Set-Cookie', createSessionCookie());
  res.status(200).json({ ok: true });
}
