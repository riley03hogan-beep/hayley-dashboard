'use client';

import type { ReactNode } from 'react';
import type { Assignment, CalendarEvent, EmailMessage, WaitingItem } from '@/types';
import { useDoneItems } from '@/context/DoneItemsContext';

export const LINKS = {
  canvas: 'https://canvas.illinoisstate.edu/courses',
  teamworks: 'https://www.teamworksapp.com/home/overview',
  googleCalendar: 'https://calendar.google.com/calendar/u/0/r/week',
  gmail: 'https://mail.google.com/mail/u/0/?tab=rm&ogbl#inbox',
  outlook: 'https://outlook.cloud.microsoft/mail/inbox/id/AAQkADIyMWVjZTQ2LWI3Y2YtNGE3OC04ZmYzLWVhN2I1MjFmMTU0MAAQABuHs%2BlVw81Hr0sONTTU%2BYs%3D?culture=en-us&country=us',
} as const;

export interface RankedPriority {
  id: string;
  title: string;
  detail: string;
  score: number;
  source: 'Student' | 'Coach' | 'Inbox';
  href: string;
  doneKey: string; // shared key with the source item for cross-off sync
}

interface GamePlanProps {
  assignments: Assignment[];
  connected: boolean;
  configured: boolean;
  emails: EmailMessage[];
  events: CalendarEvent[];
  hasLoaded: boolean;
  isLive: boolean;
  isRefreshing: boolean;
  lastUpdated: string | null;
  onRefresh: () => void;
  priorities: RankedPriority[];
  today: string;
  todayWorkloadMinutes: number;
  weekWorkloadMinutes: number;
}

