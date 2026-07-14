import Link from "next/link";

export default function Footer({ name }: { name: string }) {
  return (
    <footer className="border-t border-white/5 py-10">
      <div className="mx-auto flex max-w-site flex-col items-center justify-between gap-4 px-6 font-mono text-xs text-gray-600 sm:flex-row">
        <p>© {new Date().getFullYear()} {name}</p>

        {/* German law requires these to be reachable from every page. */}
        <nav className="flex items-center gap-5">
          <Link href="/impressum" className="transition-colors hover:text-crimson-bright">
            Legal Notice
          </Link>
          <Link href="/privacy" className="transition-colors hover:text-crimson-bright">
            Privacy Policy
          </Link>
        </nav>
      </div>
    </footer>
  );
}
