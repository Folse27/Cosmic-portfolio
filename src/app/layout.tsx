import type { Metadata } from "next";
import { headers } from "next/headers";
import { JetBrains_Mono, Manrope, Space_Grotesk, Unbounded } from "next/font/google";
import "./globals.css";
import AnalyticsTracker from "@/components/AnalyticsTracker";

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

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Automation & web development portfolio.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Set by src/middleware.ts for public pages; the admin panel is English.
  const lang = (await headers()).get("x-locale") ?? "en";
  return (
    <html lang={lang} className={`${display.variable} ${sans.variable} ${sansCyrillic.variable} ${mono.variable}`}>
      <body>
        {/* Records a "view" event on every route change (admin excluded). */}
        <AnalyticsTracker />
        {children}
      </body>
    </html>
  );
}
