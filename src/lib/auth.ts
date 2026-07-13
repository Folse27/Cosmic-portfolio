import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

/**
 * Cookie-based admin sessions.
 * A signed JWT (HS256, AUTH_SECRET) is stored in an httpOnly cookie.
 * SameSite=Lax + JSON-only mutation endpoints keep cross-site request
 * forgery out of the admin API.
 */
export const SESSION_COOKIE = "portfolio_admin";
const SESSION_DAYS = 7;

function secretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not set. Add it to your environment (see .env.example).");
  }
  return new TextEncoder().encode(secret);
}

export type Session = { userId: string; email: string };

export async function createSession(user: { id: string; email: string }) {
  const token = await new SignJWT({ email: user.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secretKey());

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * SESSION_DAYS,
  });
}

export async function destroySession() {
  (await cookies()).delete(SESSION_COOKIE);
}

/** Returns the current admin session, or null when not signed in. */
export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (!payload.sub) return null;
    return { userId: payload.sub, email: String(payload.email ?? "") };
  } catch {
    return null;
  }
}

/** Standard 401 response for admin API routes. */
export function unauthorized() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}
