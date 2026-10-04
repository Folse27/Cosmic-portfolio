"use client";

import Link from "next/link";
import { useState } from "react";
import type { LinkItem } from "@/db/schema";
import type { Dict } from "@/lib/i18n";
import { trackClick } from "@/lib/track";

export default function ContactSection({
  email,
  socials,
  labels: t,
  privacyHref,
}: {
  email: string | null;
  socials: LinkItem[];
  labels: Dict["contact"];
  privacyHref: string;
}) {
  const [form, setForm] = useState({ name: "", email: "", message: "", company: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    trackClick("contact:form-submit");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
      setForm({ name: "", email: "", message: "", company: "" });
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="grid gap-12 md:grid-cols-2">
      {/* Left: direct channels */}
      <div>
        <p className="max-w-md leading-relaxed text-gray-400">{t.intro}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          {email && (
            <a
              href={`mailto:${email}`}
              onClick={() => trackClick("contact:email")}
              className="btn-primary"
            >
              {t.emailMe}
            </a>
          )}
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackClick(`social:${s.label}`)}
              className="btn-ghost"
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>

      {/* Right: message form */}
      <form onSubmit={submit} className="card-panel space-y-4">
        {/* Honeypot — hidden from humans, catches naive bots. */}
        <input
          type="text"
          value={form.company}
          onChange={(e) => setForm({ ...form, company: e.target.value })}
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />
        <div>
          <label className="label" htmlFor="c-name">{t.name}</label>
          <input
            id="c-name"
            className="input"
            required
            maxLength={120}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder={t.namePlaceholder}
          />
        </div>
        <div>
          <label className="label" htmlFor="c-email">{t.email}</label>
          <input
            id="c-email"
            className="input"
            type="email"
            required
            maxLength={200}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder={t.emailPlaceholder}
          />
        </div>
        <div>
          <label className="label" htmlFor="c-message">{t.message}</label>
          <textarea
            id="c-message"
            className="input min-h-32 resize-y"
            required
            maxLength={5000}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder={t.messagePlaceholder}
          />
        </div>
        <button type="submit" disabled={status === "sending"} className="btn-primary w-full disabled:opacity-60">
          {status === "sending" ? t.sending : t.send}
        </button>
        {/* Art. 13 GDPR: people must be informed at the point of collection. */}
        <p className="text-center text-[11px] leading-relaxed text-gray-500">
          {t.privacyNote}{" "}
          <Link href={privacyHref} className="text-gray-500 underline transition-colors hover:text-crimson-bright">
            {t.privacyLink}
          </Link>
          .
        </p>
        {status === "sent" && (
          <p className="text-center font-mono text-xs text-green-400">{t.sent}</p>
        )}
        {status === "error" && (
          <p className="text-center font-mono text-xs text-crimson-bright">{t.error}</p>
        )}
      </form>
    </div>
  );
}
