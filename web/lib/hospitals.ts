import fs from "fs";
import path from "path";

import { apiFetch } from "./api";
import type { Hospital, HospitalsPayload } from "./types";

const DATA_PATH = path.join(process.cwd(), "..", "data", "hospitals.json");

export function loadHospitalsFromFile(): HospitalsPayload {
  const fallback: HospitalsPayload = {
    updated_at: new Date(0).toISOString(),
    count: 0,
    hospitals: [],
  };

  if (!fs.existsSync(DATA_PATH)) {
    return fallback;
  }

  const raw = fs.readFileSync(DATA_PATH, "utf-8");
  return JSON.parse(raw) as HospitalsPayload;
}

export async function loadHospitals(): Promise<HospitalsPayload> {
  try {
    return await apiFetch<HospitalsPayload>("/api/v1/hospitals", {
      next: { revalidate: 30 },
    });
  } catch {
    return loadHospitalsFromFile();
  }
}

export function filterHospitals(
  hospitals: Hospital[],
  city?: string,
  query?: string,
  paidOnly?: boolean,
  freeOnly?: boolean,
): Hospital[] {
  return hospitals.filter((hospital) => {
    if (city && hospital.city_slug !== city) {
      return false;
    }
    if (query) {
      const haystack = `${hospital.name} ${hospital.address ?? ""}`.toLowerCase();
      if (!haystack.includes(query.toLowerCase())) {
        return false;
      }
    }
    if (paidOnly && !hospital.has_paid_birth) {
      return false;
    }
    if (freeOnly && hospital.free_birth_available !== true) {
      return false;
    }
    return true;
  });
}
