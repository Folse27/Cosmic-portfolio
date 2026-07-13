import Link from "next/link";

export default function Nav({ name }: { name: string }) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-void/70 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-site items-center justify-between px-6">
        <Link href="/" className="font-mono text-sm tracking-widest text-gray-200 transition-colors hover:text-crimson-bright">
          <span className="text-crimson">●</span> {name}
        </Link>
        <div className="flex items-center gap-6 font-mono text-xs uppercase tracking-wider text-gray-400">
          <Link href="/#about" className="hidden transition-colors hover:text-white sm:block">About</Link>
          <Link href="/#projects" className="hidden transition-colors hover:text-white sm:block">Projects</Link>
          <Link href="/#contact" className="transition-colors hover:text-crimson-bright">Contact</Link>
        </div>
      </nav>
    </header>
  );
}
