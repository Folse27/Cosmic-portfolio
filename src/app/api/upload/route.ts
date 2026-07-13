import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { mediaImages } from "@/db/schema";
import { getSession, unauthorized } from "@/lib/auth";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

/** POST /api/upload (multipart form, field "file") → { url } */
export async function POST(req: Request) {
  if (!(await getSession())) return unauthorized();

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      {
        error:
          "Uploads are not configured. Add a Blob store to your Vercel project (Storage → Blob) or paste an image URL instead.",
      },
      { status: 501 },
    );
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image is too large (max 8 MB)" }, { status: 400 });
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-80);
  const blob = await put(`portfolio/${Date.now()}-${safeName}`, file, { access: "public" });

  const [saved] = await db
    .insert(mediaImages)
    .values({ url: blob.url, pathname: blob.pathname })
    .returning();

  return NextResponse.json({ url: blob.url, id: saved.id });
}
