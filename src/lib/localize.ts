import type { Project, ProjectText, SettingsText, SiteSettings, Translations } from "@/db/schema";
import { TRANSLATED_LOCALES, type Locale } from "@/lib/i18n";

/* ── Reading: overlay a language onto the English base ────────────────── */

/** Copies only the translated fields that are actually filled in. */
function filled<T extends object>(tr: Partial<T> | undefined): Partial<T> {
  if (!tr) return {};
  return Object.fromEntries(
    Object.entries(tr).filter(([, v]) => (Array.isArray(v) ? v.length > 0 : typeof v === "string" && v.trim() !== "")),
  ) as Partial<T>;
}

export function localizeSettings(s: SiteSettings, lang: Locale): SiteSettings {
  return lang === "en" ? s : { ...s, ...filled<SettingsText>(s.translations?.[lang]) };
}

export function localizeProject(p: Project, lang: Locale): Project {
  return lang === "en" ? p : { ...p, ...filled<ProjectText>(p.translations?.[lang]) };
}

/* ── Writing: validate a translations object from an admin request ────── */

type FieldSpec = { list?: false; max: number } | { list: true; maxItems: number; maxLen: number };

/** Same caps as the English base fields. */
export const SETTINGS_TEXT_SPEC: Record<keyof SettingsText, FieldSpec> = {
  title: { max: 200 },
  tagline: { max: 500 },
  bio: { max: 20000 },
  metaDescription: { max: 300 },
  skills: { list: true, maxItems: 60, maxLen: 60 },
};

export const PROJECT_TEXT_SPEC: Record<keyof ProjectText, FieldSpec> = {
  title: { max: 200 },
  summary: { max: 600 },
  description: { max: 20000 },
  problems: { list: true, maxItems: 100, maxLen: 20000 },
  solution: { max: 20000 },
  outcomes: { list: true, maxItems: 100, maxLen: 20000 },
  note: { max: 4000 },
  tags: { list: true, maxItems: 30, maxLen: 40 },
};

/** Keeps only known languages and fields, caps lengths, drops empty values. */
export function sanitizeTranslations<T>(v: unknown, spec: Record<keyof T, FieldSpec>): Translations<T> {
  const out: Translations<T> = {};
  if (!v || typeof v !== "object") return out;

  for (const lang of TRANSLATED_LOCALES) {
    const src = (v as Record<string, unknown>)[lang];
    if (!src || typeof src !== "object") continue;

    const fields: Record<string, string | string[]> = {};
    for (const [key, rule] of Object.entries(spec) as [string, FieldSpec][]) {
      const raw = (src as Record<string, unknown>)[key];
      if (rule.list) {
        const items = Array.isArray(raw)
          ? raw
              .filter((x): x is string => typeof x === "string" && !!x.trim())
              .map((x) => x.trim().slice(0, rule.maxLen))
              .slice(0, rule.maxItems)
          : [];
        if (items.length) fields[key] = items;
      } else if (typeof raw === "string" && raw.trim()) {
        fields[key] = raw.trim().slice(0, rule.max);
      }
    }
    if (Object.keys(fields).length) out[lang] = fields as Partial<T>;
  }
  return out;
}
