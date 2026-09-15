import { NextResponse } from "next/server";

import { query } from "@/lib/db";
import { createToken, hashPassword } from "@/lib/server-auth";

export async function POST(request: Request) {
  const body = await request.json();
  const email = String(body.email ?? "").trim().toLowerCase();
  const name = String(body.name ?? "").trim();
  const password = String(body.password ?? "");

  if (!email || !name || password.length < 6) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const exists = await query<{ id: number }>(
    "SELECT id FROM users WHERE email = $1",
    [email],
  );

  if (exists.rows[0]) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const inserted = await query<{ id: number }>(
    "INSERT INTO users (email, name, password_hash) VALUES ($1, $2, $3) RETURNING id",
    [email, name, passwordHash],
  );

  const token = await createToken(inserted.rows[0].id);
  return NextResponse.json({ access_token: token, token_type: "bearer" });
}
