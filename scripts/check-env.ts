/**
 * Runs first in `npm run build`. On Vercel a missing required variable fails
 * the build, so a deploy can never go live without a database, a session
 * secret or the legally required Impressum details — the previous deployment
 * simply stays online. Locally it only warns.
 */
const REQUIRED = ["DATABASE_URL", "AUTH_SECRET", "LEGAL_NAME", "LEGAL_ADDRESS", "LEGAL_EMAIL"];

const missing = REQUIRED.filter((key) => !process.env[key]?.trim());

if (missing.length === 0) {
  console.log("✔ Required environment variables are set");
} else {
  const message = `Missing environment variables: ${missing.join(", ")} (see .env.example)`;
  if (process.env.VERCEL) {
    console.error(`✖ ${message}`);
    process.exit(1);
  }
  console.warn(`⚠ ${message}`);
}
