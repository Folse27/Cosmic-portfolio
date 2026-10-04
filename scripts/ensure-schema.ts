/**
 * Runs before `next build` (see package.json) so additive schema changes
 * reach the database before the code that reads them goes live — no need
 * to have DATABASE_URL locally. Every statement must be idempotent.
 * Usage: npm run db:ensure
 */
import { Pool } from "pg";

async function main() {
  if (!process.env.DATABASE_URL) {
    console.warn("⚠ DATABASE_URL is not set — skipping schema check.");
    return;
  }
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });

  const { rows } = await pool.query(`SELECT to_regclass('drizzle.__drizzle_migrations') IS NOT NULL AS tracked`);
  console.log(
    rows[0].tracked
      ? "ℹ Database was set up with db:migrate (drizzle.__drizzle_migrations exists)"
      : "ℹ Database was set up with db:push (no migrations table)",
  );

  await pool.query(`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "nav_name" text`);
  await pool.query(`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "translations" jsonb DEFAULT '{}'::jsonb NOT NULL`);
  await pool.query(`ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "translations" jsonb DEFAULT '{}'::jsonb NOT NULL`);
  await pool.query(`ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "featured" boolean DEFAULT false NOT NULL`);

  await pool.end();
  console.log("✔ Schema up to date");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
