import { NextRequest, NextResponse } from 'next/server';
import type { CalendarEvent, EmailCategory, EmailMessage, EventSource, SetupStatusItem } from '@/types';
import { mockEmails, mockEvents, setupStatusItems } from '@/data/mockData';

export const GOOGLE_TOKEN_COOKIE = 'hayley_google_tokens';
export const GOOGLE_STATE_COOKIE = 'hayley_google_oauth_state';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/gmail.readonly',
];

export interface GoogleTokens {
  access_token: string;
  expires_at: number;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
}

export interface DashboardPayload {
  source: 'live' | 'mock';
  connected: boolean;
  configured: boolean;
  error?: string;
  emails: EmailMessage[];
  events: CalendarEvent[];
  setupStatus: SetupStatusItem[];
}

interface GoogleTokenResponse {
  access_token: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
  error?: string;
  error_description?: string;
}

interface GoogleCalendarListResponse {
  items?: Array<{ id: string; summary?: string; primary?: boolean; selected?: boolean }>;
}

interface GoogleCalendarEventsResponse {
  items?: GoogleCalendarEvent[];
}

interface GoogleCalendarEvent {
  id?: string;
  summary?: string;
  description?: string;
  location?: string;
  start?: { date?: string; dateTime?: string };
  end?: { date?: string; dateTime?: string };
}

interface GmailListResponse {
  messages?: Array<{ id: string; threadId: string }>;
}

interface GmailMessageResponse {
  id?: string;
  labelIds?: string[];
  snippet?: string;
  payload?: {
    headers?: Array<{ name: string; value: string }>;
  };
}

export function googleIsConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function getAppUrl(request: NextRequest) {
  return process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
}

export function getRedirectUri(request: NextRequest) {
  return `${getAppUrl(request)}/api/auth/callback/google`;
}

export function buildGoogleAuthUrl(request: NextRequest, state: string) {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID ?? '',
    redirect_uri: getRedirectUri(request),
    response_type: 'code',
    scope: GOOGLE_SCOPES.join(' '),
    access_type: 'offline',
    prompt: 'consent',
    state,
  });

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export async function exchangeCodeForTokens(request: NextRequest, code: string) {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID ?? '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      code,
      grant_type: 'authorization_code',
      redirect_uri: getRedirectUri(request),
    }),
  });

  const data = (await response.json()) as GoogleTokenResponse;
  if (!response.ok || data.error) {
    throw new Error(data.error_description || data.error || 'Google OAuth token exchange failed.');
  }

  return normalizeTokens(data);
}

export async function getValidGoogleTokens(request: NextRequest) {
  const tokens = decodeTokens(request.cookies.get(GOOGLE_TOKEN_COOKIE)?.value);
  if (!tokens) return null;
  if (tokens.expires_at > Date.now() + 60_000) return tokens;
  if (!tokens.refresh_token) return null;

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID ?? '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      refresh_token: tokens.refresh_token,
      grant_type: 'refresh_token',
    }),
  });

  const data = (await response.json()) as GoogleTokenResponse;
  if (!response.ok || data.error) return null;

  return normalizeTokens({ ...data, refresh_token: tokens.refresh_token });
}

export function setGoogleTokenCookie(response: NextResponse, tokens: GoogleTokens) {
  response.cookies.set(GOOGLE_TOKEN_COOKIE, encodeTokens(tokens), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });
}

export function clearGoogleCookies(response: NextResponse) {
  response.cookies.set(GOOGLE_TOKEN_COOKIE, '', { path: '/', maxAge: 0 });
  response.cookies.set(GOOGLE_STATE_COOKIE, '', { path: '/', maxAge: 0 });
}

