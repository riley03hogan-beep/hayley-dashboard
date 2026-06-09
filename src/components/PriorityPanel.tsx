import type { PriorityItem } from '../types';
import { Section } from './Section';

export function PriorityPanel({ items }: { items: PriorityItem[] }) {
  return (
    <Section title="Needs Attention" eyebrow="Smart priority panel">
      <div className="grid gap-3">
        {items.length ? (
          items.map((item) => (
            <article className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 rounded-lg border border-stone-200 bg-white p-4" key={item.id}>
              <span className={`mt-1 size-3 rounded-full ${priorityDotClass[item.level]}`} aria-hidden="true" />
              <div>
                <h3 className="text-sm font-bold text-ink">{item.title}</h3>
                <p className="mt-1 text-sm leading-snug text-stone-600">{item.detail}</p>
              </div>
              <span className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs font-bold text-stone-600">{item.source}</span>
            </article>
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-stone-300 bg-white p-4 text-sm font-semibold text-stone-600">
            No urgent Gmail or Calendar items found right now.
          </div>
        )}
      </div>
    </Section>
  );
}

const priorityDotClass: Record<PriorityItem['level'], string> = {
  high: 'bg-redbird-500',
  medium: 'bg-amber-500',
  low: 'bg-emerald-500',
};
