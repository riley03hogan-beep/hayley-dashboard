import { Section } from './Section';

const hubItems = [
  'Teamworks schedule',
  'Practice',
  'Games',
  'Travel',
  'Meetings',
  'Recruiting/admin reminders',
  'Notes from coaches',
  'Game day checklist',
  'Travel day checklist',
];

export function BasketballHub() {
  return (
    <Section title="Basketball / GA Hub" eyebrow="Illinois State WBB">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
        {hubItems.map((item) => (
          <article className="grid min-h-20 grid-cols-[42px_1fr] items-center gap-3 rounded-lg border border-stone-200 bg-white p-3" key={item}>
            <span className="grid size-[42px] place-items-center rounded-lg bg-redbird-500 text-xs font-black text-white" aria-hidden="true">
              {item.slice(0, 2).toUpperCase()}
            </span>
            <h3 className="text-sm font-bold text-ink">{item}</h3>
          </article>
        ))}
      </div>
    </Section>
  );
}
