import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

const databaseUrl = process.env.DATABASE_URL;

export const pool = databaseUrl
  ? new Pool({ connectionString: databaseUrl })
  : null;

export const db = pool ? drizzle(pool, { schema }) : null;

if (!databaseUrl) {
  console.warn(
    "⚠️  DATABASE_URL not set. Database features will be unavailable. Set DATABASE_URL to a PostgreSQL connection string to enable.",
  );
}

export * from "./schema";
