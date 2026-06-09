import type { EmailMessage } from '../types';
import { Section } from './Section';

export function GmailSummary({ emails, isLive = false }: { emails: EmailMessage[]; isLive?: boolean }) {
  const filingEmails = emails.filter((email) => email.category !== 'General').slice(0, 6);
  const unreadCount = filingEmails.filter((email) => email.unread).length;
  const urgentCount = filingEmails.filter((email) => email.important || email.category === 'Urgent').length;

  return (
    <Section title="Gmail Summary" eyebrow="Main inbox to sort">
      <div className="mb-3 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-stone-200 bg-white p-3">
          <span className="text-xs font-bold uppercase tracking-wide text-stone-500">To file</span>
          <strong className="mt-1 block text-2xl font-black text-redbird-600">{filingEmails.length}</strong>
        </div>
        <div className="rounded-lg border border-stone-200 bg-white p-3">
          <span className="text-xs font-bold uppercase tracking-wide text-stone-500">Unread</span>
          <strong className="mt-1 block text-2xl font-black text-redbird-600">{unreadCount}</strong>
        </div>
      </div>
      <div className="mb-3 rounded-lg border border-stone-200 bg-white p-3">
        <span className="text-xs font-bold uppercase tracking-wide text-stone-500">Needs attention</span>
        <strong className="mt-1 block text-2xl font-black text-redbird-600">{urgentCount}</strong>
      </div>
      {!isLive ? (
        <p className="mb-3 rounded-lg bg-redbird-50 p-3 text-sm text-stone-700">
          Gmail is not connected yet. These samples show the kind of Inbox messages that will be sorted into folders.
        </p>
      ) : null}
      <div className="grid gap-3">
        {filingEmails.length ? (
          filingEmails.map((email) => (
            <article className="grid gap-3 rounded-lg border border-stone-200 bg-white p-4 sm:grid-cols-[minmax(0,1fr)_auto]" key={email.id}>
              <div>
                <span className="text-xs font-bold uppercase tracking-wide text-stone-500">
                  {email.from} · {email.receivedAt}
                </span>
                <h3 className="mt-1 text-sm font-bold text-ink">{email.subject}</h3>
                <p className="mt-1 text-sm leading-snug text-stone-600">{email.snippet}</p>
              </div>
              <div className="flex flex-wrap items-start gap-2 sm:justify-end">
                <span className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs font-bold text-stone-600">
                  Move to {email.category}
                </span>
                {email.unread ? (
                  <span className="rounded-full bg-redbird-500 px-2.5 py-1 text-xs font-bold text-white">Unread</span>
                ) : null}
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-stone-300 bg-white p-4 text-sm font-semibold text-stone-600">
            No categorized messages found in the main inbox.
          </div>
        )}
      </div>
    </Section>
  );
}
