import fs from "fs";
import path from "path";

import { apiFetch } from "./api";

export type ProductItem = {
  id: string;
  name: string;
  phase: string;
  age_weeks: string | null;
  rating: number;
  reviews_count: number;
  price_hint: string;
  note: string;
  verified_review: string;
};

export type ProductCategory = {
  id: string;
  title: string;
  icon?: string;
  description?: string;
  items: ProductItem[];
};

export type ProductsPayload = {
  updated_at: string;
  categories: ProductCategory[];
};

const DATA_PATH = path.join(process.cwd(), "..", "data", "products.json");

function loadProductsFromFile(): ProductsPayload {
  const fallback: ProductsPayload = { updated_at: "", categories: [] };
  if (!fs.existsSync(DATA_PATH)) {
    return fallback;
  }
  return JSON.parse(fs.readFileSync(DATA_PATH, "utf-8")) as ProductsPayload;
}

export async function loadProducts(): Promise<ProductsPayload> {
  try {
    return await apiFetch<ProductsPayload>("/api/v1/products", {
      next: { revalidate: 30 },
    });
  } catch {
    return loadProductsFromFile();
  }
}
