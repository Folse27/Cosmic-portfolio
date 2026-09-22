import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Reveal from "@/components/Reveal";
import TrackedLink from "@/components/TrackedLink";
import { getProjectBySlug, getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const [project, settings] = await Promise.all([getProjectBySlug(slug), getSettings()]);
  if (!project) return { title: "Project not found" };
  return {
    title: `${project.title} — ${settings.name}`,
    description: project.summary,
  };
}

/** Mono red mini-heading used for each case-study section. */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-crimson-text">{children}</p>;
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <article className="mx-auto max-w-4xl px-6 pb-24 pt-28 md:pt-32">
      <Reveal>
        <Link
          href="/#projects"
          className="font-mono text-xs uppercase tracking-wider text-gray-500 transition-colors hover:text-crimson-bright"
        >
          ← All projects
        </Link>

        <div className="mt-8">
          {project.dateLabel && (
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-crimson-text">{project.dateLabel}</p>
          )}
          <h1 className="font-display text-3xl leading-tight text-white md:text-5xl">{project.title}</h1>
          {project.tags.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span key={tag} className="chip">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </Reveal>

      {project.coverImage && (
        <Reveal delay={100}>
          <div className="mt-10 overflow-hidden rounded-2xl border border-white/10 shadow-glow-sm">
            <img src={project.coverImage} alt={project.title} className="w-full object-cover" />
          </div>
        </Reveal>
      )}

      <div className="mt-14 space-y-14">
        {project.description && (
          <Reveal>
            <SectionLabel>What it is</SectionLabel>
            <p className="whitespace-pre-line leading-relaxed text-gray-300">{project.description}</p>
          </Reveal>
        )}

        {project.problems.length > 0 && (
          <Reveal>
            <SectionLabel>The problem</SectionLabel>
            <ol className="space-y-4">
              {project.problems.map((problem, i) => (
                <li key={i} className="flex gap-4">
                  <span className="font-mono text-sm text-crimson-bright">{String(i + 1).padStart(2, "0")}</span>
                  <span className="leading-relaxed text-gray-300">{problem}</span>
                </li>
              ))}
            </ol>
          </Reveal>
        )}

        {project.solution && (
          <Reveal>
            <SectionLabel>How it helps</SectionLabel>
            <p className="whitespace-pre-line leading-relaxed text-gray-300">{project.solution}</p>
          </Reveal>
        )}

        {project.outcomes.length > 0 && (
          <Reveal>
            <SectionLabel>The results</SectionLabel>
            <ul className="space-y-3">
              {project.outcomes.map((outcome, i) => (
                <li key={i} className="flex gap-3 leading-relaxed text-gray-300">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-crimson shadow-glow-sm" />
                  <span>{outcome}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        )}

        {project.note && (
          <Reveal>
            <div className="rounded-2xl border border-crimson/30 bg-crimson/5 p-6">
              <SectionLabel>Good to know</SectionLabel>
              <p className="whitespace-pre-line leading-relaxed text-gray-300">{project.note}</p>
            </div>
          </Reveal>
        )}

        {project.gallery.length > 0 && (
          <Reveal>
            <SectionLabel>Gallery</SectionLabel>
            <div className="grid gap-4 sm:grid-cols-2">
              {project.gallery.map((src, i) => (
                <a key={i} href={src} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-xl border border-white/10 transition-all hover:border-crimson/50 hover:shadow-glow-sm">
                  <img src={src} alt={`${project.title} — image ${i + 1}`} className="h-full w-full object-cover" loading="lazy" />
                </a>
              ))}
            </div>
          </Reveal>
        )}

        {project.links.length > 0 && (
          <Reveal>
            <SectionLabel>Links</SectionLabel>
            <div className="flex flex-wrap gap-3">
              {project.links.map((link) => (
                <TrackedLink
                  key={link.url}
                  href={link.url}
                  external
                  trackId={`project-link:${project.slug}:${link.label}`}
                  className="btn-ghost"
                >
                  {link.label} ↗
                </TrackedLink>
              ))}
            </div>
          </Reveal>
        )}
      </div>

      <Reveal>
        <div className="mt-20 flex flex-wrap gap-4 border-t border-white/5 pt-10">
          <TrackedLink href="/#projects" trackId={`project-back:${project.slug}`} className="btn-ghost">
            ← Back to projects
          </TrackedLink>
          <TrackedLink href="/#contact" trackId={`project-contact:${project.slug}`} className="btn-primary">
            Discuss a similar project
          </TrackedLink>
        </div>
      </Reveal>
    </article>
  );
}
