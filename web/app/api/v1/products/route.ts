import { NextResponse } from "next/server";

import { query } from "@/lib/db";

export async function GET() {
  const { rows } = await query<{ payload: { updated_at: string; categories: unknown[] } }>(
    "SELECT payload FROM product_catalog WHERE id = 1",
  );

  if (!rows[0]) {
    return NextResponse.json({ error: "Products not seeded" }, { status: 404 });
  }

  const payload = rows[0].payload;
  return NextResponse.json({
    updated_at: payload.updated_at,
    categories: payload.categories,
  });
}
