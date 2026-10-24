import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { createSession } from "@/lib/auth";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";

// Constant-shape comparison target so unknown emails take the same time
// as wrong passwords (avoids trivial account enumeration).
const DUMMY_HASH = "$2a$12$C6UzMDM.H6dfI/f/IKcEeO7ZBpDLh0i7a3ZbXlqDe1cJqDq0y1u5e";

export async function POST(req: Request) {
  const wait = await rateLimit(req, "login");
  if (wait) return tooManyRequests(wait, "Too many login attempts. Please wait and try again.");

  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const rows = await db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1);
  const user = rows[0];

  const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok) {
    await new Promise((r) => setTimeout(r, 350)); // soften brute-force attempts
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  await createSession({ id: user.id, email: user.email });
  return NextResponse.json({ ok: true });
}
