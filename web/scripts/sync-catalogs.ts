import { config } from "dotenv";
import fs from "fs";
import path from "path";
import { Pool } from "pg";

config({ path: ".env.local" });

const databaseUrl =
  process.env.DATABASE_URL ??
  "postgresql://mamapath:mamapath@127.0.0.1:5432/mamapath";

async function main() {
  const dataDir = path.join(process.cwd(), "..", "data");
  const courses = JSON.parse(
    fs.readFileSync(path.join(dataDir, "courses.json"), "utf-8"),
  );
  const products = JSON.parse(
    fs.readFileSync(path.join(dataDir, "products.json"), "utf-8"),
  );

  const pool = new Pool({ connectionString: databaseUrl });
  await pool.query(
    `INSERT INTO course_catalog (id, payload) VALUES (1, $1)
     ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()`,
    [JSON.stringify(courses)],
  );
  await pool.query(
    `INSERT INTO product_catalog (id, payload) VALUES (1, $1)
     ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()`,
    [JSON.stringify(products)],
  );
  await pool.end();
  console.log("Synced courses and products catalogs.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
