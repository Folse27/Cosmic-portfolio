import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { projects, siteSettings, type Project, type SiteSettings } from "@/db/schema";

/**
 * Fallback content used before the database has been seeded, so the site
 * renders (with obvious placeholders) even on a completely fresh setup.
 */
export const DEFAULT_SETTINGS: SiteSettings = {
  id: "singleton",
  name: "[YOUR NAME]",
  title: "[YOUR TITLE / TAGLINE]",
  tagline: "Placeholder tagline — run `npm run db:seed`, then edit everything in /admin.",
  bio: "Placeholder bio. Sign in at /admin and open Settings to replace this text.",
  profileImage: null,
  email: null,
  metaDescription: "Personal portfolio — automation and web development projects.",
  skills: [],
  socials: [],
  updatedAt: new Date(),
};

export async function getSettings(): Promise<SiteSettings> {
  try {
    const rows = await db.select().from(siteSettings).where(eq(siteSettings.id, "singleton")).limit(1);
    return rows[0] ?? DEFAULT_SETTINGS;
  } catch {
    // Database unreachable / not migrated yet — keep the public site alive.
    return DEFAULT_SETTINGS;
  }
}

export async function getPublishedProjects(): Promise<Project[]> {
  try {
    return await db
      .select()
      .from(projects)
      .where(eq(projects.published, true))
      .orderBy(asc(projects.sortOrder), asc(projects.createdAt));
  } catch {
    return [];
  }
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const rows = await db.select().from(projects).where(eq(projects.slug, slug)).limit(1);
  const project = rows[0];
  if (!project || !project.published) return null;
  return project;
}

/** "Automated WhatsApp CRM Pipeline" → "automated-whatsapp-crm-pipeline" */
export function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "project"
  );
}
