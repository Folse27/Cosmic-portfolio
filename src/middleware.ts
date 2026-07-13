import { jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "portfolio_admin";

/**
 * Protects every /admin route. Runs on the edge, so it only verifies the
 * session JWT — no database access. API routes re-check via getSession().
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(SESSION_COOKIE)?.value;

  let valid = false;
  const secret = process.env.AUTH_SECRET;
  if (token && secret) {
    try {
      await jwtVerify(token, new TextEncoder().encode(secret));
      valid = true;
    } catch {
      valid = false;
    }
  }

  if (pathname === "/admin/login") {
    return valid ? NextResponse.redirect(new URL("/admin", req.url)) : NextResponse.next();
  }
  return valid ? NextResponse.next() : NextResponse.redirect(new URL("/admin/login", req.url));
}

export const config = {
  matcher: ["/admin/:path*"],
};
