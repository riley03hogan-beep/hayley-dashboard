'use client';

import type { ReactNode } from 'react';
import type { Assignment, CalendarEvent, EmailMessage } from '@/types';
import { useDoneItems } from '@/context/DoneItemsContext';

export const LINKS = {
  canvas: 'https://canvas.illinoisstate.edu/courses',
  teamworks: 'https://www.teamworksapp.com/home/overview',
  googleCalendar: 'https://calendar.google.com/calendar/u/0/r/week',
  gmail: 'https://mail.google.com/mail/u/0/?tab=rm&ogbl#inbox',
  outlook:
    'https://outlook.cloud.microsoft/mail/inbox/id/AAQkADIyMWVjZTQ2LWI3Y2YtNGE3OC04ZmYzLWVhN2I1MjFmMTU0MAAQABuHs%2BlVw81Hr0sONTTU%2BYs%3D?culture=en-us&country=us',
} as const;

// Kept for DashboardClient compatibility — no longer used internally
export interface RankedPriority {
  id: string;
  title: string;
  detail: string;
  score: number;
  source: 'Student' | 'Coach' | 'Inbox';
  href: string;
  doneKey: string;
}

const sourceClass = {
  Basketball: 'bg-emerald-100 text-emerald-700',
  School: 'bg-blue-100 text-blue-700',
  Holiday: 'bg-amber-100 text-amber-700',
  Personal: 'bg-purple-100 text-purple-700',
} as const;

const statusClass = {
  Overdue: 'bg-red-100 text-red-700',
  'Due Soon': 'bg-amber-100 text-amber-700',
  Upcoming: 'bg-stone-100 text-stone-600',
  Done: 'bg-stone-100 text-stone-400',
} as const;

// ── TodaysGamePlan (header bar + quick stats) ────────────────────────────────

interface GamePlanProps {
  connected: boolean;
  configured: boolean;
  dueTodayCount: number;
  hasLoaded: boolean;
  isLive: boolean;
  isRefreshing: boolean;
  lastUpdated: string | null;
  onRefresh: () => void;
  today: string;
  todayWorkloadMinutes: number;
  unreadCount: number;
}

export function TodaysGamePlan({
  connected,
  configured,
  dueTodayCount,
  hasLoaded,
  isLive,
  isRefreshing,
  lastUpdated,
  onRefresh,
  today,
  todayWorkloadMinutes,
  unreadCount,
}: GamePlanProps) {
  return (
    <section className="mx-auto mb-3 max-w-[1500px] overflow-hidden rounded-xl border border-redbird-500/20 bg-white shadow-soft sm:mb-5">
      {/* Header strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 bg-[#fffaf7] px-4 py-3 sm:gap-3 sm:px-6 sm:py-4">
        <div className="flex items-center gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-lg border border-redbird-500/20 bg-white p-1.5 shadow-sm">
            <img
              alt="Illinois State Redbirds"
              className="h-full w-full object-contain"
              src="/illinois-state-redbirds-emblem.png"
            />
          </div>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-redbird-600">
              {isLive ? 'Live morning brief' : 'Morning brief'}
            </p>
            <p className="text-base font-black text-ink">{today}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {connected ? (
            <button
              className="rounded-lg bg-redbird-500 px-4 py-2 text-sm font-black text-white transition hover:bg-redbird-600 disabled:cursor-wait disabled:bg-stone-300"
              disabled={isRefreshing}
              onClick={onRefresh}
              type="button"
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          ) : (
            <a
              className="rounded-lg bg-redbird-500 px-4 py-2 text-sm font-black text-white transition hover:bg-redbird-600"
              href="/api/auth/google/start"
            >
              Connect Google
            </a>
          )}
          <span className="text-xs font-bold uppercase tracking-wide text-stone-500">
            {connected
              ? lastUpdated
                ? `Checked ${lastUpdated}`
                : 'Auto-refreshes'
              : configured
                ? 'Ready to connect'
                : hasLoaded
                  ? 'Google setup needed'
                  : 'Checking setup'}
          </span>
        </div>
      </div>

      {/* Quick stats */}
      <div className="flex flex-wrap gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4">
        <QuickStat
          accent
          label={todayWorkloadMinutes === 0 ? 'no work remaining today' : 'time remaining today'}
          value={formatDuration(todayWorkloadMinutes)}
        />
        <QuickStat
          label={dueTodayCount === 1 ? 'deadline today' : 'deadlines today'}
          value={String(dueTodayCount)}
        />
        <QuickStat
          label={unreadCount === 1 ? 'unread email' : 'unread emails'}
          value={String(unreadCount)}
        />
      </div>
    </section>
  );
}

