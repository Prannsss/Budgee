import { badRequest, ok, serverError } from '@/server/response';
import { signupUser } from '@/server/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, firstName, lastName, phone, password } = body || {};
    if (!email || !password || !firstName || !lastName || !phone) {
      return badRequest('Missing required fields');
    }

    const user = signupUser({ email, firstName, lastName, phone, password });
    if (!user) return badRequest('Email already registered');

    const { password: _pw, ...safeUser } = user;
    return ok({ user: safeUser });
  } catch (e: any) {
    return serverError('Failed to signup', e?.message);
  }
}


