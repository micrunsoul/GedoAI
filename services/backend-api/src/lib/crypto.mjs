import crypto from 'node:crypto';

export function nowIso() {
  return new Date().toISOString();
}

export function randomId() {
  return crypto.randomUUID();
}

export function hashPassword(password, salt = crypto.randomBytes(16)) {
  const derivedKey = crypto.scryptSync(password, salt, 32);
  return {
    algo: 'scrypt',
    salt: salt.toString('base64'),
    hash: derivedKey.toString('base64'),
  };
}

export function verifyPassword(password, stored) {
  if (!stored || stored.algo !== 'scrypt') return false;
  const salt = Buffer.from(stored.salt, 'base64');
  const derivedKey = crypto.scryptSync(password, salt, 32);
  const a = Buffer.from(stored.hash, 'base64');
  const b = Buffer.from(derivedKey.toString('base64'), 'base64');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function base64url(buf) {
  return Buffer.from(buf)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64urlJson(obj) {
  return base64url(Buffer.from(JSON.stringify(obj)));
}

export function signJwt(payload, secret, { expiresInSec = 60 * 60 * 24 * 7 } = {}) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = { ...payload, iat: now, exp: now + expiresInSec };
  const h = base64urlJson(header);
  const p = base64urlJson(fullPayload);
  const input = `${h}.${p}`;
  const sig = crypto.createHmac('sha256', secret).update(input).digest();
  return `${input}.${base64url(sig)}`;
}

export function verifyJwt(token, secret) {
  const parts = token.split('.');
  if (parts.length !== 3) return { ok: false, error: 'bad_token' };
  const [h, p, s] = parts;
  const input = `${h}.${p}`;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(input)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  if (expected !== s) return { ok: false, error: 'bad_signature' };
  let payload;
  try {
    payload = JSON.parse(Buffer.from(p.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'));
  } catch {
    return { ok: false, error: 'bad_payload' };
  }
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && now > payload.exp) return { ok: false, error: 'expired' };
  return { ok: true, payload };
}









