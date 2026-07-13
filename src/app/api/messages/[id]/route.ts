import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { getSession, unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, { params }: Params) {
  if (!(await getSession())) return unauthorized();
  const { id } = await params;
  await db.delete(contactMessages).where(eq(contactMessages.id, id));
  return NextResponse.json({ ok: true });
}
