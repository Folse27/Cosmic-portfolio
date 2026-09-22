/**
 * Absolute base URL of the public site.
 *
 * Open Graph and canonical tags must be absolute URLs — social platforms
 * fetch them from their own servers, so a relative path is meaningless to
 * them. Next resolves relative paths against `metadataBase`, which is what
 * this value feeds.
 *
 * Resolution order:
 *   1. NEXT_PUBLIC_SITE_URL   — set this in Vercel once a custom domain exists
 *   2. VERCEL_PROJECT_PRODUCTION_URL — injected by Vercel automatically, so
 *      preview deployments still point their canonicals at production
 *   3. the current .vercel.app address, as a last resort
 */
const FALLBACK_URL = "https://cosmic-portfolio-lemon.vercel.app";

function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/+$/, "")}`;

  return FALLBACK_URL;
}

export const SITE_URL = resolveSiteUrl();

/** Default social preview card. 1200×630 is the ratio every platform crops to. */
export const OG_IMAGE = "/images/og-image.jpg";
