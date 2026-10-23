import type { ReactNode } from "react";

/** Page shell shared by /impressum and /privacy. */
export function LegalPage({ title, kicker, children }: { title: string; kicker: string; children: ReactNode }) {
  return (
    <article className="mx-auto max-w-3xl px-6 pb-24 pt-28 md:pt-32">
      <p className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-crimson-text">{kicker}</p>
      <h1 className="font-display text-3xl leading-tight text-white md:text-4xl">{title}</h1>
      <div className="mt-12 space-y-10">{children}</div>
    </article>
  );
}

export function LegalSection({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-4 font-display text-lg text-white">{heading}</h2>
      <div className="space-y-3 leading-relaxed text-gray-400">{children}</div>
    </section>
  );
}
