import { readAdminSession } from '../_auth.js';

export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const session = readAdminSession(req);
  if (!session) return res.status(200).json({ authenticated: false });
  return res.status(200).json({ authenticated: true, email: session.email });
}
