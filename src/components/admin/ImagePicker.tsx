"use client";

import { useRef, useState } from "react";

/**
 * Single-image field: paste any image URL, or upload a file
 * (uploads go to Vercel Blob via /api/upload when configured).
 */
export function ImagePicker({
  value,
  onChange,
  label,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div>
      {label && <span className="label">{label}</span>}
      <div className="flex items-start gap-3">
        <div className="h-20 w-28 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-black/40">
          {value ? (
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center font-mono text-[10px] text-gray-600">
              no image
            </div>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <input
            className="input"
            placeholder="https://… paste an image URL"
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value.trim() || null)}
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={busy}
              className="rounded-lg border border-white/15 px-3 py-1.5 font-mono text-xs text-gray-300 transition-colors hover:border-crimson/60 disabled:opacity-50"
            >
              {busy ? "Uploading…" : "Upload file"}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange(null)}
                className="rounded-lg px-3 py-1.5 font-mono text-xs text-gray-500 transition-colors hover:text-crimson-bright"
              >
                Remove
              </button>
            )}
          </div>
          {error && <p className="font-mono text-xs text-crimson-bright">{error}</p>}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) upload(f);
            }}
          />
        </div>
      </div>
    </div>
  );
}

/** Ordered list of gallery images built on top of ImagePicker. */
export function GalleryEditor({
  value,
  onChange,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
}) {
  const [draft, setDraft] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <span className="label">Gallery images</span>
      {value.map((url, i) => (
        <div key={`${url}-${i}`} className="flex items-center gap-3">
          <img src={url} alt="" className="h-14 w-20 shrink-0 rounded-lg border border-white/10 object-cover" />
          <p className="min-w-0 flex-1 truncate font-mono text-xs text-gray-500">{url}</p>
          <button
            type="button"
            onClick={() => onChange(value.filter((_, j) => j !== i))}
            className="shrink-0 rounded-lg px-2 py-1 font-mono text-xs text-gray-500 transition-colors hover:text-crimson-bright"
          >
            Remove
          </button>
        </div>
      ))}
      <div className="rounded-xl border border-dashed border-white/10 p-3">
        <ImagePicker value={draft} onChange={setDraft} label="Add an image" />
        <button
          type="button"
          disabled={!draft}
          onClick={() => {
            if (draft) {
              onChange([...value, draft]);
              setDraft(null);
            }
          }}
          className="mt-2 rounded-lg border border-white/15 px-3 py-1.5 font-mono text-xs text-gray-300 transition-colors hover:border-crimson/60 disabled:opacity-40"
        >
          Add to gallery
        </button>
      </div>
    </div>
  );
}
