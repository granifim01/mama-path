import { NextRequest, NextResponse } from "next/server";

import { query } from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/server-auth";

export async function GET(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await query<{
    id: number;
    email: string;
    name: string;
    created_at: string;
  }>("SELECT id, email, name, created_at FROM users WHERE id = $1", [userId]);

  const user = result.rows[0];
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}
