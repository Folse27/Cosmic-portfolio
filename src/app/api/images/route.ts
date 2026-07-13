import { del } from "@vercel/blob";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { mediaImages } from "@/db/schema";
import { getSession, unauthorized } from "@/lib/auth";

export async function GET() {
  if (!(await getSession())) return unauthorized();
  const rows = await db.select().from(mediaImages).orderBy(desc(mediaImages.createdAt)).limit(500);
  return NextResponse.json(rows);
}

/** DELETE /api/images?id=… — removes the record and (if possible) the blob. */
export async function DELETE(req: Request) {
  if (!(await getSession())) return unauthorized();

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const rows = await db.select().from(mediaImages).where(eq(mediaImages.id, id)).limit(1);
  const image = rows[0];
  if (!image) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (image.pathname && process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      await del(image.url);
    } catch {
      // Blob already gone / token rotated — still remove our record.
    }
  }
  await db.delete(mediaImages).where(eq(mediaImages.id, id));
  return NextResponse.json({ ok: true });
}
