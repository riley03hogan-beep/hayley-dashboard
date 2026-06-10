'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  InboxRequiringAction,
  isDueToday,
  isDueTomorrow,
  LINKS,
  ResponsibilitySections,
  TodaysGamePlan,
  TomorrowPrep,
  UpcomingAfterTomorrow,
  UpcomingThisWeek,
  type RankedPriority,
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
        .filter((event) => event.source === 'Canvas')
        .map(eventToAssignment)
        .sort(sortAssignments);

      return liveAssignments.length ? liveAssignments : mockAssignments;
    }

    return [...mockAssignments].sort(sortAssignments);
  }, [dashboard.events, dashboard.source]);

  const events = useMemo(() => [...dashboard.events].sort(byStartTime), [dashboard.events]);
  const emails = dashboard.emails;

  const priorities = useMemo(
    () => buildTopPriorities({ assignments, emails, events }),
    [assignments, emails, events],
  );

  const todayWorkloadMinutes = useMemo(
    () =>
      assignments
        .filter((assignment) => assignment.status !== 'Done' && (assignment.status === 'Overdue' || isDueToday(assignment)))
        .reduce((sum, assignment) => sum + assignment.estimatedMinutes, 0) + getActionEmails(emails).length * 5,
    [assignments, emails],
  );

  const weekWorkloadMinutes = useMemo(
    () =>
      assignments
        .filter((assignment) => assignment.status !== 'Done')
        .reduce((sum, assignment) => sum + assignment.estimatedMinutes, 0),
    [assignments],
  );

  return (
    <DoneItemsProvider>
    <main className="min-h-screen bg-[#f7f3ee] bg-[linear-gradient(135deg,rgba(206,17,38,0.08),transparent_34%),linear-gradient(180deg,#fffdf9_0%,#f7f3ee_100%)] px-3 py-3 text-ink sm:px-4 sm:py-5 lg:px-8">
      <TodaysGamePlan
        assignments={assignments}
        connected={dashboard.connected}
        configured={dashboard.configured}
        emails={emails}
        events={events}
        hasLoaded={hasLoaded}
        isLive={dashboard.source === 'live'}
        isRefreshing={isRefreshing}
        lastUpdated={lastUpdated}
        onRefresh={() => loadDashboard()}
        priorities={priorities}
        today={today}
        todayWorkloadMinutes={todayWorkloadMinutes}
        weekWorkloadMinutes={weekWorkloadMinutes}
      />

      {dashboard.error ? (
        <p className="mx-auto mb-5 max-w-[1500px] rounded-lg border border-stone-200 bg-white/90 p-4 text-sm font-semibold text-stone-600 shadow-soft">
          Some live data could not load, so this view is using fallback data for now.
        </p>
      ) : null}

      <div className="mx-auto grid max-w-[1500px] gap-3 sm:gap-5">
        <div className="grid gap-3 sm:gap-5 lg:grid-cols-2">
          <ResponsibilitySections assignments={assignments} emails={emails} events={events} />
        </div>

        <div className="grid gap-3 sm:gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <TomorrowPrep assignments={assignments} events={events} />
          <InboxRequiringAction emails={emails} />
        </div>

        <div className="grid gap-3 sm:gap-5 lg:grid-cols-2">
          <UpcomingThisWeek assignments={assignments} events={events} weekWorkloadMinutes={weekWorkloadMinutes} />
          <UpcomingAfterTomorrow assignments={assignments} events={events} />
        </div>
      </div>
    </main>
    </DoneItemsProvider>
  );
}

function buildTopPriorities({
  assignments,
  emails,
  events,
}: {
  assignments: Assignment[];
  emails: EmailMessage[];
  events: CalendarEvent[];
}): RankedPriority[] {
  const assignmentPriorities: RankedPriority[] = assignments
    .filter((assignment) => assignment.status !== 'Done')
    .map((assignment) => {
      const score = getAssignmentScore(assignment);
      return {
        id: `assignment-${assignment.id}`,
        title: assignment.title,
        detail: `${assignment.course} · ${assignment.dueDate} · ${assignment.estimatedMinutes} min`,
        score,
        source: 'Student' as const,
        href: assignment.canvasUrl || LINKS.canvas,
        doneKey: assignment.id,
      };
    })
    .filter((item) => item.score > 0);

  const basketballPriorities: RankedPriority[] = events
    .filter((event) => event.dayLabel === 'Today' && (event.source === 'Basketball' || event.source === 'Teamworks'))
    .map((event) => ({
      id: `event-${event.id}`,
      title: event.title,
      detail: `${formatTime(event.start)}${event.location ? ` · ${event.location}` : ''}`,
      score: 50,
      source: 'Coach' as const,
      href: LINKS.teamworks,
      doneKey: event.id,
    }));

  const emailPriorities: RankedPriority[] = emails
    .filter((email) => email.unread || email.important)
    .map((email) => ({
      id: `email-${email.id}`,
      title: shortText(email.subject, 74),
      detail: `${email.from} · ${shortText(email.snippet, 110)}`,
      score: isProfessorEmail(email) && email.unread ? 40 : 10,
      source: 'Inbox' as const,
      href: isForwardedSchoolEmail(email) ? LINKS.outlook : LINKS.gmail,
      doneKey: `email-${email.id}`,
    }));

  return [...assignmentPriorities, ...basketballPriorities, ...emailPriorities]
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, 3);
}

function getAssignmentScore(assignment: Assignment) {
  if (assignment.status === 'Overdue') return 100;
  if (isDueToday(assignment)) return 90;
  if (isDueTomorrow(assignment)) return 70;
  return 0;
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
  if (value.includes('report') || value.includes('project') || value.includes('case study')) return 180;
  if (value.includes('analysis') || value.includes('reflection') || value.includes('paper')) return 90;
  if (value.includes('quiz') || value.includes('reply') || value.includes('discussion')) return 20;
  return 45;
}

function getAssignmentStatus(value: string): Assignment['status'] {
  const now = Date.now();
  const due = new Date(value).getTime();
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
  const dueA = a.dueAt ? new Date(a.dueAt).getTime() : Number.MAX_SAFE_INTEGER;
  const dueB = b.dueAt ? new Date(b.dueAt).getTime() : Number.MAX_SAFE_INTEGER;
  return statusOrder[a.status] - statusOrder[b.status] || dueA - dueB;
}

function getActionEmails(emails: EmailMessage[]) {
  return emails.filter((email) => email.unread || email.important || email.category === 'Urgent');
}

function isProfessorEmail(email: EmailMessage) {
  const value = `${email.from} ${email.subject}`.toLowerCase();
  return ['professor', 'instructor', 'faculty', 'spm ', 'canvas'].some((keyword) => value.includes(keyword));
}

function isForwardedSchoolEmail(email: EmailMessage) {
  return (
    ['Assignments', 'Canvas', 'Illinois State'].includes(email.category) ||
    email.from.toLowerCase().includes('instructor') ||
    email.from.toLowerCase().includes('professor') ||
    email.from.toLowerCase().includes('illinois state') ||
    email.from.toLowerCase().includes('canvas')
  );
}

function byStartTime(a: CalendarEvent, b: CalendarEvent) {
  return new Date(a.start).getTime() - new Date(b.start).getTime();
}

function formatDueDate(value: string) {
  const date = new Date(value);
  const now = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(now.getDate() + 1);

  if (sameDate(date, now)) return `Today, ${formatTime(value)}`;
  if (sameDate(date, tomorrow)) return `Tomorrow, ${formatTime(value)}`;

  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function sameDate(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
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
