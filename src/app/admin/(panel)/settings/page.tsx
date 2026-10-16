"use client";

import { useEffect, useState } from "react";
import type { InfoBox, LinkItem, SectionCopy, SettingsText, SiteSettings } from "@/db/schema";
import { ImagePicker } from "@/components/admin/ImagePicker";
import { EDIT_LOCALES, LangBadge, LangTabs } from "@/components/admin/LangTabs";
import { LOCALES, type Locale } from "@/lib/i18n";
import { defaultSectionCopy, resolveSectionCopy } from "@/lib/section-copy";

const socialsToText = (socials: LinkItem[]) => socials.map((s) => `${s.label} | ${s.url}`).join("\n");
function socialsFromText(s: string): LinkItem[] {
  return s
    .split("\n")
    .map((line) => {
      const [label, ...rest] = line.split("|");
      return { label: (label ?? "").trim(), url: rest.join("|").trim() };
    })
    .filter((l) => l.label && l.url);
}

/** Translatable fields as the form edits them: skills are comma-separated text. */
type TextForm = Record<keyof SettingsText, string>;
const EMPTY_TEXT: TextForm = { title: "", tagline: "", bio: "", metaDescription: "", skills: "" };
const TEXT_KEYS = Object.keys(EMPTY_TEXT) as (keyof SettingsText)[];

// Picks only the translatable keys, so other settings never ride along into the text state.
const toTextForm = (t: Partial<SettingsText> | undefined): TextForm => ({
  title: t?.title ?? "",
  tagline: t?.tagline ?? "",
  bio: t?.bio ?? "",
  metaDescription: t?.metaDescription ?? "",
  skills: (t?.skills ?? []).join(", "),
});
const fromTextForm = (f: TextForm): SettingsText => ({
  ...f,
  skills: f.skills.split(",").map((s) => s.trim()).filter(Boolean),
});

