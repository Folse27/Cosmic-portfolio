import Link from "next/link";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { localePath, type Dict, type Locale } from "@/lib/i18n";

export default function Nav({ name, lang, labels }: { name: string; lang: Locale; labels: Dict["nav"] }) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-void/70 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-site items-center justify-between px-6">
        <Link href={localePath(lang, "/")} className="font-mono text-sm tracking-widest text-gray-200 transition-colors hover:text-crimson-bright">
          <span className="text-crimson-text">●</span> {name}
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
