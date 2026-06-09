interface SectionProps {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
  id?: string;
}

export function Section({ title, eyebrow, children, id }: SectionProps) {
  const titleId = `${title.replace(/\s+/g, '-')}-title`;

  return (
    <section className="rounded-lg border border-stone-200 bg-paper/95 p-5 shadow-soft" id={id} aria-labelledby={titleId}>
      <div className="mb-4">
        {eyebrow ? <p className="text-xs font-extrabold uppercase tracking-wider text-redbird-600">{eyebrow}</p> : null}
        <h2 id={titleId} className="mt-1 text-lg font-black text-ink">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}
