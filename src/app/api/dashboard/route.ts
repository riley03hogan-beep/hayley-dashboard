import { NextRequest, NextResponse } from 'next/server';
import { buildDashboardPayload, getValidGoogleTokens, setGoogleTokenCookie } from '@/lib/google';

export async function GET(request: NextRequest) {
  const tokens = await getValidGoogleTokens(request);
  const payload = await buildDashboardPayload(tokens);
  const response = NextResponse.json(payload);
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');

  if (tokens) {
    setGoogleTokenCookie(response, tokens);
  }

  return response;
}
