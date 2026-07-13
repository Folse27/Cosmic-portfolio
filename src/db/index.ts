import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

/**
 * A single Pool is cached on globalThis so hot-reload in dev (and warm
 * serverless invocations in production) reuse connections instead of
 * opening a new one per request. Point DATABASE_URL at a *pooled*
 * connection string (Neon pooled / Supabase pooler) for serverless.
 */
const globalForDb = globalThis as unknown as { __pgPool?: Pool };

const pool =
  globalForDb.__pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
  });

if (process.env.NODE_ENV !== "production") globalForDb.__pgPool = pool;

export const db = drizzle(pool, { schema });
