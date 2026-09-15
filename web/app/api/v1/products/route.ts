import fs from "fs";
import path from "path";

import { NextResponse } from "next/server";

import { query } from "@/lib/db";

function loadProductsFromFile() {
  const filePath = path.join(process.cwd(), "..", "data", "products.json");
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as {
    updated_at: string;
    categories: unknown[];
  };
}

export async function GET() {
  try {
    const { rows } = await query<{
      payload: { updated_at: string; categories: unknown[] };
    }>("SELECT payload FROM product_catalog WHERE id = 1");

    if (rows[0]) {
      const payload = rows[0].payload;
      return NextResponse.json({
        updated_at: payload.updated_at,
        categories: payload.categories,
      });
    }
  } catch {
    // fall through
  }

  const file = loadProductsFromFile();
  if (!file) {
    return NextResponse.json({ error: "Products not seeded" }, { status: 404 });
  }
  return NextResponse.json(file);
}
