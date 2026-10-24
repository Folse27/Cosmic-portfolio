import { describe, expect, it } from "vitest";
import { formatPrice, localeAlternates, localePath, splitLocale } from "@/lib/i18n";

// Intl separates the amount and "€" with non-breaking spaces; compare with plain ones.
const plain = (s: string | null) => s?.replace(/[  ]/g, " ") ?? null;

describe("localePath", () => {
  it("keeps German URLs unprefixed", () => {
    expect(localePath("de", "/")).toBe("/");
    expect(localePath("de", "/projects/x")).toBe("/projects/x");
  });

  it("prefixes other languages, including the home page and hash links", () => {
    expect(localePath("en", "/")).toBe("/en");
    expect(localePath("ru", "/projects/x")).toBe("/ru/projects/x");
    expect(localePath("en", "/#contact")).toBe("/en#contact");
  });
});

describe("splitLocale", () => {
  it("reads the language from the first path segment", () => {
    expect(splitLocale("/en/projects/x")).toEqual({ lang: "en", path: "/projects/x" });
    expect(splitLocale("/ru")).toEqual({ lang: "ru", path: "/" });
  });

  it("treats unprefixed paths as German", () => {
    expect(splitLocale("/projects/x")).toEqual({ lang: "de", path: "/projects/x" });
  });

  it("strips the internal /de prefix of cached German pages", () => {
    expect(splitLocale("/de/privacy")).toEqual({ lang: "de", path: "/privacy" });
    expect(splitLocale("/de")).toEqual({ lang: "de", path: "/" });
  });

  it("is the inverse of localePath", () => {
    for (const lang of ["de", "en", "ru"] as const) {
      expect(splitLocale(localePath(lang, "/projects/x"))).toEqual({ lang, path: "/projects/x" });
    }
  });
});

describe("localeAlternates", () => {
  it("lists every language plus x-default and a canonical for the current one", () => {
    const alt = localeAlternates("en", "/projects/x");
    expect(alt.canonical).toBe("/en/projects/x");
    expect(alt.languages).toEqual({
      "x-default": "/projects/x",
      de: "/projects/x",
      en: "/en/projects/x",
      ru: "/ru/projects/x",
    });
  });
});

describe("formatPrice", () => {
  it("writes prices the way each language expects", () => {
    expect(plain(formatPrice("de", 1500, "from"))).toBe("ab 1.500 €");
    expect(plain(formatPrice("ru", 1500, "from"))).toBe("от 1 500 €");
    expect(plain(formatPrice("en", 1500, "from"))).toBe("from €1,500");
    expect(plain(formatPrice("de", 25, "hourly"))).toBe("25 € pro Stunde");
    expect(plain(formatPrice("en", 300, "fixed"))).toBe("€300");
  });

  it("returns null without an amount", () => {
    expect(formatPrice("de", null, "from")).toBeNull();
  });
});
