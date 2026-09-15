import { NextResponse } from "next/server";

import { query } from "@/lib/db";
import { createToken, verifyPassword } from "@/lib/server-auth";

export async function POST(request: Request) {
  const body = await request.json();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  const result = await query<{ id: number; password_hash: string }>(
    "SELECT id, password_hash FROM users WHERE email = $1",
    [email],
  );

  const user = result.rows[0];
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = await createToken(user.id);
  return NextResponse.json({ access_token: token, token_type: "bearer" });
}
