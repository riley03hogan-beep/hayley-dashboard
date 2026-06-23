'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CalendarView,
  InboxRequiringAction,
  isDueToday,
  isDueTomorrow,
  LINKS,
  ThisWeekView,
  TodaysGamePlan,
  TodayView,
} from '@/components/MorningDashboard';
import { DoneItemsProvider } from '@/context/DoneItemsContext';
import { mockAssignments, mockEmails, mockEvents, setupStatusItems } from '@/data/mockData';
import type { DashboardPayload } from '@/lib/google';
import type { Assignment, CalendarEvent, EmailMessage } from '@/types';

const initialDashboard: DashboardPayload = {
  source: 'mock',
  connected: false,
  configured: false,
  emails: mockEmails,
  events: mockEvents,
  setupStatus: setupStatusItems,
};

function formatLocalDate() {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());
}

export function DashboardClient({ today: _today }: { today: string }) {
  // Always use client-side date so it reflects the user's local timezone, not the server's UTC
  const [today, setToday] = useState('');
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

  // Set date client-side and schedule a refresh at midnight so it stays correct
  useEffect(() => {
    setToday(formatLocalDate());
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
    const msUntilMidnight = midnight.getTime() - now.getTime();
    const timer = setTimeout(() => setToday(formatLocalDate()), msUntilMidnight);
    return () => clearTimeout(timer);
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

  const assignments = useMemo(() => {
    if (dashboard.source === 'live') {
      const liveAssignments = dashboard.events
        .filter((event) => event.source === 'School')
        .map(eventToAssignment)
        .sort(sortAssignments);

      return liveAssignments.length ? liveAssignments : mockAssignments;
    }

    return [...mockAssignments].sort(sortAssignments);
  }, [dashboard.events, dashboard.source]);

  const events = useMemo(() => [...dashboard.events].sort(byStartTime), [dashboard.events]);
  const emails = dashboard.emails;

  // "Time remaining today" = remaining school assignments due today + remaining timed calendar
  // events that haven't started yet + email actions (5 min each). This refreshes on each render
  // so it stays accurate as the clock advances.
  const todayWorkloadMinutes = useMemo(() => {
    const now = new Date();

    // School assignments due today (not done)
    const assignmentMins = assignments
      .filter(
        (a) => a.status !== 'Done' && (a.status === 'Overdue' || isDueToday(a)),
      )
      .reduce((sum, a) => sum + a.estimatedMinutes, 0);

    // Non-school timed calendar events today that haven't started yet
    const eventMins = events
      .filter((e) => {
        if (e.source === 'School') return false;
        if (e.dayLabel !== 'Today') return false;
        // Skip all-day events (they have no measurable duration)
        if (/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(e.start)) return false;
        // Only count events that start in the future
        return new Date(e.start) > now;
      })
      .reduce((sum, e) => {
        if (!e.end) return sum + 60; // assume 60 min if no end time
        const mins = Math.round(
          (new Date(e.end).getTime() - new Date(e.start).getTime()) / 60000,
        );
        return sum + Math.max(0, mins);
      }, 0);

    // Action emails (5 min each to process)
    const emailMins = getActionEmails(emails).length * 5;

    return assignmentMins + eventMins + emailMins;
  }, [assignments, events, emails]);

  const weekWorkloadMinutes = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const dow = todayStart.getDay();
    const daysUntilMonday = dow === 0 ? 1 : 8 - dow;
    const endOfWeek = new Date(todayStart);
    endOfWeek.setDate(todayStart.getDate() + daysUntilMonday);
    return assignments
      .filter(
        (a) =>
          a.status !== 'Done' &&
          (!a.dueAt || parseLocalDate(a.dueAt) < endOfWeek),
      )
      .reduce((sum, a) => sum + a.estimatedMinutes, 0);
  }, [assignments]);

  const dueTodayCount = useMemo(
    () =>
      assignments.filter(
        (a) => a.status !== 'Done' && (isDueToday(a) || a.status === 'Overdue'),
      ).length,
    [assignments],
  );

  const unreadCount = useMemo(() => emails.filter((e) => e.unread).length, [emails]);

  return (
    <DoneItemsProvider>
      <main className="min-h-screen bg-[#f7f3ee] bg-[linear-gradient(135deg,rgba(206,17,38,0.08),transparent_34%),linear-gradient(180deg,#fffdf9_0%,#f7f3ee_100%)] px-3 py-3 text-ink sm:px-4 sm:py-5 lg:px-8">
        <TodaysGamePlan
          connected={dashboard.connected}
          configured={dashboard.configured}
          dueTodayCount={dueTodayCount}
          hasLoaded={hasLoaded}
          isLive={dashboard.source === 'live'}
          isRefreshing={isRefreshing}
          lastUpdated={lastUpdated}
          onRefresh={() => loadDashboard()}
          today={today}
          todayWorkloadMinutes={todayWorkloadMinutes}
          unreadCount={unreadCount}
        />

        {dashboard.error ? (
          <p className="mx-auto mb-5 max-w-[1500px] rounded-lg border border-stone-200 bg-white/90 p-4 text-sm font-semibold text-stone-600 shadow-soft">
            Some live data could not load, so this view is using fallback data for now.
          </p>
        ) : null}

        <div className="mx-auto grid max-w-[1500px] gap-3 sm:gap-5">
          <TodayView assignments={assignments} events={events} today={today} />
          <CalendarView assignments={assignments} events={events} />
          <InboxRequiringAction emails={emails} />
          <ThisWeekView
            assignments={assignments}
            events={events}
            weekWorkloadMinutes={weekWorkloadMinutes}
          />
        </div>
      </main>
    </DoneItemsProvider>
  );
}

