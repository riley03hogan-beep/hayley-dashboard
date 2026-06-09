import type { Assignment, CalendarEvent, EmailMessage } from '../types';
import { Section } from './Section';

interface TodaySummaryProps {
  events: CalendarEvent[];
  emails: EmailMessage[];
  assignments: Assignment[];
}

export function TodaySummary({ events, emails, assignments }: TodaySummaryProps) {
  const unreadImportant = emails.filter((email) => email.unread || email.important).length;

  return (
    <Section title="Today at a Glance" eyebrow="Command center">
      <div className="grid grid-cols-2 gap-3">
        <SummaryTile label="Calendar events" value={events.length.toString()} detail="Classes, practice and meetings" />
        <SummaryTile label="Deadlines" value={assignments.length.toString()} detail="Canvas and class tasks" />
        <SummaryTile label="Unread/important" value={unreadImportant.toString()} detail="Email items to review" />
        <SummaryTile label="Team schedule" value="3" detail="Film, practice and admin notes" />
      </div>
      <div className="mt-3 grid gap-1 rounded-lg bg-redbird-50 p-4">
        <strong className="text-sm text-ink">Quick reminders</strong>
        <span className="text-sm text-stone-600">Check travel roster, review Canvas due dates, and scan forwarded Outlook mail.</span>
      </div>
    </Section>
  );
}

function SummaryTile({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <article className="grid min-h-28 gap-1 rounded-lg border border-stone-200 bg-[#fff9f5] p-4">
      <span className="text-sm text-stone-600">{label}</span>
      <strong className="text-3xl font-black leading-none text-redbird-600">{value}</strong>
      <small className="text-sm leading-snug text-stone-600">{detail}</small>
    </article>
  );
}
