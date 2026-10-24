import { db } from "@/db";
import { analyticsEvents } from "@/db/schema";
import { rateLimit } from "@/lib/rate-limit";

/**
 * Public, privacy-friendly event sink.
 * Stores only: event type, page path, optional element id, timestamp.
 * No cookies, no IP addresses, no user agents, no personal data.
 * Rate-limited per client so a script cannot inflate the statistics.
 */
export async function POST(req: Request) {
  if (await rateLimit(req, "track")) return new Response(null, { status: 429 });

  let body: { type?: string; path?: string; elementId?: string };
  try {
    body = JSON.parse(await req.text()); // sendBeacon posts text/plain
  } catch {
    return new Response(null, { status: 400 });
  }

  const type = body.type === "view" || body.type === "click" ? body.type : null;
  const path = typeof body.path === "string" ? body.path.slice(0, 512) : null;
  const elementId =
    typeof body.elementId === "string" && body.elementId ? body.elementId.slice(0, 256) : null;

  if (!type || !path || !path.startsWith("/")) return new Response(null, { status: 400 });
  if (path.startsWith("/admin")) return new Response(null, { status: 204 }); // never track admin

  try {
    await db.insert(analyticsEvents).values({ type, path, elementId });
  } catch {
    // Analytics must never break the site — swallow storage errors.
  }
  return new Response(null, { status: 204 });
}
