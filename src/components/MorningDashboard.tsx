import type { ReactNode } from 'react';
import type { Assignment, CalendarEvent, EmailMessage, WaitingItem } from '@/types';

export interface RankedPriority {
  id: string;
  title: string;
  detail: string;
  score: number;
  source: 'Student' | 'Coach' | 'Inbox';
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
  weekWorkloadMinutes,
}: GamePlanProps) {
  const todayEvents = events.filter((event) => event.dayLabel === 'Today');
  const actionEmails = getActionEmails(emails);
  const unreadCount = emails.filter((email) => email.unread).length;
  const dueTodayCount = assignments.filter((assignment) => assignment.status !== 'Done' && isDueToday(assignment)).length;
  const focusItems = priorities.slice(0, 3);

  return (
    <section className="mx-auto mb-5 max-w-[1500px] rounded-lg border border-redbird-500/20 bg-white p-5 shadow-soft sm:p-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
          <div className="grid size-20 shrink-0 place-items-center rounded-lg border border-redbird-500/20 bg-white p-2 shadow-sm">
            <img
              src="/illinois-state-redbirds-emblem.png"
              alt="Illinois State Redbirds"
              className="max-h-full max-w-full object-contain"
            />
          </div>
          <div className="max-w-3xl">
            <p className="text-xs font-extrabold uppercase tracking-wider text-redbird-600">
              {isLive ? "Live morning brief" : "Morning brief preview"}
            </p>
            <h1 className="mt-1 text-4xl font-black leading-none text-ink sm:text-5xl">Today&apos;s Game Plan</h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-stone-600">
              Good morning, Hayley. Here is exactly what needs your attention today.
            </p>
          </div>
        </div>
        <div className="rounded-lg border border-stone-200 bg-[#fffaf7] p-4 lg:min-w-72">
          <p className="text-xs font-bold uppercase tracking-wide text-stone-500">Current date</p>
          <p className="mt-1 text-lg font-black text-ink">{today}</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
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
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-lg border border-stone-200 bg-[#fffaf7] p-5">
          <p className="text-xs font-extrabold uppercase tracking-wider text-redbird-600">Good Morning Hayley</p>
          <h3 className="mt-1 text-2xl font-black text-ink">Today&apos;s Focus</h3>
          <div className="mt-4 grid gap-2">
            {focusItems.length ? (
              focusItems.map((item) => (
                <div className="flex items-start gap-3 rounded-lg bg-white p-3" key={item.id}>
                  <span className="mt-1 grid size-7 shrink-0 place-items-center rounded-full bg-redbird-500 text-sm font-black text-white">
                    {item.score >= 90 ? '!' : item.score >= 50 ? '-' : '>'}
                  </span>
                  <div>
                    <p className="text-base font-black text-ink">{item.title}</p>
                    <p className="mt-0.5 text-sm text-stone-600">{item.detail}</p>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState message="No urgent items are showing right now." />
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Metric label="Time Required" value={formatDuration(todayWorkloadMinutes)} helper="remaining today" />
          <Metric label="Deadlines" value={String(dueTodayCount)} helper="due today" />
          <Metric label="Unread" value={String(unreadCount)} helper="in main inbox" />
          <Metric label="Week Workload" value={formatDuration(weekWorkloadMinutes)} helper="assignments left" />
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-4">
        <GamePlanColumn title="Must Do Today">
          <MustDoList assignments={assignments} emails={actionEmails} />
        </GamePlanColumn>
        <GamePlanColumn title="Today&apos;s Schedule">
          <CompactEventList events={todayEvents} emptyMessage="No events on your calendar today." />
        </GamePlanColumn>
        <GamePlanColumn title="Inbox">
          <p className="text-4xl font-black text-redbird-600">{unreadCount}</p>
          <p className="mt-1 text-sm font-bold text-stone-600">unread messages</p>
          <p className="mt-4 text-4xl font-black text-ink">{actionEmails.length}</p>
          <p className="mt-1 text-sm font-bold text-stone-600">need action or filing</p>
        </GamePlanColumn>
        <GamePlanColumn title="Time Required">
          <p className="text-4xl font-black text-ink">{formatDuration(todayWorkloadMinutes)}</p>
          <p className="mt-1 text-sm font-bold text-stone-600">assignment/email work today</p>
          <p className="mt-4 text-sm leading-relaxed text-stone-600">
            Start with the highest-score item, then move through the timeline.
          </p>
        </GamePlanColumn>
      </div>
    </section>
  );
}

export function TopPriorities({ priorities }: { priorities: RankedPriority[] }) {
  return (
    <DashboardCard eyebrow="Priority engine" title="Top 3 Priorities">
      <div className="grid gap-3">
        {priorities.slice(0, 3).map((item, index) => (
          <article className="grid grid-cols-[44px_minmax(0,1fr)_auto] items-start gap-3 rounded-lg border border-stone-200 bg-white p-4" key={item.id}>
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
      <CompactEventList events={events.filter((event) => event.dayLabel === 'Today')} emptyMessage="No events on your calendar today." />
    </DashboardCard>
  );
}

export function ResponsibilitySections({ assignments, events, emails }: { assignments: Assignment[]; events: CalendarEvent[]; emails: EmailMessage[] }) {
  const studentEmails = emails.filter((email) => ['Assignments', 'Canvas', 'Illinois State'].includes(email.category));
  const coachEvents = events.filter((event) => event.source === 'Basketball' || event.source === 'Teamworks');
  const coachEmails = emails.filter((email) => ['Basketball', 'Travel', 'Meetings'].includes(email.category));

  return (
    <>
      <DashboardCard eyebrow="Student" title="Class work and Canvas">
        <div className="grid gap-3">
          {assignments.slice(0, 5).map((assignment) => (
            <AssignmentRow assignment={assignment} key={assignment.id} />
          ))}
          {studentEmails.slice(0, 2).map((email) => (
            <EmailRow email={email} key={email.id} />
          ))}
        </div>
      </DashboardCard>
      <DashboardCard eyebrow="Coach" title="Basketball responsibilities">
        <div className="grid gap-3">
          {coachEvents.slice(0, 5).map((event) => (
            <EventRow event={event} key={event.id} />
          ))}
          {coachEmails.slice(0, 2).map((email) => (
            <EmailRow email={email} key={email.id} />
          ))}
        </div>
      </DashboardCard>
    </>
  );
}

export function TomorrowPrep({ assignments, events }: { assignments: Assignment[]; events: CalendarEvent[] }) {
  const tomorrowEvents = events.filter((event) => event.dayLabel === 'Tomorrow');
  const tomorrowDeadlines = assignments.filter((assignment) => assignment.status !== 'Done' && isDueTomorrow(assignment));
  const firstEvent = [...tomorrowEvents].sort(byStartTime)[0];
  const prepItems = buildPrepItems(firstEvent, tomorrowDeadlines);

  return (
    <DashboardCard eyebrow="Tomorrow Prep" title="Plan tonight, think less tomorrow">
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-stone-500">First event</p>
          <p className="mt-1 text-base font-black text-ink">{firstEvent ? firstEvent.title : 'Nothing scheduled'}</p>
          <p className="mt-1 text-sm text-stone-600">{firstEvent ? formatTime(firstEvent.start) : 'No calendar item found'}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-stone-500">Deadlines</p>
          <p className="mt-1 text-base font-black text-ink">{tomorrowDeadlines.length}</p>
          <p className="mt-1 text-sm text-stone-600">{tomorrowDeadlines.map((item) => item.title).join(', ') || 'No Canvas deadlines tomorrow'}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-stone-500">Recommended prep</p>
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
        <Metric label="Unread" value={String(emails.filter((email) => email.unread).length)} helper="main inbox" />
        <Metric label="Action" value={String(actionEmails.length)} helper="reply, file, or decide" />
      </div>
      <div className="grid gap-3">
        {actionEmails.slice(0, 4).map((email) => (
          <EmailRow email={email} key={email.id} />
        ))}
        {!actionEmails.length ? <EmptyState message="No inbox items need action right now." /> : null}
      </div>
    </DashboardCard>
  );
}

export function UpcomingThisWeek({ assignments, events, weekWorkloadMinutes }: { assignments: Assignment[]; events: CalendarEvent[]; weekWorkloadMinutes: number }) {
  const tomorrowEvents = events.filter((event) => event.dayLabel === 'Tomorrow');
  const upcomingEvents = events.filter((event) => event.dayLabel === 'Next 7 days');
  const upcomingAssignments = assignments.filter((assignment) => assignment.status !== 'Done' && !isDueToday(assignment));

  return (
    <DashboardCard eyebrow="This week" title="Upcoming">
      <div className="mb-4 rounded-lg bg-stone-50 p-3">
        <p className="text-xs font-bold uppercase tracking-wide text-stone-500">Total workload remaining this week</p>
        <p className="mt-1 text-2xl font-black text-ink">{formatDuration(weekWorkloadMinutes)}</p>
      </div>
      <div className="grid gap-3">
        <details className="rounded-lg border border-stone-200 bg-white p-4" open>
          <summary className="cursor-pointer text-sm font-black text-ink">Tomorrow</summary>
          <div className="mt-3 grid gap-2">
            {[...tomorrowEvents, ...upcomingAssignments.filter(isDueTomorrow)].slice(0, 5).map((item) =>
              'course' in item ? <AssignmentRow assignment={item} key={item.id} /> : <EventRow event={item} key={item.id} />,
            )}
          </div>
        </details>
        <details className="rounded-lg border border-stone-200 bg-white p-4">
          <summary className="cursor-pointer text-sm font-black text-ink">Upcoming after tomorrow</summary>
          <div className="mt-3 grid gap-2">
            {[...upcomingEvents, ...upcomingAssignments.filter((assignment) => !isDueTomorrow(assignment))]
              .slice(0, 8)
              .map((item) =>
                'course' in item ? <AssignmentRow assignment={item} key={item.id} /> : <EventRow event={item} key={item.id} />,
              )}
          </div>
        </details>
      </div>
    </DashboardCard>
  );
}

export function WaitingOn({ items }: { items: WaitingItem[] }) {
  return (
    <DashboardCard eyebrow="Not actionable yet" title="Waiting On">
      <div className="grid gap-3">
        {items.map((item) => (
          <article className="rounded-lg border border-stone-200 bg-white p-4" key={item.id}>
            <h3 className="text-sm font-black text-ink">{item.title}</h3>
            <p className="mt-1 text-sm text-stone-600">{item.owner}</p>
            <p className="mt-2 text-xs font-bold uppercase tracking-wide text-stone-500">{item.nextCheck}</p>
          </article>
        ))}
      </div>
    </DashboardCard>
  );
}

function GamePlanColumn({ children, title }: { children: ReactNode; title: string }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4">
      <h3 className="text-sm font-black uppercase tracking-wide text-ink">{title}</h3>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function DashboardCard({ children, eyebrow, title }: { children: ReactNode; eyebrow: string; title: string }) {
  return (
    <section className="rounded-lg border border-stone-200 bg-paper/95 p-5 shadow-soft">
      <p className="text-xs font-extrabold uppercase tracking-wider text-redbird-600">{eyebrow}</p>
      <h2 className="mt-1 text-2xl font-black leading-tight text-ink">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Metric({ helper, label, value }: { helper: string; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-stone-500">{label}</p>
      <p className="mt-1 text-3xl font-black text-ink">{value}</p>
      <p className="mt-1 text-sm font-semibold text-stone-600">{helper}</p>
    </div>
  );
}

function MustDoList({ assignments, emails }: { assignments: Assignment[]; emails: EmailMessage[] }) {
  const mustDo = [
    ...assignments.filter((assignment) => assignment.status === 'Overdue' || isDueToday(assignment)).slice(0, 2),
    ...emails.slice(0, 2),
  ].slice(0, 4);

  if (!mustDo.length) return <EmptyState message="No must-do items found for today." />;

  return (
    <div className="grid gap-2">
      {mustDo.map((item) =>
        'course' in item ? <AssignmentRow assignment={item} key={item.id} compact /> : <EmailRow email={item} key={item.id} compact />,
      )}
    </div>
  );
}

function CompactEventList({ emptyMessage, events }: { emptyMessage: string; events: CalendarEvent[] }) {
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

function AssignmentRow({ assignment, compact = false }: { assignment: Assignment; compact?: boolean }) {
  return (
    <article className={`rounded-lg border border-stone-200 bg-white ${compact ? 'p-3' : 'p-4'}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="text-sm font-black text-ink">{assignment.title}</h3>
        <span className={`rounded-full px-2.5 py-1 text-xs font-black ${statusClass[assignment.status]}`}>
          {assignment.status}
        </span>
      </div>
      <p className="mt-1 text-sm text-stone-600">
        {assignment.course} · {assignment.dueDate} · {assignment.estimatedMinutes} min
      </p>
    </article>
  );
}

function EventRow({ event, compact = false }: { event: CalendarEvent; compact?: boolean }) {
  return (
    <article className={`grid gap-2 rounded-lg border border-stone-200 bg-white ${compact ? 'p-3' : 'p-4'} sm:grid-cols-[84px_minmax(0,1fr)_auto] sm:items-center`}>
      <time className="text-sm font-black text-redbird-600">{formatTime(event.start)}</time>
      <div>
        <h3 className="text-sm font-black text-ink">{event.title}</h3>
        <p className="mt-0.5 text-sm text-stone-600">{event.location ?? 'No location listed'}</p>
      </div>
      <span className={`h-fit w-fit rounded-full px-2.5 py-1 text-xs font-black ${sourceClass[event.source]}`}>
        {event.source}
      </span>
    </article>
  );
}

function EmailRow({ compact = false, email }: { compact?: boolean; email: EmailMessage }) {
  return (
    <article className={`rounded-lg border border-stone-200 bg-white ${compact ? 'p-3' : 'p-4'}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wide text-stone-500">{email.from}</span>
        {email.unread ? <span className="rounded-full bg-redbird-500 px-2 py-0.5 text-[11px] font-black text-white">Unread</span> : null}
      </div>
      <h3 className="mt-1 text-sm font-black text-ink">{email.subject}</h3>
      {!compact ? <p className="mt-1 text-sm leading-snug text-stone-600">{email.snippet}</p> : null}
    </article>
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
  if (firstEvent?.source === 'Basketball' || firstEvent?.source === 'Teamworks') items.add('Pack basketball gear');
  if (firstEvent?.title.toLowerCase().includes('nutrition')) items.add('Review nutrition talk notes');
  if (deadlines.some((assignment) => assignment.title.toLowerCase().includes('discussion'))) items.add('Complete discussion replies');
  if (deadlines.length) items.add('Open Canvas before bed');
  if (!items.size) items.add('Check calendar before bed');
  return Array.from(items).slice(0, 4);
}

function getActionEmails(emails: EmailMessage[]) {
  return emails.filter((email) => email.unread || email.important || email.category === 'Urgent').slice(0, 6);
}

export function isDueToday(assignment: Assignment) {
  if (assignment.dueDate.toLowerCase().includes('today')) return true;
  if (!assignment.dueAt) return false;
  return sameDate(new Date(assignment.dueAt), new Date());
}

export function isDueTomorrow(assignment: Assignment) {
  if (assignment.dueDate.toLowerCase().includes('tomorrow')) return true;
  if (!assignment.dueAt) return false;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return sameDate(new Date(assignment.dueAt), tomorrow);
}

function sameDate(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
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