export function TodaysGamePlan({
  assignments,
  connected,
  configured,
  emails,
  events,
  hasLoaded,
  isLive,
  isRefreshing,
  lastUpdated,
  onRefresh,
  priorities,
  today,
  todayWorkloadMinutes,
}: GamePlanProps) {
  // Exclude Canvas events (assignment deadlines) from the schedule — they show in Get Done Today
  const todayEvents = [...events.filter((event) => event.dayLabel === 'Today' && event.source !== 'Canvas')].sort(byStartTime);
  const actionEmails = getActionEmails(emails);
  const unreadCount = emails.filter((email) => email.unread).length;
  const dueTodayCount = assignments.filter(
    (assignment) => assignment.status !== 'Done' && isDueToday(assignment),
  ).length;

  return (
    <section className="mx-auto mb-3 max-w-[1500px] overflow-hidden rounded-xl border border-redbird-500/20 bg-white shadow-soft sm:mb-5">
      {/* Slim header strip */}
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

      {/* Two-column hero */}
      <div className="grid divide-y divide-stone-100 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
        {/* LEFT: GET DONE TODAY */}
        <div className="p-4 sm:p-6 lg:p-8">
          <p className="mb-3 text-xs font-extrabold uppercase tracking-widest text-stone-400 sm:mb-4">
            Get done today
          </p>
          <div className="grid gap-2 sm:gap-3">
            {priorities.length ? (
              priorities.map((item) => <HeroPriorityCard item={item} key={item.id} />)
            ) : (
              <p className="text-sm font-semibold text-stone-500">
                No urgent items right now. You&apos;re ahead of the curve.
              </p>
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-2 sm:mt-6 sm:gap-3">
            <QuickStat
              accent
              label={todayWorkloadMinutes === 0 ? 'no work today' : 'time required today'}
              value={formatDuration(todayWorkloadMinutes)}
            />
            <QuickStat
              label={dueTodayCount === 1 ? 'deadline today' : 'deadlines today'}
              value={String(dueTodayCount)}
            />
          </div>
        </div>

        {/* RIGHT: TODAY'S SCHEDULE */}
        <div className="p-4 sm:p-6 lg:p-8">
          <p className="mb-3 text-xs font-extrabold uppercase tracking-widest text-stone-400 sm:mb-4">
            Today&apos;s schedule
          </p>
          {todayEvents.length ? (
            <div className="grid gap-2 sm:gap-3">
              {todayEvents.slice(0, 5).map((event) => (
                <HeroEventRow event={event} key={event.id} />
              ))}
            </div>
          ) : (
            <p className="text-sm font-semibold text-stone-500">No calendar events today.</p>
          )}
          <div className="mt-4 flex flex-wrap gap-2 sm:mt-6 sm:gap-3">
            <QuickStat
              label={unreadCount === 1 ? 'unread email' : 'unread emails'}
              value={String(unreadCount)}
            />
            <QuickStat label="need action" value={String(actionEmails.length)} />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroPriorityCard({ item }: { item: RankedPriority }) {
  const { doneIds, toggleDone } = useDoneItems();
  const isDone = doneIds.has(item.doneKey);

  const isOverdue = item.score >= 100;
  const isTodayDue = item.score >= 90;
  const isBasketball = item.source === 'Coach';

  const cardClass = isOverdue
    ? 'border-l-4 border-l-red-500 bg-red-50'
    : isTodayDue
      ? 'border-l-4 border-l-amber-500 bg-amber-50'
      : isBasketball
        ? 'border-l-4 border-l-emerald-500 bg-emerald-50'
        : 'border-l-4 border-l-stone-300 bg-stone-50';

  const badge = isOverdue
    ? 'OVERDUE'
    : isTodayDue
      ? 'DUE TODAY'
      : isBasketball
        ? 'BASKETBALL'
        : null;

  const badgeClass = isOverdue
    ? 'bg-red-500 text-white'
    : isTodayDue
      ? 'bg-amber-500 text-white'
      : 'bg-emerald-500 text-white';

  return (
    <div className={`flex items-start gap-3 rounded-lg p-4 transition-opacity ${cardClass} ${isDone ? 'opacity-50' : ''}`}>
      <button
        aria-label={isDone ? 'Mark incomplete' : 'Mark complete'}
        className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          isDone
            ? 'border-stone-400 bg-stone-400'
            : 'border-stone-400 bg-transparent hover:border-stone-600'
        }`}
        onClick={() => toggleDone(item.doneKey)}
        type="button"
      >
        {isDone && (
          <svg className="size-3 text-white" fill="none" viewBox="0 0 12 12">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
        )}
      </button>
      <a
        className="min-w-0 flex-1 hover:opacity-80"
        href={item.href}
        rel="noopener noreferrer"
        target="_blank"
      >
        <div className="flex items-start justify-between gap-2">
          <h3 className={`text-base font-black leading-tight text-ink sm:text-xl ${isDone ? 'line-through' : ''}`}>
            {item.title}
          </h3>
          {badge && (
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black sm:px-2.5 sm:py-1 sm:text-xs ${badgeClass}`}>
              {badge}
            </span>
          )}
        </div>
        <p className={`mt-1 text-xs font-semibold text-stone-600 sm:mt-1.5 sm:text-sm ${isDone ? 'line-through' : ''}`}>
          {item.detail}
        </p>
      </a>
    </div>
  );
}

function cleanEventTitle(title: string): string {
  return title.replace(/\[[^\]]+\]/g, '').replace(/\s+/g, ' ').trim() || title;
}

// Extract display name from "Name <email>" or "LAST, FIRST <email>" format
function cleanFrom(from: string): string {
  const match = from.match(/^["']?([^"'<]+)["']?\s*(?:<[^>]*>)?$/);
  return match ? match[1].trim() : from;
}

// Decode HTML entities, strip forwarding headers, collapse whitespace
function cleanSnippet(snippet: string): string {
  // Decode HTML entities
  const decoded = snippet
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
  // Strip forwarding header blocks from the start ("From: ... Sent: ... To: ... Subject:")
  let clean = decoded
    .replace(/^(?:(?:From|To|Sent|Date|Subject|CC|BCC):\s*[^\n]*\s*)+/gi, '')
    .replace(/\s*Subject\s*$/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!clean) return '';
  if (clean.length > 130) clean = `${clean.slice(0, 129)}…`;
  return clean;
}

