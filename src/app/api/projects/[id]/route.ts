import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { getSession, unauthorized } from "@/lib/auth";
import { slugify } from "@/lib/data";
import { projectPayload } from "@/lib/project-payload";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  if (!(await getSession())) return unauthorized();
  const { id } = await params;
  const rows = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(rows[0]);
}

export async function PUT(req: Request, { params }: Params) {
  if (!(await getSession())) return unauthorized();
  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data = projectPayload(body);
  if (!data.title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

  const update: Record<string, unknown> = { ...data, updatedAt: new Date() };
  if (typeof body.slug === "string" && body.slug.trim()) {
    update.slug = slugify(body.slug);
  }

  try {
    const [updated] = await db.update(projects).set(update).where(eq(projects.id, id)).returning();
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Slug already in use" }, { status: 409 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  if (!(await getSession())) return unauthorized();
  const { id } = await params;
  await db.delete(projects).where(eq(projects.id, id));
  return NextResponse.json({ ok: true });
}
