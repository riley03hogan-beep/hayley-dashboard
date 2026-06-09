import type { QuickLink } from '../types';

export function QuickLinkCard({ link }: { link: QuickLink }) {
  return (
    <a
      className="grid min-h-20 grid-cols-[42px_1fr] items-center gap-3 rounded-lg border border-stone-200 bg-white p-3 no-underline transition hover:-translate-y-0.5 hover:border-redbird-500/40 hover:shadow-lg focus-visible:-translate-y-0.5 focus-visible:border-redbird-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-redbird-500/20"
      href={link.href}
      target={link.href.startsWith('#') ? '_self' : '_blank'}
      rel={link.href.startsWith('#') ? undefined : 'noreferrer'}
    >
      <span className="grid size-[42px] place-items-center rounded-lg bg-redbird-500 text-xs font-black text-white" aria-hidden="true">
        {link.initials}
      </span>
      <span>
        <strong className="block text-sm text-ink">{link.title}</strong>
        <small className="mt-1 block text-sm leading-snug text-stone-600">{link.description}</small>
      </span>
    </a>
  );
}
