import type { CalendarEvent } from '../types';
import { Section } from './Section';

export function CalendarSnapshot({ events, isLive = false }: { events: CalendarEvent[]; isLive?: boolean }) {
  const upcomingEvents = events.filter((event) => event.dayLabel !== 'Today');
  const groupedEvents = groupEventsByDay(upcomingEvents.length ? upcomingEvents : events);

  return (
    <Section title="Weekly Snapshot" eyebrow="Rest of the week">
      {!isLive ? (
        <p className="mb-3 rounded-lg bg-redbird-50 p-3 text-sm text-stone-700">
          Google Calendar is not connected yet. This sample shows how the rest of the week will be grouped once live data loads.
        </p>
      ) : null}
      <div className="grid gap-4">
        {groupedEvents.length ? (
          groupedEvents.map((group) => (
          <section className="rounded-lg border border-stone-200 bg-white p-4" key={group.label}>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-black uppercase tracking-wide text-ink">{group.label}</h3>
              <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-bold text-stone-600">
                {group.events.length} {group.events.length === 1 ? 'thing' : 'things'}
              </span>
            </div>
            <div className="grid gap-2">
              {group.events.map((event) => (
                <article className="grid gap-2 rounded-lg bg-[#fffaf7] p-3 sm:grid-cols-[108px_minmax(0,1fr)_auto] sm:items-center" key={event.id}>
                  <time className="text-sm font-bold text-stone-600">
                    {formatTime(event.start)} - {formatTime(event.end)}
                  </time>
                  <div>
                    <h4 className="text-sm font-bold text-ink">{event.title}</h4>
                    <p className="mt-0.5 text-sm text-stone-600">{event.location ?? 'No location listed'}</p>
                  </div>
                  <span className={`h-fit w-fit rounded-full px-2.5 py-1 text-xs font-bold ${sourceClass[event.source]}`}>
                    {event.source}
                  </span>
                </article>
              ))}
            </div>
          </section>
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-stone-300 bg-white p-4 text-sm font-semibold text-stone-600">
            Nothing else is on the calendar for the rest of the week.
          </div>
        )}
      </div>
    </Section>
  );
}

function groupEventsByDay(events: CalendarEvent[]) {
  const groups = new Map<string, CalendarEvent[]>();

  for (const event of events) {
    const label = formatDay(event.start);
    groups.set(label, [...(groups.get(label) ?? []), event]);
  }

  return Array.from(groups.entries()).map(([label, grouped]) => ({
    label,
    events: grouped.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()),
  }));
}

function formatDay(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
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