// ── TodayView ────────────────────────────────────────────────────────────────

export function TodayView({
  assignments,
  events,
  today,
}: {
  assignments: Assignment[];
  events: CalendarEvent[];
  today: string;
}) {
  // Exclude School/Canvas events — those show as assignment rows
  const todayEvents = events.filter((e) => e.dayLabel === 'Today' && e.source !== 'School');
  const todayAssignments = assignments.filter(
    (a) => a.status !== 'Done' && (isDueToday(a) || a.status === 'Overdue'),
  );

  type Item =
    | { id: string; sortTime: number; type: 'event'; data: CalendarEvent }
    | { id: string; sortTime: number; type: 'assignment'; data: Assignment };

  const items: Item[] = [
    ...todayEvents.map((e) => ({
      id: `event-${e.id}`,
      type: 'event' as const,
      data: e,
      sortTime: parseLocalDate(e.start).getTime(),
    })),
    ...todayAssignments.map((a) => ({
      id: `assignment-${a.id}`,
      type: 'assignment' as const,
      data: a,
      // Overdue items float to top; due-today items sort by their due time
      sortTime: a.status === 'Overdue' ? 0 : sortableAssignmentTime(a),
    })),
  ].sort((a, b) => a.sortTime - b.sortTime);

  return (
    <DashboardCard eyebrow="Today" title={today || 'Today'}>
      <div className="grid gap-2 sm:gap-3">
        {items.length ? (
          items.map((item) =>
            item.type === 'event' ? (
              <EventRow event={item.data} key={item.id} />
            ) : (
              <AssignmentRow assignment={item.data} key={item.id} />
            ),
          )
        ) : (
          <EmptyState message="Nothing scheduled or due today." />
        )}
      </div>
    </DashboardCard>
  );
}

// ── InboxRequiringAction ─────────────────────────────────────────────────────

export function InboxRequiringAction({ emails }: { emails: EmailMessage[] }) {
  const { doneIds } = useDoneItems();
  const actionEmails = getActionEmails(emails);
  // Filter out emails the user has already filed
  const visibleEmails = actionEmails.filter((e) => !doneIds.has(`email-${e.id}`));

  return (
    <DashboardCard eyebrow="Inbox" title="Requiring Action">
      <div className="mb-4 grid grid-cols-2 gap-3">
        <Metric
          helper="main inbox"
          label="Unread"
          value={String(emails.filter((e) => e.unread && !doneIds.has(`email-${e.id}`)).length)}
        />
        <Metric helper="reply, file, or decide" label="Action" value={String(visibleEmails.length)} />
      </div>
      <div className="grid gap-3">
        {visibleEmails.length ? (
          visibleEmails.map((email) => (
            <EmailRow email={email} key={email.id} />
          ))
        ) : (
          <EmptyState message="No inbox items need action right now." />
        )}
      </div>
    </DashboardCard>
  );
}

// ── ThisWeekView ─────────────────────────────────────────────────────────────

