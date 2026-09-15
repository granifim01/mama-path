import { Pool, type QueryResultRow } from "pg";

const DEFAULT_DATABASE_URL =
  "postgresql://mamapath:mamapath@127.0.0.1:5432/mamapath";

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL,
      max: 10,
    });
  }
  return pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
) {
  return getPool().query<T>(text, params);
}
