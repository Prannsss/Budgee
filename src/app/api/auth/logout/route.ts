import { ok, serverError } from '@/server/response';
import { clearAuthCookie } from '@/server/auth';

export async function POST() {
  try {
    clearAuthCookie();
    return ok({ message: 'Logged out' });
  } catch (e: any) {
    return serverError('Failed to logout', e?.message);
  }
}


