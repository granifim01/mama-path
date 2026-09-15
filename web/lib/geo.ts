const CITY_COORDS: Record<string, [number, number]> = {
  almaty: [43.238949, 76.889709],
  astana: [51.169392, 71.449074],
  shymkent: [42.341737, 69.5901],
};

import type { Hospital } from "./types";

export function hospitalCoords(hospital: Hospital): [number, number] | null {
  if (hospital.lat && hospital.lng) {
    return [hospital.lat, hospital.lng];
  }

  const citySlug = hospital.city_slug;
  const id = hospital.id;
  const base = CITY_COORDS[citySlug];
  if (!base) {
    return null;
  }

  let hash = 0;
  for (const char of id) {
    hash = (hash * 31 + char.charCodeAt(0)) % 1000;
  }

  const latOffset = ((hash % 17) - 8) * 0.004;
  const lngOffset = (((hash / 17) | 0) % 17 - 8) * 0.004;
  return [base[0] + latOffset, base[1] + lngOffset];
}
