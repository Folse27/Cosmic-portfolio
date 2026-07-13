import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import { getSettings } from "@/lib/data";

// Content is CMS-managed, so render per-request instead of at build time.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: `${settings.name} — Portfolio`,
    description: settings.metaDescription || settings.tagline,
  };
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return (
    <>
      <Nav name={settings.name} />
      <main>{children}</main>
      <Footer name={settings.name} />
    </>
  );
}
