import type { CalendarEvent } from '../types';
import { Section } from './Section';

export function CalendarSnapshot({ events }: { events: CalendarEvent[] }) {
  return (
    <Section title="Calendar Snapshot" eyebrow="Today, tomorrow and next 7 days">
      <p className="mb-3 rounded-lg bg-redbird-50 p-3 text-sm text-stone-700">
        Google Calendar API is not connected yet. This mock snapshot shows the shape of the future Teamworks, Canvas,
        personal and basketball calendar view.
      </p>
      <div className="grid gap-3">
        {events.map((event) => (
          <article className="grid gap-3 rounded-lg border border-stone-200 bg-white p-4 sm:grid-cols-[112px_minmax(0,1fr)_auto]" key={event.id}>
            <time className="text-sm font-bold text-stone-600">
              {formatTime(event.start)} - {formatTime(event.end)}
            </time>
            <div>
              <h3 className="text-sm font-bold text-ink">{event.title}</h3>
              <p className="mt-1 text-sm text-stone-600">
                {event.dayLabel} · {event.location ?? 'No location listed'}
              </p>
            </div>
            <span className={`h-fit rounded-full px-2.5 py-1 text-xs font-bold ${sourceClass[event.source]}`}>
              {event.source}
            </span>
          </article>
        ))}
      </div>
    </Section>
  );
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

const sourceClass: Record<CalendarEvent['source'], string> = {
  Teamworks: 'bg-redbird-50 text-redbird-700',
  Canvas: 'bg-blue-50 text-blue-700',
  Basketball: 'bg-emerald-50 text-emerald-700',
  Personal: 'bg-amber-50 text-amber-700',
};
