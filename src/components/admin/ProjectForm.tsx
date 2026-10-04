"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { LinkItem, Project, ProjectText } from "@/db/schema";
import type { Locale } from "@/lib/i18n";
import { GalleryEditor, ImagePicker } from "./ImagePicker";
import { EDIT_LOCALES, LangBadge, LangTabs } from "./LangTabs";

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

/** Translatable fields as the form edits them: lists are newline / comma separated text. */
type TextForm = Record<keyof ProjectText, string>;
const EMPTY_TEXT: TextForm = {
  title: "",
  summary: "",
  description: "",
  problems: "",
  solution: "",
  outcomes: "",
  note: "",
  tags: "",
};
const TEXT_KEYS = Object.keys(EMPTY_TEXT) as (keyof ProjectText)[];

function toTextForm(t: Partial<ProjectText> | undefined): TextForm {
  return {
    title: t?.title ?? "",
    summary: t?.summary ?? "",
    description: t?.description ?? "",
    problems: toLines(t?.problems ?? []),
    solution: t?.solution ?? "",
    outcomes: toLines(t?.outcomes ?? []),
    note: t?.note ?? "",
    tags: (t?.tags ?? []).join(", "),
  };
}

function fromTextForm(f: TextForm): ProjectText {
  return {
    title: f.title,
    summary: f.summary,
    description: f.description,
    problems: fromLines(f.problems),
    solution: f.solution,
    outcomes: fromLines(f.outcomes),
    note: f.note,
    tags: f.tags.split(",").map((t) => t.trim()).filter(Boolean),
  };
}

export default function ProjectForm({ project }: { project?: Project }) {
  const router = useRouter();
  const isEdit = !!project;

  const [form, setForm] = useState({
    slug: project?.slug ?? "",
    dateLabel: project?.dateLabel ?? "",
    links: linksToText(project?.links ?? []),
    featured: project?.featured ?? false,
    published: project?.published ?? true,
  });
  // Translatable text, one copy per language. "en" is the base columns.
  const [text, setText] = useState<Record<Locale, TextForm>>(() => ({
    en: project ? toTextForm({ ...project, note: project.note ?? "" }) : EMPTY_TEXT,
    de: toTextForm(project?.translations?.de),
    ru: toTextForm(project?.translations?.ru),
  }));
  const [lang, setLang] = useState<Locale>("en");
  const [coverImage, setCoverImage] = useState<string | null>(project?.coverImage ?? null);
  const [gallery, setGallery] = useState<string[]>(project?.gallery ?? []);
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const set = (key: "slug" | "dateLabel" | "links") => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [key]: e.target.value });

  /** Props for an input bound to the current language tab. */
  const tField = (key: keyof ProjectText) => ({
    value: text[lang][key],
    placeholder: lang === "en" ? undefined : text.en[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setText({ ...text, [lang]: { ...text[lang], [key]: e.target.value } }),
  });

  const incomplete = Object.fromEntries(
    EDIT_LOCALES.map((l) => [l, l !== "en" && TEXT_KEYS.some((k) => text.en[k].trim() && !text[l][k].trim())]),
  );

  async function save(e: React.FormEvent) {
    e.preventDefault();
    // The English title is the one required field. Its input only enforces
    // `required` while the EN tab is open, so check it here as well.
    if (!text.en.title.trim()) {
      setLang("en");
      setError("The English title is required.");
      setStatus("error");
      return;
    }
    setStatus("saving");
    setError(null);

    const payload = {
      ...fromTextForm(text.en),
      translations: { de: fromTextForm(text.de), ru: fromTextForm(text.ru) },
      slug: form.slug,
      dateLabel: form.dateLabel,
      links: linksFromText(form.links),
      coverImage,
      gallery,
      featured: form.featured,
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
      <LangTabs value={lang} onChange={setLang} incomplete={incomplete} />

      <div className="card-panel space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Title{lang === "en" && " *"}<LangBadge lang={lang} /></label>
            <input className="input" required={lang === "en"} {...tField("title")} />
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
          <label className="label">Card summary (shown in the projects grid)<LangBadge lang={lang} /></label>
          <textarea className="input min-h-16 resize-y" {...tField("summary")} />
        </div>
      </div>

      <div className="card-panel space-y-4">
        <div>
          <label className="label">Description<LangBadge lang={lang} /></label>
          <textarea className="input min-h-32 resize-y" {...tField("description")} />
        </div>
        <div>
          <label className="label">Business problems — one per line<LangBadge lang={lang} /></label>
          <textarea className="input min-h-24 resize-y font-mono text-xs" {...tField("problems")} />
        </div>
        <div>
          <label className="label">Solution<LangBadge lang={lang} /></label>
          <textarea className="input min-h-28 resize-y" {...tField("solution")} />
        </div>
        <div>
          <label className="label">Outcomes — one per line<LangBadge lang={lang} /></label>
          <textarea className="input min-h-24 resize-y font-mono text-xs" {...tField("outcomes")} />
        </div>
        <div>
          <label className="label">Important note (optional callout)<LangBadge lang={lang} /></label>
          <textarea className="input min-h-16 resize-y" {...tField("note")} />
        </div>
      </div>

      <div className="card-panel space-y-5">
        <ImagePicker label="Cover image" value={coverImage} onChange={setCoverImage} />
        <GalleryEditor value={gallery} onChange={setGallery} />
      </div>

      <div className="card-panel space-y-4">
        <div>
          <label className="label">Tags — comma separated<LangBadge lang={lang} /></label>
          <input
            className="input"
            {...tField("tags")}
            placeholder={lang === "en" ? "WhatsApp, AI, Automation" : text.en.tags}
          />
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
            checked={form.featured}
            onChange={(e) => setForm({ ...form, featured: e.target.checked })}
            className="h-4 w-4 accent-[#e11d33]"
          />
          Featured (shown first on the homepage; the rest move to &quot;More projects&quot;)
        </label>
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
