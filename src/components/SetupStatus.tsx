import type { SetupStatusItem } from '../types';
import { Section } from './Section';

export function SetupStatus({ items }: { items: SetupStatusItem[] }) {
  return (
    <Section title="Settings / Setup" eyebrow="Connection status">
      <div className="grid gap-3">
        {items.map((item) => (
          <article className="grid gap-3 rounded-lg border border-stone-200 bg-white p-4 sm:grid-cols-[minmax(0,1fr)_auto]" key={item.label}>
            <div>
              <h3 className="text-sm font-bold text-ink">{item.label}</h3>
              <p className="mt-1 text-sm leading-snug text-stone-600">{item.note}</p>
            </div>
            <span
              className={`h-fit rounded-full px-2.5 py-1 text-xs font-bold ${
                item.connected ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-700'
              }`}
            >
              {item.connected ? 'Connected' : 'Not yet'}
            </span>
          </article>
        ))}
      </div>
      <ul className="mt-4 grid gap-2 rounded-lg bg-redbird-50 p-4 text-sm text-stone-700">
        <li>Canvas notifications forward from Illinois State Outlook to Gmail.</li>
        <li>Canvas calendar feed is connected to Google Calendar.</li>
        <li>Teamworks is integrated with Google Calendar.</li>
        <li>Illinois State Outlook forwards to Gmail.</li>
      </ul>
    </Section>
  );
}
