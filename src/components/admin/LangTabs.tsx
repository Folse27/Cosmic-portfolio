"use client";

import { LOCALES, type Locale } from "@/lib/i18n";

/** Order in the admin: English first, because it is the base every language falls back to. */
export const EDIT_LOCALES: Locale[] = ["en", ...LOCALES.filter((l) => l !== "en")];

/**
 * Sticky language switch for CMS forms. Fields marked with the language
 * badge change with the tab; everything else is shared by all languages.
 * A dot marks a language that still has empty fields (they fall back to English).
 */
export function LangTabs({
  value,
  onChange,
  incomplete,
}: {
  value: Locale;
  onChange: (lang: Locale) => void;
  incomplete: Partial<Record<Locale, boolean>>;
}) {
  return (
    <div className="sticky top-0 z-10 -mx-2 flex flex-wrap items-center gap-3 bg-void/90 px-2 py-3 backdrop-blur">
      <div className="flex gap-1 rounded-lg border border-white/10 p-1">
        {EDIT_LOCALES.map((lang) => (
          <button
            key={lang}
            type="button"
            onClick={() => onChange(lang)}
            className={`relative rounded-md px-3 py-1 font-mono text-xs uppercase tracking-wider transition-colors ${
              value === lang ? "bg-crimson/20 text-crimson-bright" : "text-gray-400 hover:text-white"
            }`}
          >
            {lang}
            {incomplete[lang] && (
              <span className="absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-yellow-500" title="Some fields are empty" />
            )}
          </button>
        ))}
      </div>
      <p className="font-mono text-[11px] text-gray-500">
        {value === "en"
          ? "English is the base text. Empty DE / RU fields fall back to it."
          : "Grey placeholder = English text, used while the field is empty."}
      </p>
    </div>
  );
}

/** Small badge after a label, so it is obvious which fields follow the tab. */
export function LangBadge({ lang }: { lang: Locale }) {
  return <span className="ml-1.5 rounded bg-crimson/15 px-1 text-crimson-text">{lang}</span>;
}
