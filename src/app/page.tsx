import { AssignmentList } from '@/components/AssignmentList';
import { BasketballHub } from '@/components/BasketballHub';
import { CalendarSnapshot } from '@/components/CalendarSnapshot';
import { GmailSummary } from '@/components/GmailSummary';
import { NotesPanel } from '@/components/NotesPanel';
import { PriorityPanel } from '@/components/PriorityPanel';
import { QuickLinkCard } from '@/components/QuickLinkCard';
import { SetupStatus } from '@/components/SetupStatus';
import { TodaySummary } from '@/components/TodaySummary';
import { TodoList } from '@/components/TodoList';
import {
  mockAssignments,
  mockEmails,
  mockEvents,
  mockPriorityItems,
  quickLinks,
  setupStatusItems,
} from '@/data/mockData';

export const dynamic = 'force-dynamic';

export default function Home() {
  const today = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  return (
    <main className="min-h-screen bg-[#f7f3ee] bg-[linear-gradient(135deg,rgba(206,17,38,0.08),transparent_34%),linear-gradient(180deg,#fffdf9_0%,#f7f3ee_100%)] px-4 py-5 text-ink sm:px-6 lg:px-8">
      <header className="mx-auto mb-5 flex max-w-[1500px] flex-col gap-5 rounded-lg border border-stone-200 bg-paper/90 p-5 shadow-soft sm:p-7 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wider text-redbird-600">
            Illinois State Women&apos;s Basketball
          </p>
          <h1 className="mt-1 text-4xl font-black leading-none text-ink sm:text-5xl">Good morning, Hayley</h1>
          <p className="mt-3 text-base text-stone-600">Here&apos;s what needs your attention today.</p>
        </div>
        <div className="rounded-lg border border-stone-200 bg-white px-5 py-4 lg:min-w-64" aria-label={`Today is ${today}`}>
          <span className="text-xs font-bold uppercase tracking-wide text-stone-500">Current date</span>
          <strong className="mt-1 block text-lg text-ink">{today}</strong>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1500px] gap-5 xl:grid-cols-[1.06fr_1fr_0.9fr]">
        <div className="grid content-start gap-5">
          <TodaySummary events={mockEvents.slice(0, 4)} emails={mockEmails} assignments={mockAssignments} />
          <CalendarSnapshot events={mockEvents} />
          <AssignmentList assignments={mockAssignments} />
        </div>

        <div className="grid content-start gap-5">
          <PriorityPanel items={mockPriorityItems} />
          <GmailSummary emails={mockEmails} />
          <TodoList />
        </div>

        <div className="grid content-start gap-5">
          <section aria-labelledby="quick-launch-title" className="rounded-lg border border-stone-200 bg-paper/95 p-5 shadow-soft">
            <p className="text-xs font-extrabold uppercase tracking-wider text-redbird-600">Fast access</p>
            <h2 id="quick-launch-title" className="mt-1 text-lg font-black text-ink">
              Quick Launch
            </h2>
            <div className="mt-4 grid gap-3">
              {quickLinks.map((link) => (
                <QuickLinkCard key={link.title} link={link} />
              ))}
            </div>
          </section>
          <BasketballHub />
          <NotesPanel />
          <SetupStatus items={setupStatusItems} />
        </div>
      </div>
    </main>
  );
}
