import { createHash } from "node:crypto";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";

/**
 * Fixed-window limits per client. The counters live in Postgres because
 * serverless instances share no memory, so an in-process counter would
 * reset on every cold start.
 */
const LIMITS = {
  contact: { max: 5, windowSec: 60 * 60 },
  login: { max: 10, windowSec: 15 * 60 },
  track: { max: 120, windowSec: 60 },
} as const;

export type RateLimitBucket = keyof typeof LIMITS;

/** Bucket + a salted one-way hash of the client address, so no raw IP is ever stored. */
function clientKey(req: Request, bucket: RateLimitBucket): string {
  const ip =
    req.headers.get("x-real-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const hash = createHash("sha256").update(`${process.env.AUTH_SECRET ?? ""}:${ip}`).digest("hex");
  return `${bucket}:${hash.slice(0, 32)}`;
}

/**
 * Counts this request. Returns the seconds to wait when the limit is
 * exceeded, otherwise null. Fails open: a database hiccup must not lock
 * visitors out. Expired rows are removed in the same statement.
 */
export async function rateLimit(req: Request, bucket: RateLimitBucket): Promise<number | null> {
  const { max, windowSec } = LIMITS[bucket];
  try {
    const { rows } = await db.execute<{ count: number; retry_after: number }>(sql`
      WITH cleanup AS (DELETE FROM rate_limits WHERE reset_at < now() - interval '1 hour')
      INSERT INTO rate_limits (key, count, reset_at)
      VALUES (${clientKey(req, bucket)}, 1, now() + ${windowSec}::int * interval '1 second')
      ON CONFLICT (key) DO UPDATE SET
        count = CASE WHEN rate_limits.reset_at <= now() THEN 1 ELSE rate_limits.count + 1 END,
        reset_at = CASE WHEN rate_limits.reset_at <= now()
          THEN now() + ${windowSec}::int * interval '1 second' ELSE rate_limits.reset_at END
      RETURNING count, ceil(extract(epoch FROM reset_at - now()))::int AS retry_after`);
    const row = rows[0];
    return row && row.count > max ? Math.max(1, row.retry_after) : null;
  } catch {
    return null;
  }
}

export function tooManyRequests(retryAfter: number, error = "Too many requests. Please try again later.") {
  return NextResponse.json({ error }, { status: 429, headers: { "Retry-After": String(retryAfter) } });
}
