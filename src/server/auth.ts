import { cookies } from 'next/headers';
import { db, generateId } from './store';
import { signJwt, verifyJwt } from './jwt';
import type { ServerUser } from './types';

const AUTH_COOKIE = 'budgee_token';

export function setAuthCookie(token: string) {
  cookies().set(AUTH_COOKIE, token, { httpOnly: true, path: '/', sameSite: 'lax' });
}

export function clearAuthCookie() {
  cookies().delete(AUTH_COOKIE);
}

export function getUserFromRequest(): ServerUser | null {
  const token = cookies().get(AUTH_COOKIE)?.value;
  if (!token) return null;
  const result = verifyJwt(token);
  if (!result.valid || !result.payload?.sub) return null;
  const user = db.users.find(u => u.id === result.payload.sub) || null;
  return user || null;
}

export function requireUser(): ServerUser | null {
  return getUserFromRequest();
}

export function signupUser(data: { email: string; firstName: string; lastName: string; phone: string; password: string }): ServerUser | null {
  const exists = db.users.find(u => u.email === data.email);
  if (exists) return null;
  const user: ServerUser = { id: generateId('user'), ...data };
  db.users.push(user);
  return user;
}

export function loginUser(email: string, password: string): { token: string; user: Omit<ServerUser, 'password'> } | null {
  const user = db.users.find(u => u.email === email && u.password === password);
  if (!user) return null;
  const token = signJwt({ sub: user.id, email: user.email });
  const { password: _pw, ...safeUser } = user;
  return { token, user: safeUser };
}


