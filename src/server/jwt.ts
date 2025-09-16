import crypto from 'crypto';

// Lightweight JWT using HMAC-SHA256 without external deps (dev/mock only)
const base64url = (input: Buffer | string) =>
  Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

const SECRET = process.env.BUDGEE_JWT_SECRET || 'dev-secret-change-me';

export function signJwt(payload: Record<string, unknown>, expiresInSeconds = 60 * 60 * 24) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + expiresInSeconds;
  const body = { ...payload, iat, exp };

  const headerEncoded = base64url(JSON.stringify(header));
  const payloadEncoded = base64url(JSON.stringify(body));
  const data = `${headerEncoded}.${payloadEncoded}`;
  const signature = crypto.createHmac('sha256', SECRET).update(data).digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${data}.${signature}`;
}

export function verifyJwt(token: string): { valid: boolean; payload?: any; error?: string } {
  try {
    const [header, payload, signature] = token.split('.');
    if (!header || !payload || !signature) return { valid: false, error: 'Malformed token' };

    const data = `${header}.${payload}`;
    const expected = crypto.createHmac('sha256', SECRET).update(data).digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
    if (expected !== signature) return { valid: false, error: 'Invalid signature' };

    const payloadObj = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
    const now = Math.floor(Date.now() / 1000);
    if (payloadObj.exp && now > payloadObj.exp) return { valid: false, error: 'Token expired' };
    return { valid: true, payload: payloadObj };
  } catch (e: any) {
    return { valid: false, error: e?.message || 'Invalid token' };
  }
}


