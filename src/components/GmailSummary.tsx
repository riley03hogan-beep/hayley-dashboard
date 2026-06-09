import type { EmailMessage } from '../types';
import { Section } from './Section';

export function GmailSummary({ emails }: { emails: EmailMessage[] }) {
  const unreadCount = emails.filter((email) => email.unread).length;
  const urgentCount = emails.filter((email) => email.important || email.category === 'Urgent').length;

  return (
    <Section title="Gmail Summary" eyebrow="Mock inbox">
      <div className="mb-3 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-stone-200 bg-white p-3">
          <span className="text-xs font-bold uppercase tracking-wide text-stone-500">Unread</span>
          <strong className="mt-1 block text-2xl font-black text-redbird-600">{unreadCount}</strong>
        </div>
        <div className="rounded-lg border border-stone-200 bg-white p-3">
          <span className="text-xs font-bold uppercase tracking-wide text-stone-500">Action needed</span>
          <strong className="mt-1 block text-2xl font-black text-redbird-600">{urgentCount}</strong>
        </div>
      </div>
      <p className="mb-3 rounded-lg bg-redbird-50 p-3 text-sm text-stone-700">
        Gmail OAuth is not configured yet. These realistic placeholders represent Canvas notifications, Illinois State
        emails, basketball mail and urgent action items.
      </p>
      <div className="grid gap-3">
        {emails.map((email) => (
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
                {email.category}
              </span>
              {email.unread ? (
                <span className="rounded-full bg-redbird-500 px-2.5 py-1 text-xs font-bold text-white">Unread</span>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}
