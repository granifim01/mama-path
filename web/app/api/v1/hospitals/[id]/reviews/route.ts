import { NextRequest, NextResponse } from "next/server";

import { query } from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/server-auth";

type Params = Promise<{ id: string }>;

export async function POST(request: NextRequest, { params }: { params: Params }) {
  const { id } = await params;
  const body = await request.json();
  const text = String(body.text ?? "").trim();
  const authorName = String(body.author_name ?? "").trim();
  const rating = body.rating ? Number(body.rating) : null;
  const birthType = body.birth_type ? String(body.birth_type) : null;

  if (!text || text.length < 20) {
    return NextResponse.json(
      { error: "Review must be at least 20 characters" },
      { status: 400 },
    );
  }

  const exists = await query("SELECT id FROM hospitals WHERE id = $1", [id]);
  if (!exists.rows[0]) {
    return NextResponse.json({ error: "Hospital not found" }, { status: 404 });
  }

  const userId = await getUserIdFromRequest(request);
  let name = authorName;

  if (userId) {
    const user = await query<{ name: string }>(
      "SELECT name FROM users WHERE id = $1",
      [userId],
    );
    name = user.rows[0]?.name ?? authorName;
  }

  if (!name) {
    return NextResponse.json({ error: "Author name required" }, { status: 400 });
  }

  const inserted = await query<{
    id: number;
    author_name: string;
    rating: number | null;
    text: string;
    created_at: string;
  }>(
    `INSERT INTO hospital_reviews (hospital_id, user_id, author_name, rating, birth_type, text)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, author_name, rating, text, created_at`,
    [id, userId, name, rating, birthType, text],
  );

  return NextResponse.json(inserted.rows[0], { status: 201 });
}
