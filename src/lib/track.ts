"use client";

/**
 * First-party, privacy-friendly event tracking.
 * Events go to our own /api/track endpoint — no cookies, no third parties,
 * no personal data. `sendBeacon` keeps clicks reliable even when the
 * browser is navigating away.
 */
export function track(type: "view" | "click", data: { path?: string; elementId?: string } = {}) {
  if (typeof window === "undefined") return;
  const payload = JSON.stringify({
    type,
    path: data.path ?? window.location.pathname,
    elementId: data.elementId,
  });
  try {
    if (navigator.sendBeacon?.("/api/track", payload)) return;
  } catch {
    /* fall through to fetch */
  }
  fetch("/api/track", { method: "POST", body: payload, keepalive: true }).catch(() => {});
}

export const trackClick = (elementId: string) => track("click", { elementId });
