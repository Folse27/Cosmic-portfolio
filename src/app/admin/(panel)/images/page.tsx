"use client";

import { useEffect, useRef, useState } from "react";
import type { MediaImage } from "@/db/schema";

export default function AdminImagesPage() {
  const [images, setImages] = useState<MediaImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/images")
      .then((r) => r.json())
      .then(setImages)
      .finally(() => setLoading(false));
  }, []);

  async function upload(file: File) {
    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setImages([{ id: data.id, url: data.url, pathname: null, createdAt: new Date() } as MediaImage, ...images]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function remove(image: MediaImage) {
    if (!confirm("Delete this image? Anywhere it is used will show a broken link.")) return;
    await fetch(`/api/images?id=${image.id}`, { method: "DELETE" });
    setImages(images.filter((i) => i.id !== image.id));
  }

  async function copy(url: string) {
    await navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-white">Media library</h1>
          <p className="mt-1 font-mono text-xs text-gray-500">
            Upload images here, then copy the URL into any project or setting.
          </p>
        </div>
        <button onClick={() => fileRef.current?.click()} disabled={busy} className="btn-primary disabled:opacity-60">
          {busy ? "Uploading…" : "Upload image"}
        </button>
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

      {error && <p className="font-mono text-xs text-crimson-bright">{error}</p>}

      {loading ? (
        <p className="font-mono text-xs text-gray-500">Loading…</p>
      ) : images.length === 0 ? (
        <p className="font-mono text-xs text-gray-500">
          No uploads yet. Uploads require a Vercel Blob store (see README) — pasting external image URLs
          always works without it.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((image) => (
            <div key={image.id} className="group overflow-hidden rounded-xl border border-white/10 bg-panel">
              <div className="aspect-square w-full overflow-hidden bg-black/40">
                <img src={image.url} alt="" className="h-full w-full object-cover" loading="lazy" />
              </div>
              <div className="flex items-center justify-between gap-1 p-2">
                <button
                  onClick={() => copy(image.url)}
                  className="rounded px-2 py-1 font-mono text-[11px] text-gray-400 transition-colors hover:text-crimson-bright"
                >
                  {copied === image.url ? "Copied!" : "Copy URL"}
                </button>
                <button
                  onClick={() => remove(image)}
                  className="rounded px-2 py-1 font-mono text-[11px] text-gray-600 transition-colors hover:text-crimson-bright"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
