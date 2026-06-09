import type { Assignment } from '../types';
import { Section } from './Section';

export function AssignmentList({ assignments, isLive = false }: { assignments: Assignment[]; isLive?: boolean }) {
  return (
    <Section title="Rest of the Week Assignments" eyebrow={isLive ? 'Canvas deadlines' : 'Sample Canvas deadlines'}>
      <div className="grid gap-3">
        {assignments.length ? (
          assignments.map((assignment) => (
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
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-stone-300 bg-white p-4 text-sm font-semibold text-stone-600">
            No Canvas deadlines found for the rest of the week.
          </div>
        )}
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
