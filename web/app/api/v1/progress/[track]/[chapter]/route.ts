import { NextRequest, NextResponse } from "next/server";

import { query } from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/server-auth";

type Params = Promise<{ track: string; chapter: string }>;

export async function PUT(request: NextRequest, { params }: { params: Params }) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { track, chapter } = await params;
  const body = await request.json();

  await query(
    `
    INSERT INTO chapter_progress (user_id, track_id, chapter_id, completed, quiz_passed, score)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (user_id, track_id, chapter_id) DO UPDATE SET
      completed = EXCLUDED.completed,
      quiz_passed = EXCLUDED.quiz_passed,
      score = EXCLUDED.score,
      completed_at = NOW()
    `,
    [
      userId,
      track,
      chapter,
      Boolean(body.completed),
      Boolean(body.quiz_passed),
      Number(body.score ?? 0),
    ],
  );

  const result = await query<{
    track_id: string;
    chapter_id: string;
    completed: boolean;
    quiz_passed: boolean;
    score: number;
    completed_at: string;
  }>(
    `SELECT track_id, chapter_id, completed, quiz_passed, score, completed_at
     FROM chapter_progress WHERE user_id = $1 AND track_id = $2 AND chapter_id = $3`,
    [userId, track, chapter],
  );

  const row = result.rows[0];
  return NextResponse.json({
    track_id: row.track_id,
    chapter_id: row.chapter_id,
    completed: row.completed,
    quiz_passed: row.quiz_passed,
    score: row.score,
    completed_at: row.completed_at,
  });
}
