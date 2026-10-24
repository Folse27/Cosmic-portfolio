import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "../../globals.css";
import { fontVariables } from "../../fonts";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import { getSettings } from "@/lib/data";
import { getDict, isLocale, localeAlternates, localePath, LOCALES, OG_LOCALE } from "@/lib/i18n";
import { localizeSettings } from "@/lib/localize";
import { OG_IMAGE, SITE_URL } from "@/lib/site-url";

/**
 * Pages are rendered once and cached. Every admin save calls revalidateSite()
 * (src/lib/revalidate.ts), so edits are live immediately; the hourly
 * revalidation is only a safety net.
 */
export const revalidate = 3600;

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const settings = localizeSettings(await getSettings(), lang);
  const title = `${settings.name} — ${getDict(lang).meta.portfolio}`;
  const description = settings.metaDescription || settings.tagline;

  return {
    // Everything below may use relative URLs; Next resolves them against this.
    metadataBase: new URL(SITE_URL),
    title,
    description,
    // Correct for the homepage. Every other route overrides it in its own
    // metadata — an inherited canonical would tell Google those pages are
    // duplicates of the homepage.
    alternates: localeAlternates(lang, "/"),
    openGraph: {
      type: "website",
      url: localePath(lang, "/"),
      siteName: settings.name,
      title,
      description,
      locale: OG_LOCALE[lang],
      alternateLocale: LOCALES.filter((l) => l !== lang).map((l) => OG_LOCALE[l]),
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE],
    },
  };
}

export default async function SiteLayout({ children, params }: Props & { children: React.ReactNode }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const settings = await getSettings();
  const dict = getDict(lang);
  return (
    <html lang={lang} className={fontVariables}>
      <body>
        {/* Records a "view" event on every route change. */}
        <AnalyticsTracker />
        <Nav logo={settings.logoImage} logoAlt={settings.navName || settings.name} lang={lang} labels={dict.nav} />
        <main>{children}</main>
        <Footer name={settings.name} lang={lang} labels={dict.footer} />
      </body>
    </html>
  );
}
