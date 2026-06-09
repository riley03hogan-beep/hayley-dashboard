import { NextRequest, NextResponse } from 'next/server';
import { buildGoogleAuthUrl, GOOGLE_STATE_COOKIE, googleIsConfigured } from '@/lib/google';

export function GET(request: NextRequest) {
  if (!googleIsConfigured()) {
    return NextResponse.redirect(new URL('/?google=missing-config', request.url));
  }

  const state = crypto.randomUUID();
  const response = NextResponse.redirect(buildGoogleAuthUrl(request, state));

  response.cookies.set(GOOGLE_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 10,
  });

  return response;
}
