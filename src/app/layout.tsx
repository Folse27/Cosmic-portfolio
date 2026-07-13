import type { Metadata } from "next";
import "./globals.css";
import AnalyticsTracker from "@/components/AnalyticsTracker";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Automation & web development portfolio.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Records a "view" event on every route change (admin excluded). */}
        <AnalyticsTracker />
        {children}
      </body>
    </html>
  );
}