export async function buildDashboardPayload(tokens: GoogleTokens | null): Promise<DashboardPayload> {
  const configured = googleIsConfigured();

  if (!configured || !tokens) {
    return {
      source: 'mock',
      connected: false,
      configured,
      emails: mockEmails,
      events: mockEvents,
      setupStatus: withGoogleStatus(false, configured),
    };
  }

  try {
    const [events, emails] = await Promise.all([fetchCalendarEvents(tokens.access_token), fetchGmailMessages(tokens.access_token)]);

    return {
      source: 'live',
      connected: true,
      configured,
      emails: emails.length ? emails : mockEmails,
      events: events.length ? events : mockEvents,
      setupStatus: withGoogleStatus(true, configured),
    };
  } catch (error) {
    return {
      source: 'mock',
      connected: true,
      configured,
      error: error instanceof Error ? error.message : 'Google API request failed.',
      emails: mockEmails,
      events: mockEvents,
      setupStatus: withGoogleStatus(true, configured),
    };
  }
}

async function fetchCalendarEvents(accessToken: string): Promise<CalendarEvent[]> {
  const calendarList = await googleFetch<GoogleCalendarListResponse>(
    'https://www.googleapis.com/calendar/v3/users/me/calendarList',
    accessToken,
  );
  const calendars = (calendarList.items ?? []).filter((calendar) => calendar.selected || calendar.primary).slice(0, 10);
  const timeMin = startOfToday().toISOString();
  const timeMax = addDays(startOfToday(), 8).toISOString();

  const eventGroups = await Promise.all(
    calendars.map(async (calendar) => {
      const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendar.id)}/events`);
      url.searchParams.set('singleEvents', 'true');
      url.searchParams.set('orderBy', 'startTime');
      url.searchParams.set('timeMin', timeMin);
      url.searchParams.set('timeMax', timeMax);
      url.searchParams.set('maxResults', '25');
      const events = await googleFetch<GoogleCalendarEventsResponse>(url.toString(), accessToken);
      return (events.items ?? []).map((event) => mapCalendarEvent(event, calendar.summary ?? 'Google Calendar'));
    }),
  );

  return eventGroups
    .flat()
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, 60);
}

async function fetchGmailMessages(accessToken: string): Promise<EmailMessage[]> {
  const url = new URL('https://gmail.googleapis.com/gmail/v1/users/me/messages');
  url.searchParams.set(
    'q',
    'in:inbox newer_than:14d (canvas OR teamworks OR basketball OR coach OR "Illinois State" OR outlook OR urgent OR "action needed" OR due OR travel OR meeting)',
  );
  url.searchParams.set('maxResults', '30');

  const list = await googleFetch<GmailListResponse>(url.toString(), accessToken);
  const messages = await Promise.all(
    (list.messages ?? []).map((message) =>
      googleFetch<GmailMessageResponse>(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
        accessToken,
      ),
    ),
  );

  return messages.map(mapGmailMessage);
}

async function googleFetch<T>(url: string, accessToken: string): Promise<T> {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Google API error ${response.status}: ${text.slice(0, 180)}`);
  }

  return response.json() as Promise<T>;
}

function mapCalendarEvent(event: GoogleCalendarEvent, calendarName: string): CalendarEvent {
  const title = event.summary || 'Untitled event';
  const start = event.start?.dateTime || event.start?.date || new Date().toISOString();
  const end = event.end?.dateTime || event.end?.date || start;
  const searchable = `${title} ${event.description ?? ''} ${event.location ?? ''} ${calendarName}`.toLowerCase();

  return {
    id: event.id || `${title}-${start}`,
    title,
    start,
    end,
    dayLabel: getDayLabel(start),
    source: getEventSource(searchable, calendarName),
    location: event.location || calendarName,
  };
}

