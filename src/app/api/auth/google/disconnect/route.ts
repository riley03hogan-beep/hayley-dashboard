import { NextRequest, NextResponse } from 'next/server';
import { clearGoogleCookies } from '@/lib/google';

export function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/?google=disconnected', request.url));
  clearGoogleCookies(response);
  return response;
}
