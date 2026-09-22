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

/** Loud, unmissable banner shown while required details are still placeholders. */
export function PlaceholderWarning({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-yellow-500/50 bg-yellow-500/10 p-4">
      <p className="font-mono text-xs uppercase tracking-wider text-yellow-500">⚠ Action required before going live</p>
      <p className="mt-2 text-sm leading-relaxed text-yellow-200/90">{children}</p>
    </div>
  );
}
