import type { LinkItem } from "@/db/schema";

const str = (v: unknown, max = 20000) => (typeof v === "string" ? v.slice(0, max) : "");
const strOrNull = (v: unknown, max = 2000) =>
  typeof v === "string" && v.trim() ? v.slice(0, max) : null;
const strArray = (v: unknown, max = 100) =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && !!x.trim()).slice(0, max) : [];

function linkArray(v: unknown): LinkItem[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter(
      (x): x is LinkItem =>
        !!x && typeof x === "object" && typeof (x as LinkItem).label === "string" && typeof (x as LinkItem).url === "string",
    )
    .map((x) => ({ label: x.label.slice(0, 120), url: x.url.slice(0, 1000) }))
    .slice(0, 30);
}

/**
 * Normalizes a project create/update body: every field is validated and
 * length-capped, unknown keys are dropped. Slug and sortOrder are handled
 * separately by the routes.
 */
export function projectPayload(body: Record<string, unknown>) {
  return {
    title: str(body.title, 200).trim(),
    dateLabel: strOrNull(body.dateLabel, 60),
    summary: str(body.summary, 600).trim(),
    description: str(body.description).trim(),
    problems: strArray(body.problems),
    solution: str(body.solution).trim(),
    outcomes: strArray(body.outcomes),
    note: strOrNull(body.note, 4000),
    coverImage: strOrNull(body.coverImage, 1000),
    gallery: strArray(body.gallery, 60),
    tags: strArray(body.tags, 30).map((t) => t.slice(0, 40)),
    links: linkArray(body.links),
    published: body.published !== false,
  };
}
