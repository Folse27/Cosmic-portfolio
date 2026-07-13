"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const items = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/images", label: "Media" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="sticky top-0 flex h-screen w-48 shrink-0 flex-col border-r border-white/5 bg-panel/60 px-4 py-6 md:w-56">
      <Link href="/admin" className="mb-8 font-mono text-sm tracking-widest text-white">
        <span className="text-crimson">●</span> ADMIN
      </Link>
      <nav className="flex flex-1 flex-col gap-1">
        {items.map((item) => {
          const active =
            item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-crimson/15 text-crimson-bright"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="flex flex-col gap-1 border-t border-white/5 pt-4">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg px-3 py-2 text-sm text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
        >
          View site ↗
        </a>
        <button
          onClick={logout}
          className="rounded-lg px-3 py-2 text-left text-sm text-gray-400 transition-colors hover:bg-crimson/15 hover:text-crimson-bright"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
