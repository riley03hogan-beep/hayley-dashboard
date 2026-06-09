import type { CalendarEvent, EmailCategory, EmailMessage } from '../types';

const urgentKeywords = ['urgent', 'asap', 'due', 'required', 'action needed'];
const categoryKeywords: Record<EmailCategory, string[]> = {
  Canvas: ['canvas', 'course', 'class'],
  Basketball: ['basketball', 'practice', 'game', 'coach', 'teamworks'],
  'Illinois State': ['illinois state', 'redbirds', 'isu', 'outlook'],
  Urgent: urgentKeywords,
  Assignments: ['assignment', 'exam', 'quiz', 'grade', 'due'],
  Travel: ['travel', 'hotel', 'flight', 'bus', 'itinerary'],
  Meetings: ['meeting', 'zoom', 'appointment'],
  General: [],
};

export function categorizeGmailMessage(message: Pick<EmailMessage, 'subject' | 'snippet' | 'from'>): EmailCategory {
  const searchable = `${message.from} ${message.subject} ${message.snippet}`.toLowerCase();
  const match = Object.entries(categoryKeywords).find(([, keywords]) =>
    keywords.some((keyword) => searchable.includes(keyword)),
  );

  return (match?.[0] as EmailCategory | undefined) ?? 'General';
}

export function isHighPriorityEmail(message: EmailMessage): boolean {
  const searchable = `${message.subject} ${message.snippet}`.toLowerCase();
  return message.important || urgentKeywords.some((keyword) => searchable.includes(keyword));
}

export function getEventsBySource(events: CalendarEvent[], source: CalendarEvent['source']) {
  return events.filter((event) => event.source === source);
}

// Connect Gmail API here after OAuth is configured.
// Expected flow:
// 1. Use a Google OAuth client ID from NEXT_PUBLIC_GOOGLE_CLIENT_ID.
// 2. Request Gmail read-only scopes such as gmail.readonly.
// 3. Fetch messages through the Gmail API and map them to EmailMessage.
// 4. Run categorizeGmailMessage before rendering.
export async function fetchGmailMessages(): Promise<EmailMessage[]> {
  throw new Error('Gmail API is not connected. Using mock Gmail data instead.');
}

// Connect Google Calendar API here after OAuth is configured.
// Expected flow:
// 1. Use NEXT_PUBLIC_GOOGLE_CLIENT_ID and NEXT_PUBLIC_GOOGLE_API_KEY.
// 2. Request calendar.readonly scope.
// 3. Fetch calendar events from primary plus connected Canvas/Teamworks calendars.
// 4. Map events to CalendarEvent with source tags.
export async function fetchCalendarEvents(): Promise<CalendarEvent[]> {
  throw new Error('Google Calendar API is not connected. Using mock calendar data instead.');
}
