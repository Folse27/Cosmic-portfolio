import { describe, expect, it } from "vitest";
import type { Project, ProjectText } from "@/db/schema";
import { localizeProject, PROJECT_TEXT_SPEC, sanitizeTranslations } from "@/lib/localize";

const project = {
  title: "English title",
  summary: "English summary",
  tags: ["Telegram", "Automation"],
  dateLabel: "01.05.2026 – 05.07.2026",
  translations: {
    de: { title: "Deutscher Titel", summary: "   ", tags: [] },
  },
} as unknown as Project;

describe("localizeProject", () => {
  it("returns English untouched", () => {
    expect(localizeProject(project, "en")).toBe(project);
  });

  it("overlays filled translated fields and falls back to English for empty ones", () => {
    const de = localizeProject(project, "de");
    expect(de.title).toBe("Deutscher Titel");
    expect(de.summary).toBe("English summary"); // whitespace only → fallback
    expect(de.tags).toEqual(["Telegram", "Automation"]); // empty list → fallback
    expect(de.dateLabel).toBe("01.05.2026 – 05.07.2026"); // never translated → fallback
  });

  it("falls back completely for a language without translations", () => {
    expect(localizeProject(project, "ru").title).toBe("English title");
  });
});

describe("sanitizeTranslations", () => {
  it("keeps only known languages and fields", () => {
    const out = sanitizeTranslations<ProjectText>(
      { de: { title: "Titel", evil: "x" }, xx: { title: "nope" }, en: { title: "base lives elsewhere" } },
      PROJECT_TEXT_SPEC,
    );
    expect(out).toEqual({ de: { title: "Titel" } });
  });

  it("trims, caps lengths and drops empty values and list items", () => {
    const out = sanitizeTranslations<ProjectText>(
      { ru: { title: "  Заголовок  ", note: "   ", tags: ["a".repeat(50), " ", "ok"], dateLabel: "x".repeat(100) } },
      PROJECT_TEXT_SPEC,
    );
    expect(out.ru?.title).toBe("Заголовок");
    expect(out.ru?.note).toBeUndefined();
    expect(out.ru?.tags).toEqual(["a".repeat(40), "ok"]);
    expect(out.ru?.dateLabel).toHaveLength(60);
  });

  it("returns an empty object for garbage input", () => {
    expect(sanitizeTranslations<ProjectText>("nope", PROJECT_TEXT_SPEC)).toEqual({});
    expect(sanitizeTranslations<ProjectText>(null, PROJECT_TEXT_SPEC)).toEqual({});
  });
});
