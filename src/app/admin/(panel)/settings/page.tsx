"use client";

import { useEffect, useState } from "react";
import type { LinkItem, SiteSettings } from "@/db/schema";
import { ImagePicker } from "@/components/admin/ImagePicker";

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

export default function AdminSettingsPage() {
  const [form, setForm] = useState({
    name: "",
    title: "",
    tagline: "",
    bio: "",
    email: "",
    metaDescription: "",
    skills: "",
    socials: "",
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "idle" | "saving" | "saved" | "error">("loading");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((s: SiteSettings) => {
        setForm({
          name: s.name,
          title: s.title,
          tagline: s.tagline,
          bio: s.bio,
          email: s.email ?? "",
          metaDescription: s.metaDescription,
          skills: s.skills.join(", "),
          socials: socialsToText(s.socials),
        });
        setProfileImage(s.profileImage);
        setStatus("idle");
      })
      .catch(() => setStatus("error"));
  }, []);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [key]: e.target.value });

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        profileImage,
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
        socials: socialsFromText(form.socials),
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

      <div className="card-panel space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Name (hero headline)</label>
            <input className="input" value={form.name} onChange={set("name")} />
          </div>
          <div>
            <label className="label">Title / role (above the name)</label>
            <input className="input" value={form.title} onChange={set("title")} />
          </div>
        </div>
        <div>
          <label className="label">Tagline (under the name)</label>
          <textarea className="input min-h-16 resize-y" value={form.tagline} onChange={set("tagline")} />
        </div>
        <div>
          <label className="label">SEO meta description</label>
          <textarea className="input min-h-16 resize-y" value={form.metaDescription} onChange={set("metaDescription")} />
        </div>
      </div>

      <div className="card-panel space-y-4">
        <ImagePicker label="Profile photo" value={profileImage} onChange={setProfileImage} />
        <div>
          <label className="label">Bio — blank line starts a new paragraph</label>
          <textarea className="input min-h-40 resize-y" value={form.bio} onChange={set("bio")} />
        </div>
        <div>
          <label className="label">Skills / tech stack — comma separated</label>
          <input className="input" value={form.skills} onChange={set("skills")} />
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
