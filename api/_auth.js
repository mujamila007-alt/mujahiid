import crypto from 'node:crypto';

const COOKIE_NAME = 'muja_admin_session';
const SESSION_AGE_SECONDS = 60 * 60 * 12;

function parseCookies(header = '') {
  const out = {};
  for (const part of String(header).split(';')) {
    const i = part.indexOf('=');
    if (i < 0) continue;
    const key = part.slice(0, i).trim();
    const value = part.slice(i + 1).trim();
    if (key) out[key] = decodeURIComponent(value);
  }
  return out;
}

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 24) throw new Error('AUTH_SECRET belum dikonfigurasi atau terlalu pendek.');
  return value;
}

function sign(body) {
  return crypto.createHmac('sha256', secret()).update(body).digest('base64url');
}

function safeEqual(a, b) {
  const aa = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (aa.length !== bb.length) return false;
  return crypto.timingSafeEqual(aa, bb);
}

export function verifyAdminPassword(email, password) {
  const expectedPassword = process.env.ADMIN_PASSWORD || '';
  const expectedEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  if (!expectedPassword) return false;
  if (!safeEqual(password || '', expectedPassword)) return false;
  if (expectedEmail && email && String(email).trim().toLowerCase() !== expectedEmail) return false;
  return true;
}

export function createAdminSession(email) {
  const payload = {
    email: (email || process.env.ADMIN_EMAIL || 'admin').trim().toLowerCase(),
    exp: Math.floor(Date.now() / 1000) + SESSION_AGE_SECONDS
  };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${body}.${sign(body)}`;
}

export function readAdminSession(req) {
  try {
    const cookies = parseCookies(req.headers.cookie || '');
    const token = cookies[COOKIE_NAME];
    if (!token) return null;
    const [body, signature] = token.split('.');
    if (!body || !signature || !safeEqual(signature, sign(body))) return null;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch (_) {
    return null;
  }
}

export function sessionCookie(token) {
  const secure = process.env.VERCEL_ENV === 'production' ? '; Secure' : '';
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_AGE_SECONDS}${secure}`;
}

export function clearSessionCookie() {
  const secure = process.env.VERCEL_ENV === 'production' ? '; Secure' : '';
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}
