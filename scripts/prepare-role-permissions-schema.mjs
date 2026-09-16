import "dotenv/config";

import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required.");
}

function normalizeDatabaseUrl(value) {
  const url = new URL(value);
  const sslMode = url.searchParams.get("sslmode");

  if (url.searchParams.get("channel_binding") === "require") {
    url.searchParams.delete("channel_binding");
  }

  if (sslMode === "disable") {
    return url.toString();
  }

  if (!sslMode || ["prefer", "verify-ca", "verify-full"].includes(sslMode)) {
    url.searchParams.set("sslmode", "require");
  }

  return url.toString();
}

const pool = new Pool({
  connectionString: normalizeDatabaseUrl(process.env.DATABASE_URL),
  ssl: { rejectUnauthorized: false },
  max: 1,
});

try {
  const { rows } = await pool.query(`
    SELECT data_type, udt_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'users'
      AND column_name = 'role'
  `);

  const roleColumn = rows[0];

  if (!roleColumn) {
    console.log("users.role was not found; skipping role column preparation.");
  } else if (roleColumn.data_type === "text") {
    console.log("users.role is already text; no preparation needed.");
  } else {
    await pool.query("BEGIN");
    await pool.query(`ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT`);
    await pool.query(`ALTER TABLE "users" ALTER COLUMN "role" TYPE TEXT USING "role"::text`);
    await pool.query(`ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'SALES'`);
    await pool.query("COMMIT");
    console.log(`Converted users.role from ${roleColumn.udt_name} to text safely.`);
  }
} catch (error) {
  try {
    await pool.query("ROLLBACK");
  } catch {}

  throw error;
} finally {
  await pool.end();
}
