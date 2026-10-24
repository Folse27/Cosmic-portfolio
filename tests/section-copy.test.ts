import { describe, expect, it } from "vitest";
import { defaultSectionCopy, resolveSectionCopy, sanitizeSectionCopy } from "@/lib/section-copy";

describe("resolveSectionCopy", () => {
  it("uses the built-in texts when nothing is saved", () => {
    expect(resolveSectionCopy({ sectionCopy: {} }, "de")).toEqual(defaultSectionCopy("de"));
  });

  it("uses saved fields and falls back per field and per language", () => {
    const settings = {
      sectionCopy: { de: { contactTitle: "Eigene Überschrift", contactIntro: "  ", dataPoints: [] } },
    };
    const de = resolveSectionCopy(settings, "de");
    expect(de.contactTitle).toBe("Eigene Überschrift");
    expect(de.contactIntro).toBe(defaultSectionCopy("de").contactIntro);
    expect(de.dataPoints).toEqual(defaultSectionCopy("de").dataPoints); // no boxes → built-in boxes
    expect(resolveSectionCopy(settings, "ru")).toEqual(defaultSectionCopy("ru"));
  });
});

describe("sanitizeSectionCopy", () => {
  it("drops unknown languages, empty boxes and caps the number of boxes", () => {
    const boxes = Array.from({ length: 20 }, (_, i) => ({ title: `Box ${i}`, text: "t" }));
    const out = sanitizeSectionCopy({
      xx: { dataTitle: "nope" },
      en: { dataTitle: "  Heading  ", dataPoints: [{ title: "", text: " " }, ...boxes] },
    });
    expect(Object.keys(out)).toEqual(["en"]);
    expect(out.en?.dataTitle).toBe("Heading");
    expect(out.en?.dataPoints).toHaveLength(12);
    expect(out.en?.dataPoints?.[0].title).toBe("Box 0");
  });
});
