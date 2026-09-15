import { config } from "dotenv";
import fs from "fs";
import path from "path";
import { Pool } from "pg";

config({ path: ".env.local" });

const databaseUrl =
  process.env.DATABASE_URL ??
  "postgresql://mamapath:mamapath@127.0.0.1:5432/mamapath";

async function main() {
  const jsonPath = path.join(process.cwd(), "..", "data", "hospitals.json");
  const payload = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  const hospitals: Array<Record<string, unknown>> = payload.hospitals ?? [];

  const pool = new Pool({ connectionString: databaseUrl });
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    let upserted = 0;

    for (const item of hospitals) {
      await client.query(
        `
        INSERT INTO hospitals (
          id, city_slug, city_name, name, facility_type, address, phone, rating,
          lat, lng, has_paid_birth, free_birth_available, payload, updated_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13, NOW())
        ON CONFLICT (id) DO UPDATE SET
          city_slug = EXCLUDED.city_slug,
          city_name = EXCLUDED.city_name,
          name = EXCLUDED.name,
          facility_type = EXCLUDED.facility_type,
          address = EXCLUDED.address,
          phone = EXCLUDED.phone,
          rating = EXCLUDED.rating,
          lat = EXCLUDED.lat,
          lng = EXCLUDED.lng,
          has_paid_birth = EXCLUDED.has_paid_birth,
          free_birth_available = EXCLUDED.free_birth_available,
          payload = EXCLUDED.payload,
          updated_at = NOW()
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
      upserted += 1;
    }

    await client.query("COMMIT");
    console.log(`Synced ${upserted} hospitals to PostgreSQL.`);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error("Sync failed:", error);
  process.exit(1);
});
