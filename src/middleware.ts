import { jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n";

const SESSION_COOKIE = "portfolio_admin";

export async function middleware(req: NextRequest) {
  return req.nextUrl.pathname.startsWith("/admin") ? guardAdmin(req) : routeLocale(req);
}

/**
 * Protects every /admin route. Runs on the edge, so it only verifies the
 * session JWT — no database access. API routes re-check via getSession().
 */
async function guardAdmin(req: NextRequest) {
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

/**
 * Public pages live under app/(site)/[lang]. German is served at the
 * unprefixed URLs, so those are rewritten to /de/... internally, and an
 * explicit /de/... redirects back to keep one canonical URL per page.
 * The resolved locale travels to the root layout as x-locale (<html lang>).
 */
function routeLocale(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const first = pathname.split("/")[1];

  if (first === DEFAULT_LOCALE) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.slice(DEFAULT_LOCALE.length + 1) || "/";
    return NextResponse.redirect(url, 308);
  }

  const lang = isLocale(first) ? first : DEFAULT_LOCALE;
  const headers = new Headers(req.headers);
  headers.set("x-locale", lang);

  if (isLocale(first)) return NextResponse.next({ request: { headers } });

  const url = req.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url, { request: { headers } });
}

export const config = {
  // Everything except API routes, Next internals and files with an extension
  // (images, icon.svg, robots.txt…).
  matcher: ["/admin/:path*", "/((?!api|admin|_next|.*\\..*).*)"],
};
