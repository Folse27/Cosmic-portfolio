import Link from "next/link";
import { localePath, type Dict, type Locale } from "@/lib/i18n";

export default function Footer({ name, lang, labels }: { name: string; lang: Locale; labels: Dict["footer"] }) {
  return (
    <footer className="border-t border-white/5 py-10">
      <div className="mx-auto flex max-w-site flex-col items-center justify-between gap-4 px-6 font-mono text-xs text-gray-500 sm:flex-row">
        <p>© {new Date().getFullYear()} {name}</p>

        {/* German law requires these to be reachable from every page. */}
        <nav className="flex items-center gap-5">
          <Link href={localePath(lang, "/impressum")} className="transition-colors hover:text-crimson-bright">
            {labels.legal}
          </Link>
          <Link href={localePath(lang, "/privacy")} className="transition-colors hover:text-crimson-bright">
            {labels.privacy}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
