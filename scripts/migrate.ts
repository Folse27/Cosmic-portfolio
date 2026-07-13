/**
 * Applies the SQL migrations in ./drizzle to DATABASE_URL.
 * Alternative to `npm run db:push` when you prefer tracked migrations.
 * Usage: npm run db:migrate
 */
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set (create .env from .env.example).");
  }
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  await migrate(drizzle(pool), { migrationsFolder: "drizzle" });
  await pool.end();
  console.log("✔ Migrations applied");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
