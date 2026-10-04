import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import { getSettings } from "@/lib/data";
import { OG_IMAGE, SITE_URL } from "@/lib/site-url";

// Content is CMS-managed, so render per-request instead of at build time.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const title = `${settings.name} — Portfolio`;
  const description = settings.metaDescription || settings.tagline;

  return {
    // Everything below may use relative URLs; Next resolves them against this.
    metadataBase: new URL(SITE_URL),
    title,
    description,
    // Correct for the homepage. Every other route overrides it in its own
    // metadata — an inherited canonical would tell Google those pages are
    // duplicates of the homepage.
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      url: "/",
      siteName: settings.name,
      title,
      description,
      locale: "en_US",
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

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return (
    <>
      <Nav name={settings.navName || settings.name} />
      <main>{children}</main>
      <Footer name={settings.name} />
    </>
  );
}