export function ThisWeekView({
  assignments,
  events,
  weekWorkloadMinutes,
}: {
  assignments: Assignment[];
  events: CalendarEvent[];
  weekWorkloadMinutes: number;
}) {
  // Only show events from tomorrow onward (strictly future days, not today, not past)
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);

  const futureEvents = events.filter(
    (e) =>
      e.source !== 'School' &&
      e.dayLabel !== 'Today' &&
      parseLocalDate(e.start) >= tomorrowStart,
  );
  // Assignments not due today and not overdue
  const futureAssignments = assignments.filter(
    (a) => a.status !== 'Done' && !isDueToday(a) && a.status !== 'Overdue',
  );

  type Item =
    | { id: string; sortTime: number; type: 'event'; data: CalendarEvent }
    | { id: string; sortTime: number; type: 'assignment'; data: Assignment };

  const items: Item[] = [
    ...futureEvents.map((e) => ({
      id: `event-${e.id}`,
      type: 'event' as const,
      data: e,
      sortTime: parseLocalDate(e.start).getTime(),
    })),
    ...futureAssignments.map((a) => ({
      id: `assignment-${a.id}`,
      type: 'assignment' as const,
      data: a,
      sortTime: sortableAssignmentTime(a),
    })),
  ].sort((a, b) => a.sortTime - b.sortTime);

  // Group by calendar day using local date components
  const grouped = new Map<string, { dayDate: Date; items: Item[] }>();
  for (const item of items) {
    const ts = item.sortTime === Infinity || item.sortTime === 0 ? Date.now() : item.sortTime;
    const date = new Date(ts);
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    if (!grouped.has(key)) grouped.set(key, { dayDate: date, items: [] });
    grouped.get(key)!.items.push(item);
  }
  const groupedDays = [...grouped.values()].sort((a, b) => a.dayDate.getTime() - b.dayDate.getTime());

  return (
    <DashboardCard eyebrow="This week" title="Coming Up">
      <div className="mb-4 rounded-lg bg-stone-50 p-3">
        <p className="text-xs font-bold uppercase tracking-wide text-stone-500">
          School workload remaining this week
        </p>
        <p className="mt-1 text-2xl font-black text-ink">{formatDuration(weekWorkloadMinutes)}</p>
      </div>
      {groupedDays.length ? (
        <div className="grid gap-5">
          {groupedDays.map(({ dayDate, items: dayItems }) => (
            <div key={dayDate.toDateString()}>
              <p className="mb-2 text-xs font-extrabold uppercase tracking-wider text-redbird-600">
                {new Intl.DateTimeFormat('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                }).format(dayDate)}
              </p>
              <div className="grid gap-2 sm:gap-3">
                {dayItems.map((item) =>
                  item.type === 'event' ? (
                    <EventRow event={item.data} key={item.id} />
                  ) : (
                    <AssignmentRow assignment={item.data} key={item.id} />
                  ),
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState message="Nothing else coming up this week." />
      )}
    </DashboardCard>
  );
}

// ── Private UI components ────────────────────────────────────────────────────

function DashboardCard({
  children,
  eyebrow,
  title,
}: {
  children: ReactNode;
  eyebrow: string;
  title: string;
}) {
  return (
    <section className="rounded-lg border border-stone-200 bg-paper/95 p-4 shadow-soft sm:p-5">
      <p className="text-xs font-extrabold uppercase tracking-wider text-redbird-600">{eyebrow}</p>
      <h2 className="mt-1 text-xl font-black leading-tight text-ink sm:text-2xl">{title}</h2>
      <div className="mt-3 sm:mt-4">{children}</div>
    </section>
  );
}

function QuickStat({
  accent = false,
  label,
  value,
}: {
  accent?: boolean;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-stone-100 px-3 py-2 sm:px-4 sm:py-2.5">
      <span className={`text-xl font-black sm:text-2xl ${accent ? 'text-redbird-600' : 'text-ink'}`}>
        {value}
      </span>
      <span className="ml-1.5 text-xs font-semibold text-stone-600 sm:ml-2 sm:text-sm">{label}</span>
    </div>
  );
}

function Metric({
  helper,
  label,
  value,
}: {
  helper: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-stone-500">{label}</p>
      <p className="mt-1 text-3xl font-black text-ink">{value}</p>
      <p className="mt-1 text-sm font-semibold text-stone-600">{helper}</p>
    </div>
  );
}

function EventRow({ event, compact = false }: { event: CalendarEvent; compact?: boolean }) {
  const href =
    event.source === 'Basketball'
      ? LINKS.teamworks
      : event.source === 'School'
        ? LINKS.canvas
        : LINKS.googleCalendar;

  const allDay = isAllDayEvent(event.start);
  const startLabel = allDay ? 'All day' : formatTime(event.start);
  const endLabel = !allDay && event.end ? formatTime(event.end) : '';
  const timeLabel =
    endLabel && endLabel !== startLabel ? `${startLabel} – ${endLabel}` : startLabel;

  // Dim timed events that have already ended
  const isPast = !allDay && new Date(event.end ?? event.start) < new Date();

  return (
    <a
      className={`grid gap-2 rounded-lg border border-stone-200 bg-white transition-colors hover:bg-stone-50 ${compact ? 'p-3' : 'p-3 sm:p-4'} sm:grid-cols-[164px_minmax(0,1fr)_auto] sm:items-center ${isPast ? 'opacity-40' : ''}`}
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      <time className="text-sm font-black text-redbird-600 tabular-nums">{timeLabel}</time>
      <div>
        <h3 className="text-sm font-black text-ink">{cleanEventTitle(event.title)}</h3>
        <p className="mt-0.5 text-sm text-stone-600">{event.location ?? 'No location listed'}</p>
      </div>
      <span
        className={`h-fit w-fit rounded-full px-2.5 py-1 text-xs font-black ${sourceClass[event.source] ?? 'bg-stone-100 text-stone-600'}`}
      >
        {event.source}
      </span>
    </a>
  );
}

function AssignmentRow({
  assignment,
  compact = false,
}: {
  assignment: Assignment;
  compact?: boolean;
}) {
  const { doneIds, toggleDone } = useDoneItems();
  const isDone = doneIds.has(assignment.id);

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border border-stone-200 bg-white transition-colors ${compact ? 'p-3' : 'p-3 sm:p-4'} ${isDone ? 'opacity-50' : ''}`}
    >
      <button
        aria-label={isDone ? 'Mark incomplete' : 'Mark complete'}
        className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          isDone
            ? 'border-stone-400 bg-stone-400'
            : 'border-stone-400 bg-transparent hover:border-stone-600'
        }`}
        onClick={() => toggleDone(assignment.id)}
        type="button"
      >
        {isDone && (
          <svg className="size-3 text-white" fill="none" viewBox="0 0 12 12">
            <path
              d="M2 6l3 3 5-5"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
        )}
      </button>
      <a
        className="min-w-0 flex-1 hover:opacity-80"
        href={assignment.canvasUrl || LINKS.canvas}
        rel="noopener noreferrer"
        target="_blank"
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className={`text-sm font-black text-ink ${isDone ? 'line-through' : ''}`}>
            {assignment.title}
          </h3>
          <span className={`rounded-full px-2.5 py-1 text-xs font-black ${statusClass[assignment.status]}`}>
            {assignment.status}
          </span>
        </div>
        <p className="mt-1 text-sm text-stone-600">
          {assignment.course} · {assignment.dueDate} · {assignment.estimatedMinutes} min
        </p>
      </a>
    </div>
  );
}

function EmailRow({ compact = false, email }: { compact?: boolean; email: EmailMessage }) {
  const { doneIds, toggleDone } = useDoneItems();
  const doneKey = `email-${email.id}`;
  if (doneIds.has(doneKey)) return null;

  const folder = suggestFolder(email);

  return (
    <div className={`rounded-lg border border-stone-200 bg-white transition-colors hover:bg-stone-50 ${compact ? 'p-3' : 'p-3 sm:p-4'}`}>
      <div className="flex items-start justify-between gap-2">
        <a
          className="min-w-0 flex-1"
          href={getEmailLink(email)}
          rel="noopener noreferrer"
          target="_blank"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wide text-stone-500">
              {cleanFrom(email.from)}
            </span>
            {email.unread ? (
              <span className="rounded-full bg-redbird-500 px-2 py-0.5 text-[11px] font-black text-white">
                Unread
              </span>
            ) : null}
            {folder ? (
              <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-black text-stone-600">
                {folder}
              </span>
            ) : null}
          </div>
          <h3 className="mt-1 text-sm font-black text-ink">{cleanSubject(email.subject)}</h3>
          {!compact && cleanSnippet(email.snippet) ? (
            <p className="mt-1 text-sm leading-snug text-stone-600">{cleanSnippet(email.snippet)}</p>
          ) : null}
        </a>
        <button
          aria-label="Mark as filed"
          className="ml-2 mt-0.5 shrink-0 rounded-full border border-stone-200 bg-white px-2.5 py-1 text-[11px] font-black text-stone-500 transition hover:border-stone-400 hover:text-stone-700"
          onClick={() => toggleDone(doneKey)}
          type="button"
        >
          Filed ✓
        </button>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-stone-300 bg-white p-4 text-sm font-semibold text-stone-600">
      {message}
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getActionEmails(emails: EmailMessage[]) {
  return emails.filter((e) => e.unread || e.important || e.category === 'Urgent');
}

function suggestFolder(email: EmailMessage): string | null {
  const text = `${email.from} ${email.subject} ${email.snippet ?? ''}`.toLowerCase();
  if (
    text.includes('wbb') ||
    text.includes('teamworks') ||
    (text.includes('basketball') && !text.includes('knr') && !text.includes('spm'))
  )
    return 'WBB';
  if (
    text.includes('canvas') ||
    text.includes('knr') ||
    text.includes('spm') ||
    text.includes('discussion') ||
    text.includes('assignment created') ||
    text.includes('assignment due') ||
    text.includes('module') ||
    text.includes('quiz') ||
    text.includes('course eval') ||
    text.includes('week 5') ||
    text.includes('seminar')
  )
    return 'Class';
  if (text.includes('erefund') || text.includes('refund')) return 'Finances';
  if (
    text.includes('apartment') ||
    text.includes('lease') ||
    text.includes('rent') ||
    text.includes('tenant') ||
    text.includes('landlord') ||
    text.includes('maintenance request') ||
    text.includes('move-in') ||
    text.includes('move in') ||
    text.includes('application fee') ||
    text.includes('apt ') ||
    text.includes('bloomington') ||
    text.includes('property management') ||
    text.includes('renters insurance')
  )
    return 'Illinois State/Apartment';
  if (text.includes('receipt') || text.includes('order') || text.includes('purchase'))
    return 'Receipts & Orders';
  if (text.includes('travel') || text.includes('flight') || text.includes('hotel')) return 'Travel';
  if (
    text.includes('illinois state') ||
    text.includes('illinoisstate.edu') ||
    text.includes('registrar') ||
    text.includes('admissions')
  )
    return 'Illinois State';
  return null;
}

function getEmailLink(email: EmailMessage): string {
  const isSchool =
    ['Assignments', 'Canvas', 'Illinois State'].includes(email.category) ||
    email.from.toLowerCase().includes('instructor') ||
    email.from.toLowerCase().includes('professor') ||
    email.from.toLowerCase().includes('illinois state') ||
    email.from.toLowerCase().includes('canvas');
  return isSchool ? LINKS.outlook : LINKS.gmail;
}

function cleanEventTitle(title: string): string {
  return title.replace(/\[[^\]]+\]/g, '').replace(/\s+/g, ' ').trim() || title;
}

function cleanFrom(from: string): string {
  const match = from.match(/^["']?([^"'<]+)["']?\s*(?:<[^>]*>)?$/);
  return match ? match[1].trim() : from;
}

function cleanSnippet(snippet: string): string {
  const decoded = snippet
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
  let clean = decoded
    .replace(/^(?:(?:From|To|Sent|Date|Subject|CC|BCC):\s*[^\n]*\s*)+/gi, '')
    .replace(/\s*Subject\s*$/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!clean) return '';
  if (clean.length > 130) clean = `${clean.slice(0, 129)}…`;
  return clean;
}

function cleanSubject(subject: string): string {
  let clean = subject
    .replace(/^(?:(?:RE|FW|FWD):\s*)+/i, '')
    .replace(/^Notification:\s*/i, '')
    .replace(/\[[^\]]+\]/g, '')
    .replace(/\s*@\s+\w+\s+\w+\s+\d+.*$/, '')
    .replace(/\s*\([^)]*[Cc]alendar[^)]*\)\s*$/, '')
    .replace(/\s+/g, ' ')
    .trim();
  return clean || subject;
}

function isAllDayEvent(start: string): boolean {
  return /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(start);
}

function sortableAssignmentTime(a: Assignment): number {
  if (!a.dueAt) return Infinity;
  return parseLocalDate(a.dueAt).getTime();
}

// Google Calendar all-day events (Canvas deadlines) come as "YYYY-MM-DD" date-only strings.
// JS parses these as UTC midnight, which in CDT shifts to the previous day. Parse as local 11:59 PM.
function parseLocalDate(value: string): Date {
  if (/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(value)) {
    const parts = value.split('-').map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2], 23, 59, 0);
  }
  return new Date(value);
}

function sameDate(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatDuration(minutes: number): string {
  if (minutes === 0) return '0';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr${h !== 1 ? 's' : ''}`;
  return `${h}.${Math.round((m / 60) * 10)} hrs`;
}

export function isDueToday(assignment: Assignment) {
  if (assignment.dueDate.toLowerCase().includes('today')) return true;
  if (!assignment.dueAt) return false;
  return sameDate(parseLocalDate(assignment.dueAt), new Date());
}

export function isDueTomorrow(assignment: Assignment) {
  if (assignment.dueDate.toLowerCase().includes('tomorrow')) return true;
  if (!assignment.dueAt) return false;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return sameDate(parseLocalDate(assignment.dueAt), tomorrow);
}
