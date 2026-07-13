"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { LinkItem, Project } from "@/db/schema";
import { GalleryEditor, ImagePicker } from "./ImagePicker";

/** One value per line ⇄ string[] */
const toLines = (arr: string[]) => arr.join("\n");
const fromLines = (s: string) => s.split("\n").map((l) => l.trim()).filter(Boolean);

/** "Label | https://url" per line ⇄ LinkItem[] */
const linksToText = (links: LinkItem[]) => links.map((l) => `${l.label} | ${l.url}`).join("\n");
function linksFromText(s: string): LinkItem[] {
  return s
    .split("\n")
    .map((line) => {
      const [label, ...rest] = line.split("|");
      const url = rest.join("|").trim();
      return { label: (label ?? "").trim(), url };
    })
    .filter((l) => l.label && l.url);
}

export default function ProjectForm({ project }: { project?: Project }) {
  const router = useRouter();
  const isEdit = !!project;

  const [form, setForm] = useState({
    title: project?.title ?? "",
    slug: project?.slug ?? "",
    dateLabel: project?.dateLabel ?? "",
    summary: project?.summary ?? "",
    description: project?.description ?? "",
    problems: toLines(project?.problems ?? []),
    solution: project?.solution ?? "",
    outcomes: toLines(project?.outcomes ?? []),
    note: project?.note ?? "",
    tags: (project?.tags ?? []).join(", "),
    links: linksToText(project?.links ?? []),
    published: project?.published ?? true,
  });
  const [coverImage, setCoverImage] = useState<string | null>(project?.coverImage ?? null);
  const [gallery, setGallery] = useState<string[]>(project?.gallery ?? []);
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [key]: e.target.value });

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError(null);

    const payload = {
      title: form.title,
      slug: form.slug,
      dateLabel: form.dateLabel,
      summary: form.summary,
      description: form.description,
      problems: fromLines(form.problems),
      solution: form.solution,
      outcomes: fromLines(form.outcomes),
      note: form.note,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      links: linksFromText(form.links),
      coverImage,
      gallery,
      published: form.published,
    };

    try {
      const res = await fetch(isEdit ? `/api/projects/${project.id}` : "/api/projects", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      router.push("/admin/projects");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
      setStatus("error");
    }
  }

  async function remove() {
    if (!project) return;
    if (!confirm(`Delete "${project.title}"? This cannot be undone.`)) return;
    await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
    router.push("/admin/projects");
    router.refresh();
  }

  return (
    <form onSubmit={save} className="max-w-3xl space-y-6">
      <div className="card-panel space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Title *</label>
            <input className="input" required value={form.title} onChange={set("title")} />
          </div>
          <div>
            <label className="label">Date label</label>
            <input className="input" placeholder="01.06.2026" value={form.dateLabel} onChange={set("dateLabel")} />
          </div>
        </div>
        <div>
          <label className="label">Slug (URL) {isEdit ? "" : "— leave empty to auto-generate"}</label>
          <input className="input font-mono" placeholder="my-project" value={form.slug} onChange={set("slug")} />
        </div>
        <div>
          <label className="label">Card summary (shown in the projects grid)</label>
          <textarea className="input min-h-16 resize-y" value={form.summary} onChange={set("summary")} />
        </div>
      </div>

      <div className="card-panel space-y-4">
        <div>
          <label className="label">Description</label>
          <textarea className="input min-h-32 resize-y" value={form.description} onChange={set("description")} />
        </div>
        <div>
          <label className="label">Business problems — one per line</label>
          <textarea className="input min-h-24 resize-y font-mono text-xs" value={form.problems} onChange={set("problems")} />
        </div>
        <div>
          <label className="label">Solution</label>
          <textarea className="input min-h-28 resize-y" value={form.solution} onChange={set("solution")} />
        </div>
        <div>
          <label className="label">Outcomes — one per line</label>
          <textarea className="input min-h-24 resize-y font-mono text-xs" value={form.outcomes} onChange={set("outcomes")} />
        </div>
        <div>
          <label className="label">Important note (optional callout)</label>
          <textarea className="input min-h-16 resize-y" value={form.note} onChange={set("note")} />
        </div>
      </div>

      <div className="card-panel space-y-5">
        <ImagePicker label="Cover image" value={coverImage} onChange={setCoverImage} />
        <GalleryEditor value={gallery} onChange={setGallery} />
      </div>

      <div className="card-panel space-y-4">
        <div>
          <label className="label">Tags — comma separated</label>
          <input className="input" placeholder="WhatsApp, AI, Automation" value={form.tags} onChange={set("tags")} />
        </div>
        <div>
          <label className="label">External links — one per line, format: Label | https://url</label>
          <textarea
            className="input min-h-20 resize-y font-mono text-xs"
            placeholder={"Live demo | https://example.com\nGitHub | https://github.com/you/repo"}
            value={form.links}
            onChange={set("links")}
          />
        </div>
        <label className="flex cursor-pointer items-center gap-3 text-sm text-gray-300">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => setForm({ ...form, published: e.target.checked })}
            className="h-4 w-4 accent-[#e11d33]"
          />
          Published (visible on the site)
        </label>
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={status === "saving"} className="btn-primary disabled:opacity-60">
          {status === "saving" ? "Saving…" : isEdit ? "Save changes" : "Create project"}
        </button>
        {isEdit && (
          <button type="button" onClick={remove} className="btn-ghost !border-crimson/40 !text-crimson-bright">
            Delete project
          </button>
        )}
        {error && <p className="font-mono text-xs text-crimson-bright">{error}</p>}
      </div>
    </form>
  );
}
