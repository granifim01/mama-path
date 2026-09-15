import { NextResponse } from "next/server";

import { query } from "@/lib/db";

type Params = Promise<{ id: string }>;

export async function GET(_request: Request, { params }: { params: Params }) {
  const { id } = await params;
  const hospital = await query<{ payload: Record<string, unknown> }>(
    "SELECT payload FROM hospitals WHERE id = $1",
    [id],
  );

  if (!hospital.rows[0]) {
    return NextResponse.json({ error: "Hospital not found" }, { status: 404 });
  }

  const reviews = await query<{
    id: number;
    author_name: string;
    rating: number | null;
    birth_type: string | null;
    text: string;
    created_at: string;
  }>(
    `SELECT id, author_name, rating, birth_type, text, created_at
     FROM hospital_reviews WHERE hospital_id = $1
     ORDER BY created_at DESC LIMIT 30`,
    [id],
  );

  return NextResponse.json({
    hospital: hospital.rows[0].payload,
    user_reviews: reviews.rows,
  });
}
