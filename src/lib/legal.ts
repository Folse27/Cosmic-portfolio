export const LEGAL = {
  /** Your full legal name. */
  name: "Roman Plavniev",

  /**
   * Summonable postal address, one line per row.
   * Replace the placeholders with your real street and city.
   */
  address: [
    "Ludgeristraße 25",
    "47057 Duisurg",
    "Germany",
  ],

  /** Must be a real, monitored address — automated-reply-only is not allowed. */
  email: "romanplavniev@gmail.com",

  /**
   * Optional but recommended: German law expects you to be reachable
   * "quickly and directly". Email alone is usually accepted, but a phone
   * number is safer. Leave as null to hide the row entirely.
   */
  phone: +4916091996307,

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
  lastUpdated: "July 2026",
} as const;

/** True while the address still contains bracketed placeholders. */
export const ADDRESS_INCOMPLETE = LEGAL.address.some((line) => line.includes("["));
