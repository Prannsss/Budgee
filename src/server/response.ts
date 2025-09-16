import { NextResponse } from 'next/server';

export function ok(data: unknown) {
  return NextResponse.json({ success: true, data }, { status: 200 });
}

export function badRequest(message: string, details?: unknown) {
  return NextResponse.json({ success: false, error: { message, details } }, { status: 400 });
}

export function unauthorized(message = 'Unauthorized') {
  return NextResponse.json({ success: false, error: { message } }, { status: 401 });
}

export function serverError(message = 'Internal Server Error', details?: unknown) {
  return NextResponse.json({ success: false, error: { message, details } }, { status: 500 });
}


