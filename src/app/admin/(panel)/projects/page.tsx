"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Project } from "@/db/schema";

export default function AdminProjectsPage() {
  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/projects?all=1")
      .then((r) => r.json())
      .then((rows: Project[]) => setItems(rows))
      .finally(() => setLoading(false));
  }, []);

  /** Swap with neighbour, then persist index order via /reorder. */
  async function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
    setSaving(true);
    await fetch("/api/projects/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: next.map((p) => p.id) }),
    });
    setSaving(false);
  }

  async function remove(project: Project) {
    if (!confirm(`Delete "${project.title}"? This cannot be undone.`)) return;
    await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
    setItems(items.filter((p) => p.id !== project.id));
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-white">Projects</h1>
          <p className="mt-1 font-mono text-xs text-gray-500">
            Reorder with the arrows — the site follows this order. {saving && "Saving…"}
          </p>
        </div>
        <Link href="/admin/projects/new" className="btn-primary">
          New project
        </Link>
      </div>

      {loading ? (
        <p className="font-mono text-xs text-gray-500">Loading…</p>
      ) : items.length === 0 ? (
        <p className="font-mono text-xs text-gray-500">No projects yet — create your first one.</p>
      ) : (
        <div className="space-y-2">
          {items.map((project, i) => (
            <div key={project.id} className="card-panel flex items-center gap-4 !p-4">
              <div className="flex flex-col">
                <button
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  aria-label="Move up"
                  className="px-1 text-gray-500 transition-colors hover:text-crimson-bright disabled:opacity-20"
                >
                  ▲
                </button>
                <button
                  onClick={() => move(i, 1)}
                  disabled={i === items.length - 1}
                  aria-label="Move down"
                  className="px-1 text-gray-500 transition-colors hover:text-crimson-bright disabled:opacity-20"
                >
                  ▼
                </button>
              </div>

              <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-black/40">
                {project.coverImage && (
                  <img src={project.coverImage} alt="" className="h-full w-full object-cover" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-white">{project.title}</p>
                <p className="truncate font-mono text-[11px] text-gray-500">
                  {project.dateLabel ? `${project.dateLabel} · ` : ""}/projects/{project.slug}
                </p>
              </div>

              {!project.published && (
                <span className="chip !border-yellow-500/40 !text-yellow-500">Draft</span>
              )}

              <Link
                href={`/admin/projects/${project.id}`}
                className="rounded-lg border border-white/15 px-3 py-1.5 font-mono text-xs text-gray-300 transition-colors hover:border-crimson/60"
              >
                Edit
              </Link>
              <button
                onClick={() => remove(project)}
                className="rounded-lg px-2 py-1.5 font-mono text-xs text-gray-500 transition-colors hover:text-crimson-bright"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