function mapGmailMessage(message: GmailMessageResponse): EmailMessage {
  const headers = message.payload?.headers ?? [];
  const from = getHeader(headers, 'From') || 'Gmail';
  const subject = getHeader(headers, 'Subject') || 'No subject';
  const receivedAt = formatReceivedAt(getHeader(headers, 'Date'));
  const snippet = message.snippet || 'No preview available.';
  const category = getEmailCategory(`${from} ${subject} ${snippet}`);
  const important = isImportantEmail(`${subject} ${snippet}`);

  return {
    id: message.id || subject,
    from,
    subject,
    snippet,
    receivedAt,
    unread: Boolean(message.labelIds?.includes('UNREAD')),
    important,
    category,
  };
}

function getEventSource(value: string, calendarName: string): EventSource {
  const calendar = calendarName.toLowerCase();
  const s = (value + ' ' + calendarName).toLowerCase();
  if (calendar.includes('canvas') || s.includes('[knr') || s.includes('[spm')) return 'School';
  if (calendar.includes('basketball') || calendar.includes('teamworks') || s.includes('basketball') || s.includes('teamworks')) return 'Basketball';
  if (calendar.includes('holiday') || calendar.includes('holidays') || calendar.includes('united states')) return 'Holiday';
  return 'Personal';
}

function getEmailCategory(value: string): EmailCategory {
  const searchable = value.toLowerCase();
  if (searchable.includes('urgent') || searchable.includes('action needed') || searchable.includes('asap')) return 'Urgent';
  if (searchable.includes('canvas') || searchable.includes('assignment') || searchable.includes('due')) return 'Assignments';
  if (searchable.includes('teamworks') || searchable.includes('basketball') || searchable.includes('coach')) return 'Basketball';
  if (searchable.includes('illinois state') || searchable.includes('outlook') || searchable.includes('isu')) return 'Illinois State';
  if (searchable.includes('travel') || searchable.includes('hotel') || searchable.includes('bus')) return 'Travel';
  if (searchable.includes('meeting') || searchable.includes('zoom')) return 'Meetings';
  return 'General';
}

function isImportantEmail(value: string) {
  const searchable = value.toLowerCase();
  return ['urgent', 'action needed', 'asap', 'due today', 'due tomorrow', 'required'].some((keyword) => searchable.includes(keyword));
}

function getHeader(headers: Array<{ name: string; value: string }>, name: string) {
  return headers.find((header) => header.name.toLowerCase() === name.toLowerCase())?.value;
}

function formatReceivedAt(value?: string) {
  if (!value) return 'Recent';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recent';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(date);
}

function getDayLabel(value: string): CalendarEvent['dayLabel'] {
  const date = new Date(value);
  const today = startOfToday();
  const tomorrow = addDays(today, 1);
  if (sameDate(date, today)) return 'Today';
  if (sameDate(date, tomorrow)) return 'Tomorrow';
  return 'Next 7 days';
}

function sameDate(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function withGoogleStatus(connected: boolean, configured: boolean): SetupStatusItem[] {
  return setupStatusItems.map((item) => {
    if (item.label === 'Gmail connected') {
      return {
        ...item,
        connected,
        note: configured
          ? connected
            ? 'Gmail API is connected through Google OAuth.'
            : 'Ready to connect with Google OAuth.'
          : 'Add Google OAuth environment variables first.',
      };
    }

    if (item.label === 'Google Calendar connected') {
      return {
        ...item,
        connected,
        note: configured
          ? connected
            ? 'Google Calendar API is connected through Google OAuth.'
            : 'Ready to connect with Google OAuth.'
          : 'Add Google OAuth environment variables first.',
      };
    }

    return item;
  });
}

function normalizeTokens(data: GoogleTokenResponse): GoogleTokens {
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    scope: data.scope,
    token_type: data.token_type,
    expires_at: Date.now() + (data.expires_in ?? 3600) * 1000,
  };
}

function encodeTokens(tokens: GoogleTokens) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(tokens))))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function decodeTokens(value?: string): GoogleTokens | null {
  if (!value) return null;
  try {
    const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
    return JSON.parse(decodeURIComponent(escape(atob(padded)))) as GoogleTokens;
  } catch {
    return null;
  }
}
