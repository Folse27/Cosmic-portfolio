/**
 * Provider details for the Impressum and the privacy policy.
 *
 * The personal details come from environment variables, so they live in the
 * hosting settings instead of the repository. scripts/check-env.ts fails the
 * production build when a required one is missing, so a deploy can never ship
 * the bracketed placeholders below.
 */
const env = (key: string) => process.env[key]?.trim() || null;

export const LEGAL = {
  /** Full legal name. */
  name: env("LEGAL_NAME") ?? "[LEGAL_NAME]",

  /** Summonable postal address; lines are separated by "|" (or "\|") in LEGAL_ADDRESS. */
  address: (env("LEGAL_ADDRESS") ?? "[LEGAL_ADDRESS]")
    .split(/\\?\|/)
    .map((line) => line.trim())
    .filter(Boolean),

  /** Must be a real, monitored address — automated-reply-only is not allowed. */
  email: env("LEGAL_EMAIL") ?? "[LEGAL_EMAIL]",

  /** Optional; the row is hidden when LEGAL_PHONE is not set. */
  phone: env("LEGAL_PHONE"),

  /** Optional VAT ID (Umsatzsteuer-Identifikationsnummer); hidden when not set. */
  vatId: env("LEGAL_VAT_ID"),

  /** Competent data protection authority — depends on the federal state (here: North Rhine-Westphalia). */
  supervisoryAuthority: {
    name: "Landesbeauftragte für Datenschutz und Informationsfreiheit Nordrhein-Westfalen (LDI NRW)",
    url: "https://www.ldi.nrw.de",
  },

  /** Date the privacy policy was last reviewed — update it when anything changes. */
  lastUpdated: "October 2026",
};
