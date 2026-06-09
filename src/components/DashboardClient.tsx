'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AssignmentList } from '@/components/AssignmentList';
import { CalendarSnapshot } from '@/components/CalendarSnapshot';
import { GmailSummary } from '@/components/GmailSummary';
import { PriorityPanel } from '@/components/PriorityPanel';
import { QuickLinkCard } from '@/components/QuickLinkCard';
import {
  mockAssignments,
  mockEmails,
  mockEvents,
  mockPriorityItems,
  quickLinks,
  setupStatusItems,
} from '@/data/mockData';
import type { DashboardPayload } from '@/lib/google';
import type { Assignment, CalendarEvent, PriorityItem } from '@/types';

const initialDashboard: DashboardPayload = {
  source: 'mock',
  connected: false,
  configured: false,
  emails: mockEmails,
  events: mockEvents,
  setupStatus: setupStatusItems,
};

export function DashboardClient({ today }: { today: string }) {
  const [dashboard, setDashboard] = useState<DashboardPayload>(initialDashboard);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const loadDashboard = useCallback(async ({ quiet = false }: { quiet?: boolean } = {}) => {
    if (!quiet) setIsRefreshing(true);

    try {
      const response = await fetch(`/api/dashboard?refresh=${Date.now()}`, { cache: 'no-store' });
      const payload = (await response.json()) as DashboardPayload;
      setDashboard(payload);
      setLastUpdated(formatRefreshTime(new Date()));
    } catch {
      setDashboard(initialDashboard);
      setLastUpdated(formatRefreshTime(new Date()));
    } finally {
      setHasLoaded(true);
      if (!quiet) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (window.location.hostname === '127.0.0.1') {
      window.location.replace(`http://localhost:3000${window.location.pathname}${window.location.search}`);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
    const refreshTimer = window.setInterval(() => {
      loadDashboard({ quiet: true });
    }, 1000 * 60 * 5);

    return () => {
      window.clearInterval(refreshTimer);
    };
  }, [loadDashboard]);

  const priorityItems = useMemo(() => {
    if (dashboard.source === 'mock') return mockPriorityItems;

    const urgentEmails = dashboard.emails
      .filter((email) => (email.important || email.unread) && !email.from.toLowerCase().includes('calendar-notification'))
      .slice(0, 2)
      .map((email) => ({
        id: `email-${email.id}`,
        title: shortText(email.subject, 82),
        detail: shortText(`${email.from} · ${email.snippet}`, 150),
        level: email.important ? ('high' as const) : ('medium' as const),
        source: 'Gmail',
      }));

    const todayEvents = dashboard.events
      .filter((event) => event.dayLabel === 'Today' && ['Basketball', 'Canvas'].includes(event.source))
      .slice(0, 2)
      .map((event) => ({
        id: `event-${event.id}`,
        title: event.title,
        detail: `${event.source} event today${event.location ? ` · ${event.location}` : ''}.`,
        level: event.source === 'Basketball' ? ('high' as const) : ('medium' as const),
        source: event.source,
      }));

    return [...todayEvents, ...urgentEmails].slice(0, 5);
  }, [dashboard]);

  const todayEvents = useMemo(() => {
    const events = dashboard.events.filter((event) => event.dayLabel === 'Today');
    return (events.length ? events : dashboard.events).slice(0, 6);
  }, [dashboard.events]);

  const dueDates = useMemo(() => {
    if (dashboard.source === 'live') {
      return dashboard.events
        .filter((event) => event.source === 'Canvas')
        .map(eventToAssignment)
        .sort((a, b) => getAssignmentOrder(a) - getAssignmentOrder(b))
        .slice(0, 6);
    }

    const order: Record<Assignment['status'], number> = {
      Overdue: 0,
      'Due Soon': 1,
      Upcoming: 2,
      Done: 3,
    };

    return [...mockAssignments].sort((a, b) => order[a.status] - order[b.status]).slice(0, 4);
  }, [dashboard.events, dashboard.source]);

  const restOfWeekAssignments = useMemo(() => {
    if (dashboard.source === 'live') {
      return dashboard.events
        .filter((event) => event.source === 'Canvas' && event.dayLabel !== 'Today')
        .map(eventToAssignment)
        .sort((a, b) => getAssignmentOrder(a) - getAssignmentOrder(b))
        .slice(0, 8);
    }

    return dueDates.filter((assignment) => assignment.status !== 'Overdue').slice(0, 6);
  }, [dashboard.events, dashboard.source, dueDates]);

  return (
    <main className="min-h-screen bg-[#f7f3ee] bg-[linear-gradient(135deg,rgba(206,17,38,0.08),transparent_34%),linear-gradient(180deg,#fffdf9_0%,#f7f3ee_100%)] px-4 py-5 text-ink sm:px-6 lg:px-8">
      <header className="mx-auto mb-5 flex max-w-[1500px] flex-col gap-5 rounded-lg border border-stone-200 bg-paper/90 p-5 shadow-soft sm:p-7 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
          <div className="grid size-24 shrink-0 place-items-center rounded-lg border border-redbird-500/20 bg-white p-3 shadow-sm sm:size-28">
            <img
              src="/illinois-state-redbirds-emblem.png"
              alt="Illinois State Redbirds"
              className="max-h-full max-w-full object-contain"
            />
          </div>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-redbird-600">
              Illinois State Women&apos;s Basketball
            </p>
            <h1 className="mt-1 text-4xl font-black leading-none text-ink sm:text-5xl">Good morning, Hayley</h1>
            <p className="mt-3 text-base text-stone-600">Here&apos;s what needs your attention today.</p>
          </div>
        </div>
        <div className="rounded-lg border border-stone-200 bg-white px-5 py-4 lg:min-w-72" aria-label={`Today is ${today}`}>
          <span className="text-xs font-bold uppercase tracking-wide text-stone-500">Current date</span>
          <strong className="mt-1 block text-lg text-ink">{today}</strong>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {dashboard.connected ? (
              <button
                className="rounded-lg bg-redbird-500 px-4 py-2 text-sm font-black text-white transition hover:bg-redbird-600 disabled:cursor-wait disabled:bg-stone-300"
                disabled={isRefreshing}
                onClick={() => loadDashboard()}
                type="button"
              >
                {isRefreshing ? 'Refreshing...' : 'Refresh now'}
              </button>
            ) : (
              <a
                className="rounded-lg bg-redbird-500 px-4 py-2 text-sm font-black text-white transition hover:bg-redbird-600"
                href="/api/auth/google/start"
              >
                Connect Gmail + Calendar
              </a>
            )}
            <span className="text-xs font-bold uppercase tracking-wide text-stone-500">
              {dashboard.connected
                ? lastUpdated
                  ? `Checked ${lastUpdated}`
                  : 'Auto-refreshes every 5 min'
                : dashboard.configured
                  ? 'One Google sign-in connects both'
                  : hasLoaded
                    ? 'Google setup needed'
                    : 'Checking Google setup'}
            </span>
          </div>
        </div>
      </header>

      <MorningOverview
        events={todayEvents}
        assignments={dueDates}
        priorities={priorityItems.slice(0, 3)}
        isLive={dashboard.source === 'live'}
        isRefreshing={isRefreshing}
        lastUpdated={lastUpdated}
        onRefresh={() => loadDashboard()}
      />

      {dashboard.error ? (
        <p className="mx-auto mb-5 max-w-[1500px] rounded-lg border border-stone-200 bg-white/90 p-4 text-sm font-semibold text-stone-600 shadow-soft">
          Some live data could not load, so this view is using fallback data for now.
        </p>
      ) : null}

      <div className="mx-auto grid max-w-[1500px] gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="grid content-start gap-5">
          <CalendarSnapshot events={dashboard.events} isLive={dashboard.source === 'live'} />
          <AssignmentList assignments={restOfWeekAssignments} isLive={dashboard.source === 'live'} />
        </div>

        <div className="grid content-start gap-5">
          <PriorityPanel items={priorityItems} />
          <GmailSummary emails={dashboard.emails} isLive={dashboard.source === 'live'} />
          <section aria-labelledby="quick-launch-title" className="rounded-lg border border-stone-200 bg-paper/95 p-5 shadow-soft">
            <p className="text-xs font-extrabold uppercase tracking-wider text-redbird-600">Fast access</p>
            <h2 id="quick-launch-title" className="mt-1 text-lg font-black text-ink">
              Open what you need
            </h2>
            <div className="mt-4 grid gap-3">
              {quickLinks.map((link) => (
                <QuickLinkCard key={link.title} link={link} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function MorningOverview({
  events,
  assignments,
  priorities,
  isLive,
  isRefreshing,
  lastUpdated,
  onRefresh,
}: {
  events: CalendarEvent[];
  assignments: Assignment[];
  priorities: PriorityItem[];
  isLive: boolean;
  isRefreshing: boolean;
  lastUpdated: string | null;
  onRefresh: () => void;
}) {
  return (
    <section className="mx-auto mb-5 grid max-w-[1500px] gap-5 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft sm:p-6">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-redbird-600">
              {isLive ? 'Live from Google Calendar' : 'Today first'}
            </p>
            <h2 className="mt-1 text-2xl font-black leading-tight text-ink">What you have today</h2>
          </div>
          <span className="w-fit rounded-full bg-redbird-50 px-3 py-1 text-xs font-black text-redbird-700">
            Morning scan
          </span>
        </div>

        <div className="grid gap-3">
          {events.length ? (
            events.map((event) => (
              <article
                className="grid gap-3 rounded-lg border border-stone-200 bg-[#fffaf7] p-4 sm:grid-cols-[96px_minmax(0,1fr)_auto] sm:items-center"
                key={event.id}
              >
                <time className="text-sm font-black text-redbird-600">
                  {formatTime(event.start)}
                </time>
                <div>
                  <h3 className="text-base font-black text-ink">{event.title}</h3>
                  <p className="mt-1 text-sm text-stone-600">{event.location ?? 'No location listed'}</p>
                </div>
                <span className={`h-fit w-fit rounded-full px-2.5 py-1 text-xs font-bold ${sourceClass[event.source]}`}>
                  {event.source}
                </span>
              </article>
            ))
          ) : (
            <EmptySourceMessage message="No events found for you today in Google Calendar." />
          )}
        </div>
      </div>

      <div className="grid gap-5">
        <div className="rounded-lg border border-stone-200 bg-paper/95 p-5 shadow-soft">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-redbird-600">
                {isLive ? 'Updated from Canvas calendar' : 'Canvas calendar preview'}
              </p>
              <h2 className="mt-1 text-xl font-black text-ink">What&apos;s due next</h2>
              <p className="mt-1 text-sm leading-snug text-stone-600">
                Refresh anytime to pull the newest Calendar and Gmail info.
              </p>
            </div>
            <button
              className="w-fit rounded-lg bg-redbird-500 px-4 py-2 text-sm font-black text-white transition hover:bg-redbird-600 disabled:cursor-wait disabled:bg-stone-300"
              disabled={isRefreshing}
              onClick={onRefresh}
              type="button"
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          {lastUpdated ? (
            <p className="mt-3 text-xs font-bold uppercase tracking-wide text-stone-500">
              Last checked {lastUpdated}
            </p>
          ) : null}
          <div className="mt-4 grid gap-3">
            {assignments.length ? (
              assignments.map((assignment) => (
                <article className="rounded-lg border border-stone-200 bg-white p-4" key={assignment.id}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="text-sm font-black text-ink">{assignment.title}</h3>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${assignmentStatusClass[assignment.status]}`}>
                      {assignment.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-stone-600">
                    {assignment.course} · {assignment.dueDate}
                  </p>
                </article>
              ))
            ) : (
              <EmptySourceMessage message="No Canvas due dates found for you in Google Calendar." />
            )}
          </div>
        </div>

        <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <p className="text-xs font-extrabold uppercase tracking-wider text-redbird-600">Only the top priorities</p>
          <h2 className="mt-1 text-xl font-black text-ink">Do these first</h2>
          <div className="mt-4 grid gap-3">
            {priorities.length ? (
              priorities.map((item) => (
                <article className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-lg border border-stone-200 bg-redbird-50/50 p-4" key={item.id}>
                  <span className={`mt-1 size-3 rounded-full ${priorityDotClass[item.level]}`} aria-hidden="true" />
                  <div>
                    <h3 className="text-sm font-black leading-snug text-ink">{shortText(item.title, 82)}</h3>
                    <p className="mt-1 text-sm leading-snug text-stone-600">{shortText(item.detail, 140)}</p>
                  </div>
                </article>
              ))
            ) : (
              <EmptySourceMessage message="No urgent Gmail or Basketball/Canvas items found for you today." />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function EmptySourceMessage({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-stone-300 bg-white p-4 text-sm font-semibold text-stone-600">
      {message}
    </div>
  );
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatRefreshTime(value: Date) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(value);
}

function shortText(value: string, maxLength: number) {
  const cleaned = value.replace(/\s+/g, ' ').trim();
  return cleaned.length > maxLength ? `${cleaned.slice(0, maxLength - 1)}...` : cleaned;
}

function eventToAssignment(event: CalendarEvent): Assignment {
  return {
    id: `calendar-assignment-${event.id}`,
    title: event.title,
    course: getCourseName(event.title, event.location),
    dueDate: formatDueDate(event.start),
    status: getAssignmentStatus(event.start),
    canvasUrl: 'https://canvas.illinoisstate.edu/courses',
  };
}

function getCourseName(title: string, location?: string) {
  const courseMatch = title.match(/\[([^\]]+)\]/);
  if (courseMatch?.[1]) return courseMatch[1];
  return location?.includes('Canvas') ? location : 'Canvas calendar';
}

function formatDueDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

function getAssignmentStatus(value: string): Assignment['status'] {
  const now = Date.now();
  const due = new Date(value).getTime();
  if (due < now) return 'Overdue';
  if (due - now <= 1000 * 60 * 60 * 48) return 'Due Soon';
  return 'Upcoming';
}

function getAssignmentOrder(assignment: Assignment) {
  const statusOrder: Record<Assignment['status'], number> = {
    Overdue: 0,
    'Due Soon': 1,
    Upcoming: 2,
    Done: 3,
  };

  return statusOrder[assignment.status];
}

const sourceClass: Record<CalendarEvent['source'], string> = {
  Teamworks: 'bg-redbird-50 text-redbird-700',
  Canvas: 'bg-blue-50 text-blue-700',
  Basketball: 'bg-emerald-50 text-emerald-700',
  Personal: 'bg-amber-50 text-amber-700',
};

const assignmentStatusClass: Record<Assignment['status'], string> = {
  'Due Soon': 'bg-redbird-500 text-white',
  Upcoming: 'bg-blue-50 text-blue-700',
  Overdue: 'bg-stone-900 text-white',
  Done: 'bg-emerald-50 text-emerald-700',
};

const priorityDotClass: Record<PriorityItem['level'], string> = {
  high: 'bg-redbird-500',
  medium: 'bg-amber-500',
  low: 'bg-emerald-500',
};
