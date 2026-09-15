import fs from "fs";
import path from "path";

import { NextResponse } from "next/server";

import { query } from "@/lib/db";

function loadCoursesFromFile() {
  const filePath = path.join(process.cwd(), "..", "data", "courses.json");
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as {
    updated_at: string;
    tracks: unknown[];
  };
}

export async function GET() {
  try {
    const { rows } = await query<{
      payload: { updated_at: string; tracks: unknown[] };
    }>("SELECT payload FROM course_catalog WHERE id = 1");

    if (rows[0]) {
      const payload = rows[0].payload;
      return NextResponse.json({
        updated_at: payload.updated_at,
        tracks: payload.tracks,
      });
    }
  } catch {
    // fall through
  }

  const file = loadCoursesFromFile();
  if (!file) {
    return NextResponse.json({ error: "Courses not seeded" }, { status: 404 });
  }
  return NextResponse.json(file);
}
