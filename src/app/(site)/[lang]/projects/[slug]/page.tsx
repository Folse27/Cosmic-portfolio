import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Reveal from "@/components/Reveal";
import TrackedLink from "@/components/TrackedLink";
import { getProjectBySlug, getSettings } from "@/lib/data";
import { formatPrice, getDict, isLocale, localeAlternates, localePath, LOCALES, OG_LOCALE } from "@/lib/i18n";
import { localizeProject } from "@/lib/localize";
import { OG_IMAGE } from "@/lib/site-url";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ lang: string; slug: string }> };

/** Resolves the route params to a project in the requested language, or null. */
async function load(params: Params["params"]) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return null;
  const project = await getProjectBySlug(slug);
  return project ? { lang, project: localizeProject(project, lang) } : null;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const [loaded, settings] = await Promise.all([load(params), getSettings()]);
  if (!loaded) {
    const { lang } = await params;
    return { title: getDict(isLocale(lang) ? lang : "de").project.notFound, robots: { index: false } };
  }
  const { lang, project } = loaded;

  const title = `${project.title} — ${settings.name}`;
  const description = project.summary;
  const path = `/projects/${project.slug}`;

  // The project's own cover image makes a far better preview card than the
  // generic hero. Dimensions are omitted for it because uploads vary in size,
  // and declaring the wrong ones makes platforms crop badly.
  const images = project.coverImage
    ? [{ url: project.coverImage, alt: project.title }]
    : [{ url: OG_IMAGE, width: 1200, height: 630, alt: title }];

  return {
    title,
    description,
    alternates: localeAlternates(lang, path),
    openGraph: {
      type: "article",
      url: localePath(lang, path),
      siteName: settings.name,
      title,
      description,
      locale: OG_LOCALE[lang],
      alternateLocale: LOCALES.filter((l) => l !== lang).map((l) => OG_LOCALE[l]),
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images.map((image) => image.url),
    },
  };
}

/** Mono red mini-heading used for each case-study section. */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-crimson-text">{children}</p>;
}

export default async function ProjectPage({ params }: Params) {
  const loaded = await load(params);
  if (!loaded) notFound();
  const { lang, project } = loaded;
  const dict = getDict(lang);
  const t = dict.project;
  const price = formatPrice(lang, project.priceAmount, project.priceType);
  const home = (hash: string) => localePath(lang, `/#${hash}`);

  return (
    <article className="mx-auto max-w-4xl px-6 pb-24 pt-28 md:pt-32">
      <Reveal>
        <Link
          href={home("projects")}
          className="font-mono text-xs uppercase tracking-wider text-gray-500 transition-colors hover:text-crimson-bright"
        >
          {t.allProjects}
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
          {price && (
            <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-crimson/30 bg-crimson/5 p-5 sm:flex-row sm:items-center sm:gap-6">
              <div className="shrink-0">
                <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-crimson-text">{dict.price.label}</p>
                <p className="mt-1 font-display text-2xl text-white">{price}</p>
              </div>
              <p className="text-sm leading-relaxed text-gray-400">{dict.price.note}</p>
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
            <SectionLabel>{t.whatItIs}</SectionLabel>
            <p className="whitespace-pre-line leading-relaxed text-gray-300">{project.description}</p>
          </Reveal>
        )}

        {project.problems.length > 0 && (
          <Reveal>
            <SectionLabel>{t.problem}</SectionLabel>
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
            <SectionLabel>{t.howItHelps}</SectionLabel>
            <p className="whitespace-pre-line leading-relaxed text-gray-300">{project.solution}</p>
          </Reveal>
        )}

        {project.outcomes.length > 0 && (
          <Reveal>
            <SectionLabel>{t.results}</SectionLabel>
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
              <SectionLabel>{t.goodToKnow}</SectionLabel>
              <p className="whitespace-pre-line leading-relaxed text-gray-300">{project.note}</p>
            </div>
          </Reveal>
        )}

        {project.gallery.length > 0 && (
          <Reveal>
            <SectionLabel>{t.gallery}</SectionLabel>
            <div className="grid gap-4 sm:grid-cols-2">
              {project.gallery.map((src, i) => (
                <a key={i} href={src} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-xl border border-white/10 transition-all hover:border-crimson/50 hover:shadow-glow-sm">
                  <img src={src} alt={`${project.title} — ${t.image} ${i + 1}`} className="h-full w-full object-cover" loading="lazy" />
                </a>
              ))}
            </div>
          </Reveal>
        )}

        {project.links.length > 0 && (
          <Reveal>
            <SectionLabel>{t.links}</SectionLabel>
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
          <TrackedLink href={home("projects")} trackId={`project-back:${project.slug}`} className="btn-ghost">
            {t.back}
          </TrackedLink>
          <TrackedLink href={home("contact")} trackId={`project-contact:${project.slug}`} className="btn-primary">
            {t.discuss}
          </TrackedLink>
        </div>
      </Reveal>
    </article>
  );
}
