import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection, PlaceholderWarning } from "@/components/Legal";
import { ADDRESS_INCOMPLETE, LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How this website handles personal data, pursuant to Art. 13 GDPR.",
};

/**
 * Privacy Policy (Datenschutzerklärung) — required by Art. 13 GDPR.
 * The content below describes what this site ACTUALLY does:
 *   • cookie-free, first-party analytics (no IPs, no personal data)
 *   • a contact form (name, email, message)
 *   • an admin session cookie, used only by the site owner
 *   • self-hosted fonts (nothing is requested from Google at page load)
 * If you add third-party services later (Google Analytics, embeds, a
 * newsletter…), this page must be updated to match.
 */
export default function PrivacyPage() {
  return (
    <LegalPage kicker="Datenschutzerklärung" title="Privacy Policy">
      {ADDRESS_INCOMPLETE && (
        <PlaceholderWarning>
          The controller&apos;s postal address is still a placeholder. Art. 13 GDPR requires you to identify
          yourself as the data controller. Fill it in at{" "}
          <code className="text-yellow-400">src/lib/legal.ts</code> before sharing this site publicly.
        </PlaceholderWarning>
      )}

      <LegalSection heading="1. Controller">
        <p>The party responsible for data processing on this website is:</p>
        <p className="text-gray-300">{LEGAL.name}</p>
        <div>
          {LEGAL.address.map((line) => (
            <p key={line} className="text-gray-300">{line}</p>
          ))}
        </div>
        <p>
          Email:{" "}
          <a href={`mailto:${LEGAL.email}`} className="text-crimson-bright transition-colors hover:underline">
            {LEGAL.email}
          </a>
        </p>
      </LegalSection>

      <LegalSection heading="2. Overview — the short version">
        <p>
          This site is deliberately built to collect as little as possible. It sets no tracking cookies,
          uses no third-party analytics or advertising services, and loads no external fonts, embeds or
          scripts. The only personal data you actively give me is what you type into the contact form.
        </p>
      </LegalSection>

      <LegalSection heading="3. Server log files">
        <p>
          When you open this site, your browser automatically transmits technical information to the
          hosting provider&apos;s servers. This includes your IP address, the requested page, the date and
          time of the request, and your browser and operating system. This is technically unavoidable for
          any website and is necessary to deliver the pages to you and to protect the service against
          attacks and abuse.
        </p>
        <p>
          <span className="text-gray-300">Legal basis:</span> Art. 6(1)(f) GDPR — my legitimate interest in
          the secure, stable and functional delivery of this website.
        </p>
        <p>
          <span className="text-gray-300">Retention:</span> these logs are generated and retained by the
          hosting provider (see section 7) for a short period and are not merged with other data or used to
          identify you.
        </p>
      </LegalSection>

      <LegalSection heading="4. Contact form">
        <p>
          If you use the contact form, the details you enter — your <span className="text-gray-300">name</span>,{" "}
          <span className="text-gray-300">email address</span> and{" "}
          <span className="text-gray-300">message</span> — are stored in this site&apos;s database so that I
          can read and answer your enquiry. Providing this data is voluntary, but without it I cannot reply
          to you. The data is not passed on to any third party and is not used for advertising.
        </p>
        <p>
          <span className="text-gray-300">Legal basis:</span> Art. 6(1)(b) GDPR where your message concerns
          a potential contract or engagement, and otherwise Art. 6(1)(f) GDPR — my legitimate interest in
          responding to enquiries addressed to me.
        </p>
        <p>
          <span className="text-gray-300">Retention:</span> your message is kept as long as it is needed to
          handle your enquiry and any follow-up, and is deleted thereafter — at the latest 24 months after
          our last contact — unless statutory retention obligations apply. You may ask me to delete it at any
          time (see section 9).
        </p>
      </LegalSection>

      <LegalSection heading="5. Analytics">
        <p>
          To understand which projects visitors find interesting, this site counts page views and clicks
          using its own, self-hosted measurement — not Google Analytics or any other external service. No
          data leaves my own database, and nothing is shared with anyone.
        </p>
        <p>For each page view or click, exactly four things are recorded:</p>
        <ul className="ml-1 space-y-1.5">
          {[
            "whether the event was a page view or a click",
            "which page it happened on",
            "which element was clicked (e.g. \"project card\", \"contact button\")",
            "the date and time",
          ].map((item) => (
            <li key={item} className="flex gap-3">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-crimson" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p>
          <span className="text-gray-300">No cookies are set, and no IP address, browser fingerprint,
          device identifier or any other personal identifier is stored.</span>{" "}
          The records cannot be linked to you or to each other, so they do not constitute personal data.
          They are pure, anonymous counters.
        </p>
        <p>
          <span className="text-gray-300">Legal basis:</span> Art. 6(1)(f) GDPR — my legitimate interest in
          understanding, in aggregate, how my portfolio is used. Because the measurement neither accesses nor
          stores information on your device, it does not require consent under § 25 TDDDG.
        </p>
      </LegalSection>

      <LegalSection heading="6. Cookies">
        <p>
          This website sets <span className="text-gray-300">no tracking, advertising or analytics
          cookies</span>, which is why you see no cookie banner.
        </p>
        <p>
          A single cookie exists: a login session cookie for the private admin area, which is set{" "}
          <span className="text-gray-300">only when the site owner signs in</span> to manage content. It is
          strictly necessary for the login to function and is therefore exempt from consent under
          § 25(2) TDDDG. As an ordinary visitor, you never receive it.
        </p>
      </LegalSection>

      <LegalSection heading="7. Hosting and processors">
        <p>I use the following service providers, who process data strictly on my instructions:</p>
        <ul className="ml-1 space-y-3">
          <li className="flex gap-3">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-crimson" />
            <span>
              <span className="text-gray-300">Vercel Inc.</span> — hosting and delivery of this website.
              Vercel processes the connection data described in section 3. Vercel is based in the USA;
              transfers are safeguarded by a data processing agreement incorporating the EU Standard
              Contractual Clauses.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-crimson" />
            <span>
              <span className="text-gray-300">Neon Inc.</span> — the database in which contact-form messages
              and the anonymous counters are stored. The database region is located in the EU. Transfers, where
              applicable, are safeguarded by a data processing agreement incorporating the EU Standard
              Contractual Clauses.
            </span>
          </li>
        </ul>
        <p className="font-mono text-xs text-gray-500">
          If you host or store data somewhere else, update this section to match reality.
        </p>
      </LegalSection>

      <LegalSection heading="8. Fonts">
        <p>
          The fonts used on this site are hosted on this site&apos;s own servers. Your browser makes{" "}
          <span className="text-gray-300">no connection to Google Fonts or any other external font
          provider</span>, and your IP address is therefore not transmitted to any such provider.
        </p>
      </LegalSection>

      <LegalSection heading="9. Your rights">
        <p>Under the GDPR you have the right, at any time and free of charge, to:</p>
        <ul className="ml-1 space-y-1.5">
          {[
            "Access (Art. 15) — obtain confirmation of whether I process data about you, and receive a copy.",
            "Rectification (Art. 16) — have inaccurate data corrected.",
            "Erasure (Art. 17) — have your data deleted.",
            "Restriction (Art. 18) — have processing limited.",
            "Data portability (Art. 20) — receive your data in a machine-readable format.",
            "Object (Art. 21) — object to processing based on legitimate interest, including the analytics described above.",
          ].map((item) => (
            <li key={item} className="flex gap-3">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-crimson" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p>
          To exercise any of these, simply email{" "}
          <a href={`mailto:${LEGAL.email}`} className="text-crimson-bright transition-colors hover:underline">
            {LEGAL.email}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection heading="10. Right to lodge a complaint">
        <p>
          If you believe that the processing of your data infringes the GDPR, you have the right to lodge a
          complaint with a supervisory authority, in particular in the EU member state of your residence,
          place of work, or the place of the alleged infringement. The authority competent for me is:
        </p>
        <p>
          <a
            href={LEGAL.supervisoryAuthority.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-crimson-bright transition-colors hover:underline"
          >
            {LEGAL.supervisoryAuthority.name}
          </a>
        </p>
      </LegalSection>

      <LegalSection heading="11. Automated decision-making">
        <p>
          This website does not use automated decision-making or profiling within the meaning of Art. 22 GDPR.
        </p>
      </LegalSection>

      <LegalSection heading="12. Changes to this policy">
        <p>
          I may update this policy to reflect changes to the site or to the legal situation. The version
          published here always applies.
        </p>
      </LegalSection>

      <p className="border-t border-white/5 pt-8 font-mono text-xs text-gray-500">
        Last updated: {LEGAL.lastUpdated} ·{" "}
        <Link href="/impressum" className="text-crimson-bright transition-colors hover:underline">
          Legal Notice
        </Link>
      </p>
    </LegalPage>
  );
}