// Strip Re:/Fw:/Notification: prefixes, course brackets, and Google Calendar suffixes
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

function HeroEventRow({ event }: { event: CalendarEvent }) {
  const isBasketball = event.source === 'Basketball' || event.source === 'Teamworks';
  const href = isBasketball ? LINKS.teamworks : event.source === 'Canvas' ? LINKS.canvas : LINKS.googleCalendar;
  return (
    <a
      className="flex items-center gap-2 rounded-lg border border-stone-100 bg-stone-50 px-3 py-2.5 transition-colors hover:bg-stone-100 sm:gap-4 sm:px-4 sm:py-3"
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      <time className="w-14 shrink-0 text-sm font-black text-redbird-600 sm:w-20 sm:text-lg">{formatTime(event.start)}</time>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-black text-ink sm:text-base">{cleanEventTitle(event.title)}</h3>
        {event.location && (
          <p className="mt-0.5 truncate text-xs text-stone-500 sm:text-sm">{event.location}</p>
        )}
      </div>
      {isBasketball && (
        <span className="ml-auto shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-700 sm:px-2.5 sm:py-1 sm:text-xs">
          Basketball
        </span>
      )}
    </a>
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

export function TopPriorities({ priorities }: { priorities: RankedPriority[] }) {
  return (
    <DashboardCard eyebrow="Priority engine" title="Top 3 Priorities">
      <div className="grid gap-3">
        {priorities.slice(0, 3).map((item, index) => (
          <article
            className="grid grid-cols-[44px_minmax(0,1fr)_auto] items-start gap-3 rounded-lg border border-stone-200 bg-white p-4"
            key={item.id}
          >
            <span className="grid size-11 place-items-center rounded-lg bg-redbird-500 text-lg font-black text-white">
              {index + 1}
            </span>
            <div>
              <h3 className="text-base font-black text-ink">{item.title}</h3>
              <p className="mt-1 text-sm leading-snug text-stone-600">{item.detail}</p>
            </div>
            <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-black text-stone-600">
              {item.score}
            </span>
          </article>
        ))}
      </div>
    </DashboardCard>
  );
}

export function TodaysTimeline({ events }: { events: CalendarEvent[] }) {
  return (
    <DashboardCard eyebrow="Calendar" title="Today&apos;s Timeline">
      <CompactEventList
        emptyMessage="No events on your calendar today."
        events={events.filter((event) => event.dayLabel === 'Today')}
      />
    </DashboardCard>
  );
}

export function ResponsibilitySections({
  assignments,
  events,
}: {
  assignments: Assignment[];
  events: CalendarEvent[];
}) {
  const coachEvents = events.filter(
    (event) => event.source === 'Basketball' || event.source === 'Teamworks',
  );

  return (
    <>
      <DashboardCard eyebrow="Student" title="Class work and Canvas">
        <div className="grid gap-3">
          {[...assignments]
            .sort((a, b) => {
              const aTime = a.dueAt ? parseLocalDate(a.dueAt).getTime() : Infinity;
              const bTime = b.dueAt ? parseLocalDate(b.dueAt).getTime() : Infinity;
              return aTime - bTime;
            })
            .slice(0, 5)
            .map((assignment) => (
              <AssignmentRow assignment={assignment} key={assignment.id} />
            ))}
        </div>
      </DashboardCard>
      <DashboardCard eyebrow="Coach" title="Basketball responsibilities">
        <div className="grid gap-3">
          {coachEvents.slice(0, 5).map((event) => (
            <EventRow event={event} key={event.id} />
          ))}
        </div>
      </DashboardCard>
    </>
  );
}

export function TomorrowPrep({
  assignments,
  events,
}: {
  assignments: Assignment[];
  events: CalendarEvent[];
}) {
  const tomorrowEvents = events.filter((event) => event.dayLabel === 'Tomorrow');
  const tomorrowDeadlines = assignments.filter(
    (assignment) => assignment.status !== 'Done' && isDueTomorrow(assignment),
  );
  const firstEvent = [...tomorrowEvents].sort(byStartTime)[0];
  const prepItems = buildPrepItems(firstEvent, tomorrowDeadlines);

  return (
    <DashboardCard eyebrow="Tomorrow Prep" title="Plan tonight, think less tomorrow">
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-stone-500">First event</p>
          <p className="mt-1 text-base font-black text-ink">
            {firstEvent ? cleanEventTitle(firstEvent.title) : 'Nothing scheduled'}
          </p>
          <p className="mt-1 text-sm text-stone-600">
            {firstEvent ? formatTime(firstEvent.start) : 'No calendar item found'}
          </p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-stone-500">Deadlines</p>
          <p className="mt-1 text-base font-black text-ink">{tomorrowDeadlines.length}</p>
          <p className="mt-1 text-sm text-stone-600">
            {tomorrowDeadlines.map((item) => item.title).join(', ') ||
              'No Canvas deadlines tomorrow'}
          </p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-stone-500">
            Recommended prep
          </p>
          <ul className="mt-2 grid gap-1.5 text-sm font-semibold text-stone-700">
            {prepItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </DashboardCard>
  );
}

export function InboxRequiringAction({ emails }: { emails: EmailMessage[] }) {
  const actionEmails = getActionEmails(emails);

  return (
    <DashboardCard eyebrow="Inbox" title="Requiring Action">
      <div className="mb-4 grid grid-cols-2 gap-3">
        <Metric
          label="Unread"
          value={String(emails.filter((email) => email.unread).length)}
          helper="main inbox"
        />
        <Metric
          label="Action"
          value={String(actionEmails.length)}
          helper="reply, file, or decide"
        />
      </div>
      <div className="grid gap-3">
        {actionEmails.slice(0, 4).map((email) => (
          <EmailRow email={email} key={email.id} />
        ))}
        {!actionEmails.length ? (
          <EmptyState message="No inbox items need action right now." />
        ) : null}
      </div>
    </DashboardCard>
  );
}

export function UpcomingThisWeek({
  assignments,
  events,
  weekWorkloadMinutes,
}: {
  assignments: Assignment[];
  events: CalendarEvent[];
  weekWorkloadMinutes: number;
}) {
  // Exclude Canvas calendar events — assignments already show the deadlines
  const tomorrowEvents = events.filter((event) => event.dayLabel === 'Tomorrow' && event.source !== 'Canvas');
  const tomorrowAssignments = assignments.filter(
    (assignment) => assignment.status !== 'Done' && isDueTomorrow(assignment),
  );

  // Merge tomorrow events and assignments, sorted chronologically
  // Canvas deadlines often use midnight timestamps — push them to end of day for sorting
  const tomorrowItems = [
    ...tomorrowEvents.map((e) => ({ id: `event-${e.id}`, time: new Date(e.start).getTime(), type: 'event' as const, data: e })),
    ...tomorrowAssignments.map((a) => ({ id: `assignment-${a.id}`, time: sortableAssignmentTime(a), type: 'assignment' as const, data: a })),
  ].sort((a, b) => a.time - b.time);

  return (
    <DashboardCard eyebrow="This week" title="Tomorrow">
      <div className="mb-4 rounded-lg bg-stone-50 p-3">
        <p className="text-xs font-bold uppercase tracking-wide text-stone-500">
          Total workload remaining this week
        </p>
        <p className="mt-1 text-2xl font-black text-ink">{formatDuration(weekWorkloadMinutes)}</p>
      </div>
      <div className="grid gap-2 sm:gap-3">
        {tomorrowItems.length ? (
          tomorrowItems.map((item) =>
            item.type === 'event' ? (
              <EventRow event={item.data as CalendarEvent} key={item.id} />
            ) : (
              <AssignmentRow assignment={item.data as Assignment} key={item.id} />
            ),
          )
        ) : (
          <EmptyState message="Nothing due or scheduled tomorrow." />
        )}
      </div>
    </DashboardCard>
  );
}

export function UpcomingAfterTomorrow({
  assignments,
  events,
}: {
  assignments: Assignment[];
  events: CalendarEvent[];
}) {
  // Exclude Canvas events — assignments already represent those deadlines
  const futureEvents = events.filter((event) => event.dayLabel === 'Next 7 days' && event.source !== 'Canvas');
  const futureAssignments = assignments.filter(
    (assignment) =>
      assignment.status !== 'Done' && !isDueToday(assignment) && !isDueTomorrow(assignment),
  );

  // Merge and sort all future items chronologically
  const futureItems = [
    ...futureEvents.map((e) => ({ id: `event-${e.id}`, time: new Date(e.start).getTime(), type: 'event' as const, data: e })),
    ...futureAssignments.map((a) => ({ id: `assignment-${a.id}`, time: sortableAssignmentTime(a), type: 'assignment' as const, data: a })),
  ].sort((a, b) => a.time - b.time);

  // Group by calendar day
  const grouped = new Map<string, { dayDate: Date; items: typeof futureItems }>();
  for (const item of futureItems) {
    const date = new Date(item.time === Infinity ? Date.now() : item.time);
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    if (!grouped.has(key)) grouped.set(key, { dayDate: date, items: [] });
    grouped.get(key)!.items.push(item);
  }
  const groupedDays = [...grouped.values()].sort((a, b) => a.dayDate.getTime() - b.dayDate.getTime());

  return (
    <DashboardCard eyebrow="Rest of week" title="Coming Up">
      {groupedDays.length ? (
        <div className="grid gap-5">
          {groupedDays.map(({ dayDate, items }) => (
            <div key={dayDate.toDateString()}>
              <p className="mb-2 text-xs font-extrabold uppercase tracking-wider text-redbird-600">
                {new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).format(dayDate)}
              </p>
              <div className="grid gap-2 sm:gap-3">
                {items.map((item) =>
                  item.type === 'event' ? (
                    <EventRow event={item.data as CalendarEvent} key={item.id} />
                  ) : (
                    <AssignmentRow assignment={item.data as Assignment} key={item.id} />
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

function CompactEventList({
  emptyMessage,
  events,
}: {
  emptyMessage: string;
  events: CalendarEvent[];
}) {
  const sorted = [...events].sort(byStartTime);
  if (!sorted.length) return <EmptyState message={emptyMessage} />;

  return (
    <div className="grid gap-2">
      {sorted.slice(0, 6).map((event) => (
        <EventRow event={event} key={event.id} compact />
      ))}
    </div>
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
    <div className={`flex items-start gap-3 rounded-lg border border-stone-200 bg-white transition-colors ${compact ? 'p-3' : 'p-3 sm:p-4'} ${isDone ? 'opacity-50' : ''}`}>
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
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
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

function isAllDayEvent(start: string): boolean {
  // Date-only strings from Google Calendar are all-day events
  return /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(start);
}

// Canvas deadlines often have midnight timestamps — sort them at 11:59 PM so they appear after timed events
// Canvas deadlines come as date-only strings -- parseLocalDate sets them to 11:59 PM
function sortableAssignmentTime(a: Assignment): number {
  if (!a.dueAt) return Infinity;
  return parseLocalDate(a.dueAt).getTime();
}

function EventRow({ event, compact = false }: { event: CalendarEvent; compact?: boolean }) {
  const isBasketball = event.source === 'Basketball' || event.source === 'Teamworks';
  const href = isBasketball ? LINKS.teamworks : event.source === 'Canvas' ? LINKS.canvas : LINKS.googleCalendar;
  const timeLabel = isAllDayEvent(event.start) ? 'All day' : formatTime(event.start);
  return (
    <a
      className={`grid gap-2 rounded-lg border border-stone-200 bg-white transition-colors hover:bg-stone-50 ${compact ? 'p-3' : 'p-3 sm:p-4'} sm:grid-cols-[84px_minmax(0,1fr)_auto] sm:items-center`}
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      <time className="text-sm font-black text-redbird-600">{timeLabel}</time>
      <div>
        <h3 className="text-sm font-black text-ink">{cleanEventTitle(event.title)}</h3>
        <p className="mt-0.5 text-sm text-stone-600">{event.location ?? 'No location listed'}</p>
      </div>
      <span
        className={`h-fit w-fit rounded-full px-2.5 py-1 text-xs font-black ${sourceClass[event.source]}`}
      >
        {event.source}
      </span>
    </a>
  );
}

// Forwarded school emails (Illinois State / Canvas) → Outlook inbox
// Everything else → Gmail
function getEmailLink(email: EmailMessage): string {
  const isForwardedSchoolEmail =
    ['Assignments', 'Canvas', 'Illinois State'].includes(email.category) ||
    email.from.toLowerCase().includes('instructor') ||
    email.from.toLowerCase().includes('professor') ||
    email.from.toLowerCase().includes('illinois state') ||
    email.from.toLowerCase().includes('canvas');
  return isForwardedSchoolEmail ? LINKS.outlook : LINKS.gmail;
}

function EmailRow({ compact = false, email }: { compact?: boolean; email: EmailMessage }) {
  return (
    <a
      className={`block rounded-lg border border-stone-200 bg-white transition-colors hover:bg-stone-50 ${compact ? 'p-3' : 'p-3 sm:p-4'}`}
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
      </div>
      <h3 className="mt-1 text-sm font-black text-ink">{cleanSubject(email.subject)}</h3>
      {!compact && cleanSnippet(email.snippet) ? (
        <p className="mt-1 text-sm leading-snug text-stone-600">{cleanSnippet(email.snippet)}</p>
      ) : null}
    </a>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-stone-300 bg-white p-4 text-sm font-semibold text-stone-600">
      {message}
    </div>
  );
}

function buildPrepItems(firstEvent: CalendarEvent | undefined, deadlines: Assignment[]) {
  const items = new Set<string>();
  if (firstEvent?.source === 'Basketball' || firstEvent?.source === 'Teamworks')
    items.add('Pack basketball gear');
  if (firstEvent?.title.toLowerCase().includes('nutrition'))
    items.add('Review nutrition talk notes');
  if (deadlines.some((assignment) => assignment.title.toLowerCase().includes('discussion')))
    items.add('Complete discussion replies');
  if (deadlines.length) items.add('Open Canvas before bed');
  if (!items.size) items.add('Check calendar before bed');
  return Array.from(items).slice(0, 4);
}

function getActionEmails(emails: EmailMessage[]) {
  return emails
    .filter((email) => email.unread || email.important || email.category === 'Urgent')
    .slice(0, 6);
}

// Canvas all-day events come as date-only strings (e.g. "2026-06-11").
// JS parses these as UTC midnight, shifting the date to the previous day in CDT.
// Parse as local 11:59 PM so date comparisons are always correct.
function parseLocalDate(value: string): Date {
  if (/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(value)) {
    const parts = value.split('-').map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2], 23, 59, 0);
  }
  return new Date(value);
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

function sameDate(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function byStartTime(a: CalendarEvent, b: CalendarEvent) {
  return new Date(a.start).getTime() - new Date(b.start).getTime();
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

export function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const hours = minutes / 60;
  return `${Number.isInteger(hours) ? hours.toFixed(0) : hours.toFixed(1)} hrs`;
}

const sourceClass: Record<CalendarEvent['source'], string> = {
  Teamworks: 'bg-redbird-50 text-redbird-700',
  Canvas: 'bg-blue-50 text-blue-700',
  Basketball: 'bg-emerald-50 text-emerald-700',
  Personal: 'bg-amber-50 text-amber-700',
};

const statusClass: Record<Assignment['status'], string> = {
  'Due Soon': 'bg-redbird-500 text-white',
  Upcoming: 'bg-blue-50 text-blue-700',
  Overdue: 'bg-stone-900 text-white',
  Done: 'bg-emerald-50 text-emerald-700',
};
