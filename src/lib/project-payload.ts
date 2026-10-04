import { PRICE_TYPES, type LinkItem, type PriceType, type ProjectText } from "@/db/schema";
import { PROJECT_TEXT_SPEC, sanitizeTranslations } from "@/lib/localize";

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

/** Whole euros, 1 – 1,000,000; anything else means "no price". */
function priceAmount(v: unknown): number | null {
  const n = typeof v === "string" && v.trim() ? Number(v) : v;
  return typeof n === "number" && Number.isInteger(n) && n > 0 && n <= 1_000_000 ? n : null;
}

/** A price needs an amount; its type defaults to "from" and is dropped without one. */
function price(body: Record<string, unknown>): { priceAmount: number | null; priceType: PriceType | null } {
  const amount = priceAmount(body.priceAmount);
  if (amount === null) return { priceAmount: null, priceType: null };
  const type = PRICE_TYPES.includes(body.priceType as PriceType) ? (body.priceType as PriceType) : "from";
  return { priceAmount: amount, priceType: type };
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
    ...price(body),
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
    translations: sanitizeTranslations<ProjectText>(body.translations, PROJECT_TEXT_SPEC),
    featured: body.featured === true,
    published: body.published !== false,
  };
}
