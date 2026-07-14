"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Analytics = {
  range: { days: number; bucket: string; since: string };
  totals: { views: number; clicks: number; allTimeEvents: number };
  byPath: Array<{ key: string; value: number }>;
  byElement: Array<{ key: string; value: number }>;
  series: Array<{ label: string; views: number; clicks: number }>;
};

const RANGES = [
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
  { days: 365, label: "1 year" },
  { days: 0, label: "All time" },
];
const BUCKETS = [
  { value: "day", label: "Daily" },
  { value: "week", label: "Weekly" },
  { value: "month", label: "Monthly" },
] as const;

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card-panel">
      <p className="label !mb-2">{label}</p>
      <p className="font-display text-3xl text-white">{value}</p>
    </div>
  );
}

/** Horizontal bar list — enough for "top pages" / "top clicks". */
function BarList({ title, items, empty }: { title: string; items: Array<{ key: string; value: number }>; empty: string }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <div className="card-panel">
      <p className="label">{title}</p>
      {items.length === 0 ? (
        <p className="font-mono text-xs text-gray-600">{empty}</p>
      ) : (
        <div className="space-y-2.5">
          {items.map((item) => (
            <div key={item.key}>
              <div className="mb-1 flex items-baseline justify-between gap-3">
                <span className="min-w-0 truncate font-mono text-xs text-gray-300">{item.key}</span>
                <span className="shrink-0 font-mono text-xs text-crimson-bright">{item.value}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-crimson-dim to-crimson"
                  style={{ width: `${(item.value / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const [days, setDays] = useState(30);
  const [bucket, setBucket] = useState<"day" | "week" | "month">("day");
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/analytics?days=${days}&bucket=${bucket}`);
    if (res.ok) setData(await res.json());
    setLoading(false);
  }, [days, bucket]);

  useEffect(() => {
    load();
  }, [load]);

  const topPage = data?.byPath[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-white">Analytics</h1>
          <p className="mt-1 font-mono text-xs text-gray-500">
            First-party tracking — views &amp; clicks stored in your own database.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex overflow-hidden rounded-lg border border-white/10">
            {RANGES.map((r) => (
              <button
                key={r.days}
                onClick={() => setDays(r.days)}
                className={`px-3 py-1.5 font-mono text-xs transition-colors ${
                  days === r.days ? "bg-crimson/20 text-crimson-bright" : "text-gray-400 hover:text-white"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <div className="flex overflow-hidden rounded-lg border border-white/10">
            {BUCKETS.map((b) => (
              <button
                key={b.value}
                onClick={() => setBucket(b.value)}
                className={`px-3 py-1.5 font-mono text-xs transition-colors ${
                  bucket === b.value ? "bg-crimson/20 text-crimson-bright" : "text-gray-400 hover:text-white"
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Page views (range)" value={loading ? "…" : data?.totals.views ?? 0} />
        <StatCard label="Clicks (range)" value={loading ? "…" : data?.totals.clicks ?? 0} />
        <StatCard label="Top page (range)" value={loading ? "…" : topPage ? topPage.key : "—"} />
      </div>

      <div className="card-panel">
        <p className="label">Views &amp; clicks over time</p>
        <div className="h-72 w-full">
          {data && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.series} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
                <defs>
                  <linearGradient id="views" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#e11d33" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#e11d33" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="clicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b93a7" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#8b93a7" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#6b7280", fontSize: 11, fontFamily: "var(--font-mono)" }}
                  tickLine={false}
                  axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                  minTickGap={24}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "#6b7280", fontSize: 11, fontFamily: "var(--font-mono)" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "#0b0b0f",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "#9ca3af" }}
                />
                <Area type="monotone" dataKey="views" stroke="#e11d33" strokeWidth={2} fill="url(#views)" name="Views" />
                <Area type="monotone" dataKey="clicks" stroke="#8b93a7" strokeWidth={2} fill="url(#clicks)" name="Clicks" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <BarList title="Views by page" items={data?.byPath ?? []} empty="No page views in this range yet." />
        <BarList
          title="Clicks by element (projects, links, contact)"
          items={data?.byElement ?? []}
          empty="No clicks in this range yet."
        />
      </div>
    </div>
  );
}
