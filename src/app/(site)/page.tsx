import ContactSection from "@/components/ContactSection";
import CosmicHero from "@/components/CosmicHero";
import ProjectCard from "@/components/ProjectCard";
import Reveal from "@/components/Reveal";
import TrackedLink from "@/components/TrackedLink";
import { getPublishedProjects, getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

/** Section heading: mono kicker + display title, consistent across the page. */
function SectionHeading({ kicker, title }: { kicker: string; title: string }) {
  return (
    <Reveal className="mb-12">
      <p className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-crimson-text">{kicker}</p>
      <h2 className="font-display text-3xl text-white md:text-4xl">{title}</h2>
    </Reveal>
  );
}

export default async function HomePage() {
  const [settings, projects] = await Promise.all([getSettings(), getPublishedProjects()]);
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
              <TrackedLink href="/#projects" trackId="cta:view-projects" className="btn-primary">
                View projects
              </TrackedLink>
              <TrackedLink href="/#contact" trackId="cta:contact" className="btn-ghost">
                Contact me
              </TrackedLink>
            </div>
          </Reveal>
        </div>

        <a
          href="#about"
          aria-label="Scroll to about section"
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
          <SectionHeading kicker="About" title="Behind the console" />
          <div className="grid items-start gap-12 md:grid-cols-[minmax(0,320px)_1fr]">
            <Reveal>
              <div className="relative mx-auto aspect-square w-full max-w-xs overflow-hidden rounded-2xl border border-white/10 bg-panel shadow-glow-sm">
                {settings.profileImage ? (
                  <img src={settings.profileImage} alt={settings.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-gray-500">
                    <div className="h-20 w-20 rounded-full border border-crimson/40 bg-crimson/10" />
                    <p className="px-6 text-center font-mono text-[11px] uppercase tracking-wider">
                      Profile photo — set it in /admin
                    </p>
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
                  <p className="label">Tech stack &amp; skills</p>
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
          <SectionHeading kicker="Selected work" title="Projects" />
          {projects.length === 0 ? (
            <p className="font-mono text-sm text-gray-500">
              No projects yet — run <code className="text-crimson-bright">npm run db:seed</code> or add one in /admin.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project, i) => (
                <Reveal key={project.id} delay={(i % 3) * 90}>
                  <ProjectCard project={project} index={i} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Contact ──────────────────────────────────────────────────── */}
      <section className="py-24 md:py-32">
        <div id="contact" className="anchor-target mx-auto max-w-site px-6">
          <SectionHeading kicker="Contact" title="Open a channel" />
          <Reveal>
            <ContactSection email={settings.email} socials={settings.socials} />
          </Reveal>
        </div>
      </section>
    </>
  );
}
