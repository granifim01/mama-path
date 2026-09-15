import { config } from "dotenv";
import fs from "fs";
import path from "path";
import { Pool } from "pg";

config({ path: ".env.local" });

const databaseUrl =
  process.env.DATABASE_URL ??
  "postgresql://mamapath:mamapath@127.0.0.1:5432/mamapath";

async function main() {
  const pool = new Pool({ connectionString: databaseUrl });
  const countResult = await pool.query<{ c: string }>(
    "SELECT COUNT(*)::text AS c FROM hospitals",
  );

  if (Number(countResult.rows[0]?.c ?? 0) > 0) {
    console.log("Seed skipped: hospitals table is not empty.");
    await pool.end();
    return;
  }

  const dataDir = path.join(process.cwd(), "..", "data");
  const hospitals = JSON.parse(
    fs.readFileSync(path.join(dataDir, "hospitals.json"), "utf-8"),
  );
  const courses = JSON.parse(
    fs.readFileSync(path.join(dataDir, "courses.json"), "utf-8"),
  );
  const products = JSON.parse(
    fs.readFileSync(path.join(dataDir, "products.json"), "utf-8"),
  );

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    for (const item of hospitals.hospitals) {
      await client.query(
        `
        INSERT INTO hospitals (
          id, city_slug, city_name, name, facility_type, address, phone, rating,
          lat, lng, has_paid_birth, free_birth_available, payload
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
        `,
        [
          item.id,
          item.city_slug,
          item.city_name,
          item.name,
          item.facility_type,
          item.address ?? null,
          item.phone ?? null,
          item.rating ?? null,
          item.lat ?? null,
          item.lng ?? null,
          item.has_paid_birth ?? null,
          item.free_birth_available ?? null,
          JSON.stringify(item),
        ],
      );
    }

    await client.query(
      `
      INSERT INTO course_catalog (id, payload)
      VALUES (1, $1)
      ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()
      `,
      [JSON.stringify(courses)],
    );

    await client.query(
      `
      INSERT INTO product_catalog (id, payload)
      VALUES (1, $1)
      ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()
      `,
      [JSON.stringify(products)],
    );

    await client.query("COMMIT");
    console.log(`Seeded ${hospitals.hospitals.length} hospitals.`);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
