import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { getSession, unauthorized } from "@/lib/auth";

export async function GET() {
  if (!(await getSession())) return unauthorized();
  const rows = await db
    .select()
    .from(contactMessages)
    .orderBy(desc(contactMessages.createdAt))
    .limit(500);
  return NextResponse.json(rows);
}
