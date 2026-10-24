import { JetBrains_Mono, Manrope, Space_Grotesk, Unbounded } from "next/font/google";

/**
 * Fonts are downloaded at BUILD time and served from our own domain.
 * This matters legally as well as technically: dynamically embedding Google
 * Fonts sends every visitor's IP address to Google, which German courts have
 * held to be a GDPR violation. With next/font, the browser never contacts
 * Google at all.
 */
const display = Unbounded({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const sans = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

/**
 * Space Grotesk has no Cyrillic glyphs. Manrope sits right after it in the
 * Tailwind `sans` stack, so Russian characters fall back to it while Latin
 * text keeps Space Grotesk.
 */
const sansCyrillic = Manrope({
  subsets: ["cyrillic"],
  weight: ["400", "500", "600"],
  variable: "--font-sans-cyr",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

/** CSS variables for every font, applied on <html> by both root layouts. */
export const fontVariables = [display, sans, sansCyrillic, mono].map((f) => f.variable).join(" ");
