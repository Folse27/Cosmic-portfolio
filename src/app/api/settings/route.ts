import { NextResponse } from "next/server";
import { db } from "@/db";
import { siteSettings, type LinkItem } from "@/db/schema";
import { getSession, unauthorized } from "@/lib/auth";
import { DEFAULT_SETTINGS, getSettings } from "@/lib/data";

export async function GET() {
  return NextResponse.json(await getSettings());
}

export async function PUT(req: Request) {
  if (!(await getSession())) return unauthorized();

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const str = (v: unknown, fallback: string, max = 20000) =>
    typeof v === "string" ? v.slice(0, max) : fallback;
  const strOrNull = (v: unknown, max = 1000) =>
    typeof v === "string" && v.trim() ? v.slice(0, max) : null;

  const socials: LinkItem[] = Array.isArray(body.socials)
    ? body.socials
        .filter(
          (x): x is LinkItem =>
            !!x && typeof x === "object" && typeof (x as LinkItem).label === "string" && typeof (x as LinkItem).url === "string",
        )
        .map((x) => ({ label: x.label.slice(0, 80), url: x.url.slice(0, 1000) }))
        .slice(0, 20)
    : [];

  const values = {
    name: str(body.name, DEFAULT_SETTINGS.name, 120).trim() || DEFAULT_SETTINGS.name,
    title: str(body.title, DEFAULT_SETTINGS.title, 200).trim(),
    tagline: str(body.tagline, "", 500).trim(),
    bio: str(body.bio, "").trim(),
    profileImage: strOrNull(body.profileImage),
    email: strOrNull(body.email, 200),
    metaDescription: str(body.metaDescription, "", 300).trim(),
    skills: Array.isArray(body.skills)
      ? body.skills.filter((s): s is string => typeof s === "string" && !!s.trim()).map((s) => s.slice(0, 60)).slice(0, 60)
      : [],
    socials,
    updatedAt: new Date(),
  };

  const [saved] = await db
    .insert(siteSettings)
    .values({ id: "singleton", ...values })
    .onConflictDoUpdate({ target: siteSettings.id, set: values })
    .returning();

  return NextResponse.json(saved);
}