function eventToAssignment(event: CalendarEvent): Assignment {
  return {
    id: `calendar-assignment-${event.id}`,
    title: cleanAssignmentTitle(event.title),
    course: getCourseName(event.title, event.location),
    dueDate: formatDueDate(event.start),
    status: getAssignmentStatus(event.start),
    canvasUrl: 'https://canvas.illinoisstate.edu/courses',
    estimatedMinutes: estimateAssignmentMinutes(event.title),
    dueAt: event.start,
  };
}

function cleanAssignmentTitle(title: string) {
  return title.replace(/\[[^\]]+\]/g, '').replace(/\s+/g, ' ').trim() || title;
}

function getCourseName(title: string, location?: string) {
  const courseMatch = title.match(/\[([^\]]+)\]/);
  if (courseMatch?.[1]) return courseMatch[1];
  return location?.includes('Canvas') ? location : 'Canvas calendar';
}

function estimateAssignmentMinutes(title: string) {
  const value = title.toLowerCase();
  if (value.includes('exam') || value.includes('midterm') || value.includes('final')) return 120;
  if (value.includes('report') || value.includes('project') || value.includes('case study')) return 180;
  if (value.includes('analysis') || value.includes('reflection') || value.includes('paper') || value.includes('essay')) return 90;
  if (value.includes('reading') || value.includes('chapter')) return 60;
  if (value.includes('quiz') || value.includes('reply') || value.includes('discussion')) return 20;
  return 45;
}

function getAssignmentStatus(value: string): Assignment['status'] {
  const now = Date.now();
  const due = parseLocalDate(value).getTime();
  if (due < now) return 'Overdue';
  if (due - now <= 1000 * 60 * 60 * 48) return 'Due Soon';
  return 'Upcoming';
}

function sortAssignments(a: Assignment, b: Assignment) {
  const statusOrder: Record<Assignment['status'], number> = {
    Overdue: 0,
    'Due Soon': 1,
    Upcoming: 2,
    Done: 3,
  };
  const dueA = a.dueAt ? parseLocalDate(a.dueAt).getTime() : Number.MAX_SAFE_INTEGER;
  const dueB = b.dueAt ? parseLocalDate(b.dueAt).getTime() : Number.MAX_SAFE_INTEGER;
  return statusOrder[a.status] - statusOrder[b.status] || dueA - dueB;
}

function getActionEmails(emails: EmailMessage[]) {
  return emails.filter((email) => email.unread || email.important || email.category === 'Urgent');
}

function byStartTime(a: CalendarEvent, b: CalendarEvent) {
  return new Date(a.start).getTime() - new Date(b.start).getTime();
}

// Google Calendar returns all-day Canvas deadline events as date-only strings like "2026-06-11".
// JS parses these as UTC midnight, which in CDT is June 10 at 7 PM -- one day too early.
// Parse as local 11:59 PM so dates are correct and deadlines sort after timed events.
function parseLocalDate(value: string): Date {
  if (/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(value)) {
    const parts = value.split('-').map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2], 23, 59, 0);
  }
  return new Date(value);
}

function isAllDayString(value: string): boolean {
  return /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(value);
}

function formatDueDate(value: string) {
  const date = parseLocalDate(value);
  const allDay = isAllDayString(value);
  const now = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(now.getDate() + 1);
  if (sameDate(date, now)) return allDay ? 'Today, 11:59 PM' : 'Today, ' + formatTime(value);
  if (sameDate(date, tomorrow))
    return allDay ? 'Tomorrow, 11:59 PM' : 'Tomorrow, ' + formatTime(value);
  // All-day Canvas events use 11:59 PM as the canonical due time
  if (allDay) {
    return (
      new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }).format(date) + ', 11:59 PM'
    );
  }
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
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

function formatRefreshTime(value: Date) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(value);
}
