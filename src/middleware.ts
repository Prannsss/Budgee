import { NextResponse } from 'next/server';

export const config = {
  matcher: ['/api/:path*', '/dashboard/:path*'],
};

const OPEN_ROUTES = [
  '/api/auth/login',
  '/api/auth/signup',
];

export function middleware(request: Request) {
  const url = new URL(request.url);

  // Allow open routes
  if (OPEN_ROUTES.includes(url.pathname)) {
    return NextResponse.next();
  }

  // Check auth cookie for protected API routes
  if (url.pathname.startsWith('/api/')) {
    const token = request.headers.get('cookie')?.match(/budgee_token=([^;]+)/)?.[1];
    if (!token) {
      return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 });
    }
  }

  return NextResponse.next();
}


