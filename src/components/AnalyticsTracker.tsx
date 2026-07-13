"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { track } from "@/lib/track";

/**
 * Fires one "view" event per navigation. Admin routes are never tracked.
 * A ref guards against double-fires (React strict mode remounts in dev).
 */
export default function AnalyticsTracker() {
  const pathname = usePathname();
  const last = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    if (last.current === pathname) return;
    last.current = pathname;
    track("view", { path: pathname });
  }, [pathname]);

  return null;
}
