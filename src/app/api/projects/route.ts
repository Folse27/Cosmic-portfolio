import { asc, eq, max } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { getSession, unauthorized } from "@/lib/auth";
import { slugify } from "@/lib/data";
import { projectPayload } from "@/lib/project-payload";

/** GET /api/projects            → published projects (public)
 *  GET /api/projects?all=1      → every project, for the admin list       */
export async function GET(req: Request) {
  const all = new URL(req.url).searchParams.get("all") === "1";
  if (all && !(await getSession())) return unauthorized();

  const rows = all
    ? await db.select().from(projects).orderBy(asc(projects.sortOrder), asc(projects.createdAt))
    : await db
        .select()
        .from(projects)
        .where(eq(projects.published, true))
        .orderBy(asc(projects.sortOrder), asc(projects.createdAt));

  return NextResponse.json(rows);
}

/** POST /api/projects → create (admin) */
export async function POST(req: Request) {
  if (!(await getSession())) return unauthorized();

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data = projectPayload(body);
  if (!data.title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

  // Unique slug: user-provided or derived from the title.
  let slug = slugify(typeof body.slug === "string" && body.slug ? body.slug : data.title);
  const taken = new Set(
    (await db.select({ slug: projects.slug }).from(projects)).map((r) => r.slug),
  );
  if (taken.has(slug)) {
    let i = 2;
    while (taken.has(`${slug}-${i}`)) i++;
    slug = `${slug}-${i}`;
  }

  const [row] = await db.select({ top: max(projects.sortOrder) }).from(projects);
  const nextOrder = row?.top == null ? 0 : Number(row.top) + 1;

  const [created] = await db
    .insert(projects)
    .values({ ...data, slug, sortOrder: nextOrder })
    .returning();

  return NextResponse.json(created, { status: 201 });
}
