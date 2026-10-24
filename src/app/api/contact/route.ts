import { NextResponse } from "next/server";
import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const wait = await rateLimit(req, "contact");
  if (wait) return tooManyRequests(wait, "Too many messages. Please try again later or use email.");

  let body: { name?: string; email?: string; message?: string; company?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Honeypot field: real users never see it, naive bots fill it.
  if (body.company) return NextResponse.json({ ok: true });

  const name = (body.name ?? "").trim().slice(0, 120);
  const email = (body.email ?? "").trim().slice(0, 200);
  const message = (body.message ?? "").trim().slice(0, 5000);

  if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Please fill in all fields with a valid email." }, { status: 400 });
  }

  await db.insert(contactMessages).values({ name, email, message });
  return NextResponse.json({ ok: true });
}
