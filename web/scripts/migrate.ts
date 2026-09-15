import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import path from "path";

config({ path: ".env.local" });

const databaseUrl =
  process.env.DATABASE_URL ??
  "postgresql://mamapath:mamapath@127.0.0.1:5432/mamapath";

async function main() {
  const pool = new Pool({ connectionString: databaseUrl });
  const db = drizzle(pool);
  const migrationsFolder = path.join(process.cwd(), "db", "migrations");

  console.log("Applying migrations from", migrationsFolder);
  await migrate(db, { migrationsFolder });
  await pool.end();
  console.log("Migrations applied successfully.");
}

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
