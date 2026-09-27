import { createAdminSession, sessionCookie, verifyAdminPassword } from '../_auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const email = String(body.email || process.env.ADMIN_EMAIL || 'admin').trim().toLowerCase();
    const password = String(body.password || '');
    if (!verifyAdminPassword(body.email, password)) return res.status(401).json({ error: 'Email atau password admin salah.' });
    const token = createAdminSession(email);
    res.setHeader('Set-Cookie', sessionCookie(token));
    return res.status(200).json({ ok: true, email });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Login gagal.' });
  }
}
