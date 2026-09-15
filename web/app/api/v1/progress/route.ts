import { NextRequest, NextResponse } from "next/server";

import { query } from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/server-auth";

export async function GET(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { rows } = await query<{
    track_id: string;
    chapter_id: string;
    completed: boolean;
    quiz_passed: boolean;
    score: number;
    completed_at: string;
  }>(
    `SELECT track_id, chapter_id, completed, quiz_passed, score, completed_at
     FROM chapter_progress WHERE user_id = $1`,
    [userId],
  );

  const tracks: Record<string, Record<string, unknown>> = {};
  for (const row of rows) {
    tracks[row.track_id] ??= {};
    tracks[row.track_id][row.chapter_id] = {
      track_id: row.track_id,
      chapter_id: row.chapter_id,
      completed: row.completed,
      quiz_passed: row.quiz_passed,
      score: row.score,
      completed_at: row.completed_at,
    };
  }

  return NextResponse.json({ tracks });
}
