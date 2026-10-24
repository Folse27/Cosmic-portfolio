import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/Legal";
import { getDict, localePath, type Locale } from "@/lib/i18n";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Legal Notice (Impressum)",
  description: "Provider identification pursuant to § 5 DDG.",
  alternates: { canonical: "/impressum" },
};

/**
 * Impressum / Legal Notice — required for commercially-oriented websites in
 * Germany under § 5 DDG (which replaced § 5 TMG in May 2024).
 * Must be reachable from every page; the footer link handles that.
 */
export default async function ImpressumPage({ params }: { params: Promise<{ lang: string }> }) {
  // The [lang] layout has already rejected unknown languages.
  const lang = (await params).lang as Locale;
  const t = getDict(lang).legal;
  return (
    <LegalPage kicker={t.impressumKicker} title="Legal Notice" note={t.englishOnly}>
      <LegalSection heading="Provider identification pursuant to § 5 DDG">
        <p className="text-gray-300">{LEGAL.name}</p>
        <div>
          {LEGAL.address.map((line) => (
            <p key={line} className="text-gray-300">{line}</p>
          ))}
        </div>
      </LegalSection>

      <LegalSection heading="Contact">
        <p>
          Email:{" "}
          <a href={`mailto:${LEGAL.email}`} className="text-crimson-bright transition-colors hover:underline">
            {LEGAL.email}
          </a>
        </p>
        {LEGAL.phone && <p>Phone: {LEGAL.phone}</p>}
      </LegalSection>

      {LEGAL.vatId && (
        <LegalSection heading="VAT identification number">
          <p>VAT ID pursuant to § 27 a UStG: {LEGAL.vatId}</p>
        </LegalSection>
      )}

      <LegalSection heading="Responsible for content">
        <p>{LEGAL.name}, at the address above.</p>
      </LegalSection>

      <LegalSection heading="Consumer dispute resolution">
        <p>
          I am neither willing nor obliged to participate in dispute resolution proceedings before a
          consumer arbitration board (Verbraucherschlichtungsstelle).
        </p>
      </LegalSection>

      <LegalSection heading="Liability for links">
        <p>
          This site may contain links to external websites. I have no influence over their content and
          accept no responsibility for it. Responsibility for the content of linked pages always lies with
          their respective provider or operator. Should I become aware of any legal infringement, I will
          remove the link promptly.
        </p>
      </LegalSection>

      <LegalSection heading="Copyright">
        <p>
          The content and works on this site are subject to German copyright law. Reproduction, adaptation,
          distribution or any form of exploitation beyond the limits of copyright require written consent.
        </p>
      </LegalSection>

      <p className="border-t border-white/5 pt-8 font-mono text-xs text-gray-500">
        See also the{" "}
        <Link href={localePath(lang, "/privacy")} className="text-crimson-bright transition-colors hover:underline">
          Privacy Policy
        </Link>
        .
      </p>
    </LegalPage>
  );
}
