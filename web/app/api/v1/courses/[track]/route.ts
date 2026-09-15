import { NextResponse } from "next/server";

import { query } from "@/lib/db";

type Params = Promise<{ track: string }>;

export async function GET(_request: Request, { params }: { params: Params }) {
  const { track: trackId } = await params;
  const { rows } = await query<{ payload: { tracks: Array<{ id: string }> } }>(
    "SELECT payload FROM course_catalog WHERE id = 1",
  );

  if (!rows[0]) {
    return NextResponse.json({ error: "Courses not seeded" }, { status: 404 });
  }

  const track = rows[0].payload.tracks.find((item) => item.id === trackId);
  if (!track) {
    return NextResponse.json({ error: "Track not found" }, { status: 404 });
  }

  return NextResponse.json(track);
}
