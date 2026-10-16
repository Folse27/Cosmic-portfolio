import type { InfoBox, SectionCopy, SectionCopyByLang, SiteSettings } from "@/db/schema";
import { getDict, LOCALES, type Locale } from "@/lib/i18n";

/** The built-in texts from i18n.ts — what each section shows until it is edited in the admin. */
export function defaultSectionCopy(lang: Locale): SectionCopy {
  const t = getDict(lang);
  return {
    dataKicker: t.dataProtection.kicker,
    dataTitle: t.dataProtection.title,
    dataPoints: t.dataProtection.points.map((p) => ({ ...p })),
    contactKicker: t.contact.kicker,
    contactTitle: t.contact.title,
    contactIntro: t.contact.intro,
  };
}

/** Saved copy for one language, with every empty field filled from the built-in texts. */
export function resolveSectionCopy(settings: Pick<SiteSettings, "sectionCopy">, lang: Locale): SectionCopy {
  const saved = settings.sectionCopy?.[lang] ?? {};
  const base = defaultSectionCopy(lang);
  const text = (key: Exclude<keyof SectionCopy, "dataPoints">) => saved[key]?.trim() || base[key];
  return {
    dataKicker: text("dataKicker"),
    dataTitle: text("dataTitle"),
    dataPoints: saved.dataPoints?.length ? saved.dataPoints : base.dataPoints,
    contactKicker: text("contactKicker"),
    contactTitle: text("contactTitle"),
    contactIntro: text("contactIntro"),
  };
}

const MAX_BOXES = 12;
const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** Validates the admin payload: known languages and fields only, capped lengths, empty boxes dropped. */
export function sanitizeSectionCopy(v: unknown): SectionCopyByLang {
  const out: SectionCopyByLang = {};
  if (!v || typeof v !== "object") return out;

  for (const lang of LOCALES) {
    const src = (v as Record<string, unknown>)[lang];
    if (!src || typeof src !== "object") continue;
    const s = src as Record<string, unknown>;

    const dataPoints: InfoBox[] = Array.isArray(s.dataPoints)
      ? s.dataPoints
          .map((p) => ({ title: str((p as InfoBox)?.title, 120), text: str((p as InfoBox)?.text, 1000) }))
          .filter((p) => p.title || p.text)
          .slice(0, MAX_BOXES)
      : [];

    out[lang] = {
      dataKicker: str(s.dataKicker, 60),
      dataTitle: str(s.dataTitle, 200),
      dataPoints,
      contactKicker: str(s.contactKicker, 60),
      contactTitle: str(s.contactTitle, 200),
      contactIntro: str(s.contactIntro, 1000),
    };
  }
  return out;
}
