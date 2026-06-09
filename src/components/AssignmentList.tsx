import type { Assignment } from '../types';
import { Section } from './Section';

export function AssignmentList({ assignments }: { assignments: Assignment[] }) {
  return (
    <Section title="Assignments and Deadlines" eyebrow="Canvas via calendar">
      <div className="grid gap-3">
        {assignments.map((assignment) => (
          <article className="grid gap-3 rounded-lg border border-stone-200 bg-white p-4 sm:grid-cols-[minmax(0,1fr)_auto]" key={assignment.id}>
            <div>
              <h3 className="text-sm font-bold text-ink">{assignment.title}</h3>
              <p className="mt-1 text-sm text-stone-600">
                {assignment.course} · {assignment.dueDate}
              </p>
            </div>
            <div className="flex flex-wrap items-start gap-2 sm:justify-end">
              <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusClass[assignment.status]}`}>
                {assignment.status}
              </span>
              <a
                href={assignment.canvasUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-stone-200 bg-white px-2.5 py-1 text-xs font-bold text-redbird-600 hover:border-redbird-500/40"
              >
                Canvas
              </a>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}

const statusClass: Record<Assignment['status'], string> = {
  'Due Soon': 'bg-redbird-500 text-white',
  Upcoming: 'bg-blue-50 text-blue-700',
  Overdue: 'bg-stone-900 text-white',
  Done: 'bg-emerald-50 text-emerald-700',
};
