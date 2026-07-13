import { count, gte, min } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { analyticsEvents } from "@/db/schema";
import { getSession, unauthorized } from "@/lib/auth";

const DAY = 24 * 60 * 60 * 1000;

/** UTC start of the bucket an event falls into. */
function bucketStart(date: Date, bucket: "day" | "week" | "month"): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  if (bucket === "week") d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7)); // Monday
  if (bucket === "month") d.setUTCDate(1);
  return d;
}

function bucketLabel(d: Date, bucket: "day" | "week" | "month"): string {
  return bucket === "month" ? d.toISOString().slice(0, 7) : d.toISOString().slice(0, 10);
}

function nextBucket(d: Date, bucket: "day" | "week" | "month"): Date {
  const n = new Date(d);
  if (bucket === "day") n.setUTCDate(n.getUTCDate() + 1);
  if (bucket === "week") n.setUTCDate(n.getUTCDate() + 7);
  if (bucket === "month") n.setUTCMonth(n.getUTCMonth() + 1);
  return n;
}

/**
 * GET /api/analytics?days=30&bucket=day
 * days: 7 | 30 | 90 | 365 | 0 (all time)   bucket: day | week | month
 * Returns totals, per-page views, per-element clicks and a zero-filled
 * time series for the chart. Aggregation happens in JS — trivial at
 * portfolio traffic volumes and keeps the SQL portable.
 */
export async function GET(req: Request) {
  if (!(await getSession())) return unauthorized();

  const url = new URL(req.url);
  const days = [7, 30, 90, 365, 0].includes(Number(url.searchParams.get("days")))
    ? Number(url.searchParams.get("days"))
    : 30;
  const bucketParam = url.searchParams.get("bucket");
  const bucket: "day" | "week" | "month" =
    bucketParam === "week" || bucketParam === "month" ? bucketParam : "day";

  let since: Date;
  if (days === 0) {
    const [row] = await db.select({ first: min(analyticsEvents.createdAt) }).from(analyticsEvents);
    since = row?.first ? new Date(row.first) : new Date(Date.now() - 30 * DAY);
  } else {
    since = new Date(Date.now() - days * DAY);
  }

  const [events, [allTime]] = await Promise.all([
    db
      .select({
        type: analyticsEvents.type,
        path: analyticsEvents.path,
        elementId: analyticsEvents.elementId,
        createdAt: analyticsEvents.createdAt,
      })
      .from(analyticsEvents)
      .where(gte(analyticsEvents.createdAt, since))
      .limit(100000),
    db.select({ n: count() }).from(analyticsEvents),
  ]);

  let views = 0;
  let clicks = 0;
  const byPath = new Map<string, number>();
  const byElement = new Map<string, number>();
  const series = new Map<string, { views: number; clicks: number }>();

  for (const e of events) {
    const key = bucketLabel(bucketStart(new Date(e.createdAt), bucket), bucket);
    const cell = series.get(key) ?? { views: 0, clicks: 0 };
    if (e.type === "view") {
      views++;
      cell.views++;
      byPath.set(e.path, (byPath.get(e.path) ?? 0) + 1);
    } else {
      clicks++;
      cell.clicks++;
      if (e.elementId) byElement.set(e.elementId, (byElement.get(e.elementId) ?? 0) + 1);
    }
    series.set(key, cell);
  }

  // Zero-fill so the chart shows quiet periods honestly.
  const filled: Array<{ label: string; views: number; clicks: number }> = [];
  const now = new Date();
  for (let d = bucketStart(since, bucket); d <= now; d = nextBucket(d, bucket)) {
    const label = bucketLabel(d, bucket);
    const cell = series.get(label) ?? { views: 0, clicks: 0 };
    filled.push({ label, ...cell });
    if (filled.length > 400) break; // hard safety cap
  }

  const top = (m: Map<string, number>, n = 12) =>
    [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([key, value]) => ({ key, value }));

  return NextResponse.json({
    range: { days, bucket, since: since.toISOString() },
    totals: { views, clicks, allTimeEvents: Number(allTime?.n ?? 0) },
    byPath: top(byPath),
    byElement: top(byElement),
    series: filled,
  });
}
