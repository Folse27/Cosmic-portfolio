import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { getSession, unauthorized } from "@/lib/auth";

/** PUT /api/projects/reorder  { ids: string[] } — index becomes sortOrder. */
export async function PUT(req: Request) {
  if (!(await getSession())) return unauthorized();

  let body: { ids?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const ids = Array.isArray(body.ids) ? body.ids.filter((x): x is string => typeof x === "string") : [];
  if (!ids.length) return NextResponse.json({ error: "ids[] required" }, { status: 400 });

  await Promise.all(
    ids.map((id, index) => db.update(projects).set({ sortOrder: index }).where(eq(projects.id, id))),
  );
  return NextResponse.json({ ok: true });
}
