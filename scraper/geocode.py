from __future__ import annotations

import json
import time
from pathlib import Path
from typing import Any

import httpx

ROOT = Path(__file__).resolve().parent.parent
JSON_PATH = ROOT / "data" / "hospitals.json"
NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
USER_AGENT = "MamaPath/0.1 (educational; contact: dev@local)"


def geocode_hospitals() -> int:
    if not JSON_PATH.exists():
        return 0

    payload = json.loads(JSON_PATH.read_text(encoding="utf-8"))
    hospitals: list[dict[str, Any]] = payload.get("hospitals", [])
    updated = 0

    with httpx.Client(headers={"User-Agent": USER_AGENT}, timeout=20.0) as client:
        for hospital in hospitals:
            if hospital.get("lat") and hospital.get("lng"):
                continue

            query = f"{hospital.get('name')}, {hospital.get('address')}, {hospital.get('city_name')}, Kazakhstan"
            coords = _lookup(client, query)
            if not coords and hospital.get("address"):
                coords = _lookup(
                    client,
                    f"{hospital.get('address')}, {hospital.get('city_name')}, Kazakhstan",
                )

            if coords:
                hospital["lat"] = coords[0]
                hospital["lng"] = coords[1]
                updated += 1
            time.sleep(1.1)

    JSON_PATH.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    return updated


def _lookup(client: httpx.Client, query: str) -> tuple[float, float] | None:
    response = client.get(
        NOMINATIM_URL,
        params={"q": query, "format": "json", "limit": 1, "countrycodes": "kz"},
    )
    response.raise_for_status()
    results = response.json()
    if not results:
        return None
    return float(results[0]["lat"]), float(results[0]["lon"])


if __name__ == "__main__":
    count = geocode_hospitals()
    print(f"Geocoded {count} hospitals")
