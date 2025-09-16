import { badRequest, ok, serverError } from '@/server/response';
import { loginUser, setAuthCookie } from '@/server/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body || {};
    if (!email || !password) return badRequest('Email and password are required');

    const result = loginUser(email, password);
    if (!result) return badRequest('Invalid credentials');

    setAuthCookie(result.token);
    return ok({ token: result.token, user: result.user });
  } catch (e: any) {
    return serverError('Failed to login', e?.message);
  }
}


