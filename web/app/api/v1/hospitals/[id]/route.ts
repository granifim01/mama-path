import { NextResponse } from "next/server";

import { query } from "@/lib/db";
import { loadHospitalsFromFile } from "@/lib/hospitals";

type Params = Promise<{ id: string }>;

export async function GET(_request: Request, { params }: { params: Params }) {
  const { id: rawId } = await params;
  const id = decodeURIComponent(rawId);

  try {
    const hospital = await query<{ payload: Record<string, unknown> }>(
      "SELECT payload FROM hospitals WHERE id = $1",
      [id],
    );

    if (hospital.rows[0]) {
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
  } catch {
    // fall through to JSON catalog
  }

  const file = loadHospitalsFromFile();
  const hospital = file.hospitals.find((item) => item.id === id);
  if (!hospital) {
    return NextResponse.json({ error: "Hospital not found" }, { status: 404 });
  }

  return NextResponse.json({
    hospital,
    user_reviews: [],
  });
}
