"use client";

import Link from "next/link";
import type { Project } from "@/db/schema";
import { trackClick } from "@/lib/track";

/** Cover fallback when a project has no image: a quiet cosmic gradient. */
function PlaceholderCover({ index }: { index: number }) {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[radial-gradient(120%_120%_at_20%_0%,#1a0a10_0%,#0a0a0d_45%,#050506_100%)]">
      <div className="absolute -right-10 -top-14 h-44 w-44 rounded-full bg-crimson/15 blur-3xl" />
      <svg viewBox="0 0 100 60" className="absolute inset-0 h-full w-full opacity-30">
        <ellipse cx="50" cy="32" rx="42" ry="12" fill="none" stroke="#e11d33" strokeWidth="0.4" transform="rotate(-10 50 32)" />
        <ellipse cx="50" cy="32" rx="30" ry="8" fill="none" stroke="#8b8f9c" strokeWidth="0.3" transform="rotate(-10 50 32)" />
      </svg>
      <span className="font-mono text-4xl text-white/15">{String(index + 1).padStart(2, "0")}</span>
    </div>
  );
}

export default function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      onClick={() => trackClick(`project-card:${project.slug}`)}
      className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-panel transition-all duration-300 hover:-translate-y-1 hover:border-crimson/50 hover:shadow-glow"
    >
      <div className="aspect-[16/10] w-full overflow-hidden border-b border-white/5">
        {project.coverImage ? (
          <img
            src={project.coverImage}
            alt={project.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <PlaceholderCover index={index} />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6">
        {project.dateLabel && (
          <p className="font-mono text-[11px] uppercase tracking-widest text-crimson-text">{project.dateLabel}</p>
        )}
        <h3 className="font-display text-lg leading-snug text-white transition-colors group-hover:text-crimson-bright">
          {project.title}
        </h3>
        <p className="line-clamp-3 text-sm leading-relaxed text-gray-400">{project.summary}</p>

        <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
          {project.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="chip">{tag}</span>
          ))}
        </div>

        <span className="pt-1 font-mono text-xs text-gray-500 transition-colors group-hover:text-crimson-bright">
          See how it works <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
        </span>
      </div>
    </Link>
  );
}
