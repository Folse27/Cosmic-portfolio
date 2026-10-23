export const LEGAL = {
  /** Your full legal name. */
  name: "Roman Plavniev",

  /** Summonable postal address, one line per row. */
  address: [
    "Street 1",
    "12345 City",
    "Germany",
  ],

  /** Must be a real, monitored address — automated-reply-only is not allowed. */
  email: "you@example.com",

  /**
   * Optional but recommended: German law expects you to be reachable
   * "quickly and directly". Email alone is usually accepted, but a phone
   * number is safer. Leave as null to hide the row entirely.
   */
  phone: "+49 000 0000000" as string | null,

  /**
   * VAT ID (Umsatzsteuer-Identifikationsnummer), if you have one.
   * Leave null if you are not VAT-registered.
   */
  vatId: null as string | null,

  /**
   * Your competent data protection supervisory authority — this depends on
   * the federal state you live in. For North Rhine-Westphalia it is the
   * LDI NRW (shown below). Change it if you live in a different state.
   */
  supervisoryAuthority: {
    name: "Landesbeauftragte für Datenschutz und Informationsfreiheit Nordrhein-Westfalen (LDI NRW)",
    url: "https://www.ldi.nrw.de",
  },

  /** Date this policy was last reviewed — update it when you change anything. */
  lastUpdated: "October 2026",
} as const;

