import type { Metadata } from "next";
import { JetBrains_Mono, Space_Grotesk, Unbounded } from "next/font/google";
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
  subsets: ["latin"],
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

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Automation & web development portfolio.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body>
        {/* Records a "view" event on every route change (admin excluded). */}
        <AnalyticsTracker />
        {children}
      </body>
    </html>
  );
}
