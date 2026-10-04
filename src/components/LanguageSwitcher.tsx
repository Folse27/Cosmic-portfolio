"use client";

import { usePathname } from "next/navigation";
import { LOCALES, localePath, splitLocale, type Locale } from "@/lib/i18n";

/**
 * DE · EN · RU — links to the current page in another language.
 * Plain anchors on purpose: a full load lets the root layout set the new
 * <html lang>, which client-side navigation would leave stale.
 */
export default function LanguageSwitcher({ lang, label }: { lang: Locale; label: string }) {
  const { path } = splitLocale(usePathname() ?? "/");

  return (
    <div role="group" aria-label={label} className="flex items-center gap-1.5">
      {LOCALES.map((l, i) => (
        <span key={l} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-gray-700">·</span>}
          {l === lang ? (
            <span aria-current="true" className="text-crimson-bright">{l}</span>
          ) : (
            <a href={localePath(l, path)} hrefLang={l} lang={l} className="transition-colors hover:text-white">
              {l}
            </a>
          )}
        </span>
      ))}
    </div>
  );
}
