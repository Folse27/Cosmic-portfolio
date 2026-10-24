import { describe, expect, it } from "vitest";
import { projectPayload } from "@/lib/project-payload";

describe("projectPayload", () => {
  it("accepts a price typed in the form as text", () => {
    const p = projectPayload({ title: "x", priceAmount: "800", priceType: "from" });
    expect(p.priceAmount).toBe(800);
    expect(p.priceType).toBe("from");
  });

  it("drops invalid amounts together with their type", () => {
    for (const priceAmount of ["", "-5", "abc", 1.5, 0, 2_000_000]) {
      const p = projectPayload({ title: "x", priceAmount, priceType: "hourly" });
      expect(p.priceAmount).toBeNull();
      expect(p.priceType).toBeNull();
    }
  });

  it("falls back to 'from' for an unknown price type", () => {
    expect(projectPayload({ title: "x", priceAmount: 400, priceType: "weird" }).priceType).toBe("from");
  });

  it("drops unknown keys and keeps featured/published strictly boolean", () => {
    const p = projectPayload({ title: " T ", featured: "yes", published: false, isAdmin: true });
    expect(p.title).toBe("T");
    expect(p.featured).toBe(false);
    expect(p.published).toBe(false);
    expect("isAdmin" in p).toBe(false);
  });

  it("drops blank tags and list items", () => {
    const p = projectPayload({ title: "x", tags: ["a", " ", 3], problems: ["one", ""] });
    expect(p.tags).toEqual(["a"]);
    expect(p.problems).toEqual(["one"]);
  });
});
