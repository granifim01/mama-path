import { NextResponse } from "next/server";

import { query } from "@/lib/db";

export async function GET() {
  const { rows } = await query<{ payload: { updated_at: string; tracks: unknown[] } }>(
    "SELECT payload FROM course_catalog WHERE id = 1",
  );

  if (!rows[0]) {
    return NextResponse.json({ error: "Courses not seeded" }, { status: 404 });
  }

  const payload = rows[0].payload;
  return NextResponse.json({
    updated_at: payload.updated_at,
    tracks: payload.tracks,
  });
}
