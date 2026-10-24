import ContactSection from "@/components/ContactSection";
import CosmicHero from "@/components/CosmicHero";
import ProjectCard from "@/components/ProjectCard";
import Reveal from "@/components/Reveal";
import TrackedLink from "@/components/TrackedLink";
import type { Project } from "@/db/schema";
import { getPublishedProjects, getSettings } from "@/lib/data";
import { formatPrice, getDict, localePath, type Locale } from "@/lib/i18n";
import { localizeProject, localizeSettings } from "@/lib/localize";
import { resolveSectionCopy } from "@/lib/section-copy";

/** Section heading: mono kicker + display title, consistent across the page. */
function SectionHeading({ kicker, title }: { kicker: string; title: string }) {
  return (
    <Reveal className="mb-12">
      <p className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-crimson-text">{kicker}</p>
      <h2 className="font-display text-3xl text-white md:text-4xl">{title}</h2>
    </Reveal>
  );
}

function ProjectGrid({
  projects,
  lang,
  seeHow,
}: {
  projects: Project[];
  lang: Locale;
  seeHow: string;
}) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project, i) => (
        <Reveal key={project.id} delay={(i % 3) * 90}>
          <ProjectCard
            project={project}
            href={localePath(lang, `/projects/${project.slug}`)}
            seeHow={seeHow}
            price={formatPrice(lang, project.priceAmount, project.priceType)}
          />
        </Reveal>
      ))}
    </div>
  );
}

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  // The [lang] layout has already rejected unknown languages.
  const lang = (await params).lang as Locale;
  const t = getDict(lang);
  const [rawSettings, rawProjects] = await Promise.all([getSettings(), getPublishedProjects()]);
  const settings = localizeSettings(rawSettings, lang);
  const copy = resolveSectionCopy(rawSettings, lang);
  const projects = rawProjects.map((p) => localizeProject(p, lang));
  // Featured projects lead; the rest go under "More projects". With nothing
  // featured, every project stays in the main grid.
  const featured = projects.filter((p) => p.featured);
  const main = featured.length ? featured : projects;
  const more = featured.length ? projects.filter((p) => !p.featured) : [];
  const bioParagraphs = settings.bio.split(/\n\s*\n/).filter(Boolean);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden">
        <CosmicHero fallbackSrc="/images/hero-fallback.webp" />

        <div className="relative z-10 max-w-4xl px-6 pt-16 text-center">
          <Reveal>
            <p className="mb-6 font-mono text-xs uppercase tracking-[0.35em] text-crimson-bright md:text-sm">
              {settings.title}
            </p>
            <h1 className="text-glow font-display text-4xl leading-tight text-white md:text-6xl lg:text-7xl">
              {settings.name}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl leading-relaxed text-gray-400 md:text-lg">
              {settings.tagline}
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <TrackedLink href={localePath(lang, "/#projects")} trackId="cta:view-projects" className="btn-primary">
                {t.hero.viewProjects}
              </TrackedLink>
              <TrackedLink href={localePath(lang, "/#contact")} trackId="cta:contact" className="btn-ghost">
                {t.hero.contactMe}
              </TrackedLink>
            </div>
          </Reveal>
        </div>

        <a
          href="#about"
          aria-label={t.hero.scrollToAbout}
          className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-bounce text-gray-500 transition-colors hover:text-crimson-bright"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </section>

      {/* ── About ────────────────────────────────────────────────────── */}
      <section className="py-24 md:py-32">
        <div id="about" className="anchor-target mx-auto max-w-site px-6">
          <SectionHeading kicker={t.about.kicker} title={t.about.title} />
          <div className="grid items-start gap-12 md:grid-cols-[minmax(0,320px)_1fr]">
            <Reveal>
              <div className="relative mx-auto aspect-square w-full max-w-xs overflow-hidden rounded-2xl border border-white/10 bg-panel shadow-glow-sm">
                {settings.profileImage ? (
                  <img src={settings.profileImage} alt={settings.name} className="h-full w-full object-cover" />
                ) : (
                  // No photo yet: a monogram, so visitors never see an admin hint.
                  <div className="flex h-full w-full items-center justify-center">
                    <div className="flex h-28 w-28 items-center justify-center rounded-full border border-crimson/40 bg-crimson/10 font-display text-4xl text-white/80">
                      {settings.name.trim().charAt(0)}
                    </div>
                  </div>
                )}
              </div>
            </Reveal>
            <Reveal delay={120}>
              <div className="space-y-4 leading-relaxed text-gray-400">
                {bioParagraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              {settings.skills.length > 0 && (
                <div className="mt-8">
                  <p className="label">{t.about.skills}</p>
                  <div className="flex flex-wrap gap-2">
                    {settings.skills.map((skill) => (
                      <span
                        key={skill}
                        className="chip transition-colors hover:border-crimson/60 hover:text-crimson-bright"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Projects ─────────────────────────────────────────────────── */}
      <section className="py-24 md:py-32">
        <div id="projects" className="anchor-target mx-auto max-w-site px-6">
          <SectionHeading kicker={t.projects.kicker} title={t.projects.title} />
          {projects.length === 0 ? (
            <p className="font-mono text-sm text-gray-500">{t.projects.empty}</p>
          ) : (
            <ProjectGrid projects={main} lang={lang} seeHow={t.card.seeHow} />
          )}
          {more.length > 0 && (
            <div className="mt-20">
              <Reveal className="mb-8">
                <h3 className="font-display text-xl text-white md:text-2xl">{t.projects.more}</h3>
              </Reveal>
              <ProjectGrid projects={more} lang={lang} seeHow={t.card.seeHow} />
            </div>
          )}
        </div>
      </section>

      {/* ── Data protection in client projects ───────────────────────── */}
      <section className="pt-24 md:pt-32">
        <div id="data-protection" className="anchor-target mx-auto max-w-site px-6">
          <SectionHeading kicker={copy.dataKicker} title={copy.dataTitle} />
          <div className="grid gap-6 sm:grid-cols-2">
            {copy.dataPoints.map((point, i) => (
              <Reveal key={i} delay={(i % 2) * 90}>
                <div className="card-panel h-full">
                  <h3 className="font-display text-base text-white">{point.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-400">{point.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact ──────────────────────────────────────────────────── */}
      <section className="pt-24 md:pt-32">
        <div id="contact" className="anchor-room anchor-target mx-auto max-w-site px-6 pb-24 md:pb-32">
          <SectionHeading kicker={copy.contactKicker} title={copy.contactTitle} />
          <Reveal>
            <ContactSection
              email={settings.email}
              socials={settings.socials}
              labels={{ ...t.contact, intro: copy.contactIntro }}
              privacyHref={localePath(lang, "/privacy")}
            />
          </Reveal>
        </div>
      </section>
    </>
  );
}
