import { afterEach, describe, expect, it, vi } from "vitest";

// LEGAL reads the environment when the module loads, so each case imports a fresh copy.
async function loadLegal(env: Record<string, string | undefined>) {
  vi.resetModules();
  for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value as string);
  return (await import("@/lib/legal")).LEGAL;
}

afterEach(() => vi.unstubAllEnvs());

describe("LEGAL", () => {
  it("splits the address on | and tolerates an escaped \\|", async () => {
    expect((await loadLegal({ LEGAL_ADDRESS: "Street 1|12345 City|Germany" })).address).toEqual([
      "Street 1",
      "12345 City",
      "Germany",
    ]);
    expect((await loadLegal({ LEGAL_ADDRESS: "Street 1\\|12345 City \\| Germany" })).address).toEqual([
      "Street 1",
      "12345 City",
      "Germany",
    ]);
  });

  it("shows visible placeholders and hides optional rows when nothing is configured", async () => {
    const legal = await loadLegal({ LEGAL_NAME: "", LEGAL_ADDRESS: "", LEGAL_EMAIL: "", LEGAL_PHONE: "" });
    expect(legal.name).toBe("[LEGAL_NAME]");
    expect(legal.address).toEqual(["[LEGAL_ADDRESS]"]);
    expect(legal.phone).toBeNull();
  });
});
