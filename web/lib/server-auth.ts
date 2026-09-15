import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { NextRequest } from "next/server";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "dev-secret-change-in-production",
);

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

export async function createToken(userId: number): Promise<string> {
  return new SignJWT({ sub: String(userId) })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function getUserIdFromRequest(
  request: NextRequest,
): Promise<number | null> {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) {
    return null;
  }
  try {
    const { payload } = await jwtVerify(header.slice(7), SECRET);
    return Number(payload.sub);
  } catch {
    return null;
  }
}

export async function requireUserId(request: NextRequest): Promise<number> {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    throw new Error("UNAUTHORIZED");
  }
  return userId;
}
