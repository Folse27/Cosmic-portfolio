export default function Footer({ name }: { name: string }) {
  return (
    <footer className="border-t border-white/5 py-10">
      <div className="mx-auto flex max-w-site flex-col items-center justify-between gap-3 px-6 font-mono text-xs text-gray-600 sm:flex-row">
        <p>© {new Date().getFullYear()} {name}</p>
        <p>Built with Next.js · Drifting somewhere past the event horizon</p>
      </div>
    </footer>
  );
}
