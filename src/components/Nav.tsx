import Link from "next/link";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { localePath, type Dict, type Locale } from "@/lib/i18n";

/** Shown until a logo is uploaded in /admin → Settings: a small planet with an orbit ring. */
function PlaceholderLogo() {
  return (
    <svg viewBox="0 0 40 40" className="h-9 w-9" aria-hidden="true">
      <defs>
        <radialGradient id="logo-planet" cx="35%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#ff4d5e" />
          <stop offset="100%" stopColor="#7a0f1c" />
        </radialGradient>
      </defs>
      <ellipse cx="20" cy="20" rx="17" ry="6.5" fill="none" stroke="#8b8f9c" strokeWidth="1.2" transform="rotate(-20 20 20)" />
      <circle cx="20" cy="20" r="8" fill="url(#logo-planet)" />
      {/* Front half of the ring, drawn over the planet. */}
      <path d="M4.03 25.81 A17 6.5 -20 0 0 35.97 14.19" fill="none" stroke="#c9ccd4" strokeWidth="1.2" />
    </svg>
  );
}

export default function Nav({
  logo,
  logoAlt,
  lang,
  labels,
}: {
  logo: string | null;
  logoAlt: string;
  lang: Locale;
  labels: Dict["nav"];
}) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-void/70 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-site items-center justify-between px-6">
        <Link
          href={localePath(lang, "/")}
          aria-label={logoAlt}
          className="flex items-center transition-opacity hover:opacity-80"
        >
          {logo ? (
            <img src={logo} alt={logoAlt} className="h-9 w-auto max-w-[160px] object-contain" />
          ) : (
            <PlaceholderLogo />
          )}
        </Link>
        <div className="flex items-center gap-6 font-mono text-xs uppercase tracking-wider text-gray-400">
          <Link href={localePath(lang, "/#about")} className="hidden transition-colors hover:text-white sm:block">{labels.about}</Link>
          <Link href={localePath(lang, "/#projects")} className="hidden transition-colors hover:text-white sm:block">{labels.projects}</Link>
          <Link href={localePath(lang, "/#contact")} className="transition-colors hover:text-crimson-bright">{labels.contact}</Link>
          <span className="h-4 w-px bg-white/10" aria-hidden="true" />
          <LanguageSwitcher lang={lang} label={labels.language} />
        </div>
      </nav>
    </header>
  );
}
