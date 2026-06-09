import { NextRequest, NextResponse } from 'next/server';
import { clearGoogleCookies, exchangeCodeForTokens, GOOGLE_STATE_COOKIE, setGoogleTokenCookie } from '@/lib/google';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  const expectedState = request.cookies.get(GOOGLE_STATE_COOKIE)?.value;

  if (!code || !state || state !== expectedState) {
    const response = NextResponse.redirect(new URL('/?google=invalid-state', request.url));
    clearGoogleCookies(response);
    return response;
  }

  try {
    const tokens = await exchangeCodeForTokens(request, code);
    const response = NextResponse.redirect(new URL('/?google=connected', request.url));
    setGoogleTokenCookie(response, tokens);
    response.cookies.set(GOOGLE_STATE_COOKIE, '', { path: '/', maxAge: 0 });
    return response;
  } catch {
    const response = NextResponse.redirect(new URL('/?google=failed', request.url));
    clearGoogleCookies(response);
    return response;
  }
}
