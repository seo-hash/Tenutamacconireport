import { isAuthenticated } from './_auth.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ authenticated: isAuthenticated(req) });
}
