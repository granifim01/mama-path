import { NextRequest, NextResponse } from "next/server";

import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city");
  const q = searchParams.get("q");
  const paid = searchParams.get("paid") === "1";
  const free = searchParams.get("free") === "1";

  const { rows } = await query<{ payload: Record<string, unknown>; updated_at: string }>(
    "SELECT payload, updated_at FROM hospitals ORDER BY city_slug, name",
  );

  let hospitals = rows.map((row) => row.payload);

  if (city) {
    hospitals = hospitals.filter((item) => item.city_slug === city);
  }
  if (q) {
    const search = q.toLowerCase();
    hospitals = hospitals.filter((item) =>
      `${item.name} ${item.address ?? ""}`.toLowerCase().includes(search),
    );
  }
  if (paid) {
    hospitals = hospitals.filter((item) => item.has_paid_birth);
  }
  if (free) {
    hospitals = hospitals.filter((item) => item.free_birth_available === true);
  }

  return NextResponse.json({
    updated_at: rows[0]?.updated_at ?? new Date(0).toISOString(),
    count: hospitals.length,
    hospitals,
  });
}
