import type { Metadata } from "next";
import "../globals.css";
import { fontVariables } from "../fonts";

export const metadata: Metadata = {
  title: "Admin — Portfolio",
  robots: { index: false, follow: false },
};

/**
 * Root layout of the admin area (login + panel). The public site has its own
 * root layout in app/(site)/[lang], which sets <html lang> from the URL.
 */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