export default function AdminSettingsPage() {
  const [form, setForm] = useState({
    name: "",
    navName: "",
    email: "",
    socials: "",
  });
  // Translatable text, one copy per language. "en" is the base columns.
  const [text, setText] = useState<Record<Locale, TextForm>>({ en: EMPTY_TEXT, de: EMPTY_TEXT, ru: EMPTY_TEXT });
  const [lang, setLang] = useState<Locale>("en");
  // Homepage section copy, one full set per language, prefilled with what the site shows now.
  const [sections, setSections] = useState<Record<Locale, SectionCopy>>(
    () => Object.fromEntries(LOCALES.map((l) => [l, defaultSectionCopy(l)])) as Record<Locale, SectionCopy>,
  );
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "idle" | "saving" | "saved" | "error">("loading");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((s: SiteSettings) => {
        setForm({
          name: s.name,
          navName: s.navName ?? "",
          email: s.email ?? "",
          socials: socialsToText(s.socials),
        });
        setText({
          en: toTextForm(s),
          de: toTextForm(s.translations?.de),
          ru: toTextForm(s.translations?.ru),
        });
        setProfileImage(s.profileImage);
        setLogoImage(s.logoImage);
        setSections(Object.fromEntries(LOCALES.map((l) => [l, resolveSectionCopy(s, l)])) as Record<Locale, SectionCopy>);
        setStatus("idle");
      })
      .catch(() => setStatus("error"));
  }, []);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [key]: e.target.value });

  /** Props for an input bound to the current language tab. */
  const tField = (key: keyof SettingsText) => ({
    value: text[lang][key],
    placeholder: lang === "en" ? undefined : text.en[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setText({ ...text, [lang]: { ...text[lang], [key]: e.target.value } }),
  });

  const sec = sections[lang];
  const setSec = (patch: Partial<SectionCopy>) => setSections({ ...sections, [lang]: { ...sec, ...patch } });
  const secField = (key: Exclude<keyof SectionCopy, "dataPoints">) => ({
    value: sec[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setSec({ [key]: e.target.value }),
  });
  const setBox = (i: number, key: keyof InfoBox, value: string) =>
    setSec({ dataPoints: sec.dataPoints.map((b, j) => (j === i ? { ...b, [key]: value } : b)) });
  const moveBox = (i: number, by: -1 | 1) => {
    const boxes = [...sec.dataPoints];
    [boxes[i], boxes[i + by]] = [boxes[i + by], boxes[i]];
    setSec({ dataPoints: boxes });
  };

  const incomplete = Object.fromEntries(
    EDIT_LOCALES.map((l) => [l, l !== "en" && TEXT_KEYS.some((k) => text.en[k].trim() && !text[l][k].trim())]),
  );

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        ...fromTextForm(text.en),
        translations: { de: fromTextForm(text.de), ru: fromTextForm(text.ru) },
        profileImage,
        logoImage,
        socials: socialsFromText(form.socials),
        sectionCopy: sections,
      }),
    });
    setStatus(res.ok ? "saved" : "error");
    if (res.ok) setTimeout(() => setStatus("idle"), 2000);
  }

  if (status === "loading") return <p className="font-mono text-xs text-gray-500">Loading…</p>;

  return (
    <form onSubmit={save} className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl text-white">Site settings</h1>
        <p className="mt-1 font-mono text-xs text-gray-500">
          Everything here is live on the public site the moment you save.
        </p>
      </div>

      <div className="card-panel">
        <ImagePicker label="Logo (top left of every page) — empty shows a placeholder" value={logoImage} onChange={setLogoImage} />
      </div>

      <LangTabs value={lang} onChange={setLang} incomplete={incomplete} />

      <div className="card-panel space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Name (hero headline)</label>
            <input className="input" value={form.name} onChange={set("name")} />
          </div>
          <div>
            <label className="label">Logo alt text (read by screen readers) — blank uses the name</label>
            <input className="input" value={form.navName} placeholder={form.name} onChange={set("navName")} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Title / role (above the name)<LangBadge lang={lang} /></label>
            <input className="input" {...tField("title")} />
          </div>
        </div>
        <div>
          <label className="label">Tagline (under the name)<LangBadge lang={lang} /></label>
          <textarea className="input min-h-16 resize-y" {...tField("tagline")} />
        </div>
        <div>
          <label className="label">SEO meta description<LangBadge lang={lang} /></label>
          <textarea className="input min-h-16 resize-y" {...tField("metaDescription")} />
        </div>
      </div>

      <div className="card-panel space-y-4">
        <ImagePicker label="Profile photo" value={profileImage} onChange={setProfileImage} />
        <div>
          <label className="label">Bio — blank line starts a new paragraph<LangBadge lang={lang} /></label>
          <textarea className="input min-h-40 resize-y" {...tField("bio")} />
        </div>
        <div>
          <label className="label">Skills / tech stack — comma separated<LangBadge lang={lang} /></label>
          <input className="input" {...tField("skills")} />
        </div>
      </div>

      <div className="card-panel space-y-4">
        <div>
          <label className="label">Contact email (the &quot;Email me&quot; button)</label>
          <input className="input" type="email" value={form.email} onChange={set("email")} />
        </div>
        <div>
          <label className="label">Social / messenger links — one per line, format: Label | https://url</label>
          <textarea
            className="input min-h-24 resize-y font-mono text-xs"
            placeholder={"Telegram | https://t.me/your_username\nGitHub | https://github.com/your_username"}
            value={form.socials}
            onChange={set("socials")}
          />
        </div>
      </div>

      <div className="card-panel space-y-4">
        <div>
          <p className="font-display text-base text-white">Data protection section (homepage)</p>
          <p className="mt-1 font-mono text-[11px] text-gray-500">Each language has its own boxes. Empty fields show the built-in text.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Small label above the heading<LangBadge lang={lang} /></label>
            <input className="input" {...secField("dataKicker")} />
          </div>
          <div>
            <label className="label">Heading<LangBadge lang={lang} /></label>
            <input className="input" {...secField("dataTitle")} />
          </div>
        </div>
        <div className="space-y-3">
          {sec.dataPoints.map((box, i) => (
            <div key={i} className="space-y-2 rounded-xl border border-white/10 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="label !mb-0">Box {i + 1}<LangBadge lang={lang} /></span>
                <div className="flex gap-1 font-mono text-xs">
                  <button type="button" disabled={i === 0} onClick={() => moveBox(i, -1)} className="rounded px-2 py-1 text-gray-400 hover:text-white disabled:opacity-30" aria-label="Move up">↑</button>
                  <button type="button" disabled={i === sec.dataPoints.length - 1} onClick={() => moveBox(i, 1)} className="rounded px-2 py-1 text-gray-400 hover:text-white disabled:opacity-30" aria-label="Move down">↓</button>
                  <button type="button" onClick={() => setSec({ dataPoints: sec.dataPoints.filter((_, j) => j !== i) })} className="rounded px-2 py-1 text-gray-500 hover:text-crimson-bright">Remove</button>
                </div>
              </div>
              <input className="input" placeholder="Title" value={box.title} onChange={(e) => setBox(i, "title", e.target.value)} />
              <textarea className="input min-h-16 resize-y" placeholder="Text" value={box.text} onChange={(e) => setBox(i, "text", e.target.value)} />
            </div>
          ))}
          <button
            type="button"
            disabled={sec.dataPoints.length >= 12}
            onClick={() => setSec({ dataPoints: [...sec.dataPoints, { title: "", text: "" }] })}
            className="rounded-lg border border-dashed border-white/20 px-4 py-2 font-mono text-xs text-gray-300 transition-colors hover:border-crimson/60 hover:text-white disabled:opacity-40"
          >
            + Add box
          </button>
        </div>
      </div>

      <div className="card-panel space-y-4">
        <p className="font-display text-base text-white">Contact section (homepage)</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Small label above the heading<LangBadge lang={lang} /></label>
            <input className="input" {...secField("contactKicker")} />
          </div>
          <div>
            <label className="label">Heading<LangBadge lang={lang} /></label>
            <input className="input" {...secField("contactTitle")} />
          </div>
        </div>
        <div>
          <label className="label">Intro text next to the form<LangBadge lang={lang} /></label>
          <textarea className="input min-h-20 resize-y" {...secField("contactIntro")} />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={status === "saving"} className="btn-primary disabled:opacity-60">
          {status === "saving" ? "Saving…" : "Save settings"}
        </button>
        {status === "saved" && <p className="font-mono text-xs text-green-400">Saved.</p>}
        {status === "error" && <p className="font-mono text-xs text-crimson-bright">Save failed — try again.</p>}
      </div>
    </form>
  );
}
