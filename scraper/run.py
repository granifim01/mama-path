#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from config import CITIES, SITE103_BASE, YDOC_BASE
from merge import merge_records
from parsers.base import FetchClient
from parsers import site103, ydoc
from storage import save_json, save_raw, save_sqlite


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Scrape maternity hospitals in Kazakhstan")
    parser.add_argument(
        "--cities",
        nargs="*",
        default=[city.slug for city in CITIES],
        help="City slugs to scrape (default: all configured cities)",
    )
    parser.add_argument(
        "--sources",
        nargs="*",
        choices=["ydoc", "103"],
        default=["ydoc", "103"],
        help="Data sources to use",
    )
    parser.add_argument(
        "--no-enrich",
        action="store_true",
        help="Skip YDoc detail pages (faster, less data)",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    selected_cities = [city for city in CITIES if city.slug in args.cities]
    if not selected_cities:
        print("No matching cities configured.", file=sys.stderr)
        return 1

    all_records: list[dict] = []
    client = FetchClient()

    try:
        for city in selected_cities:
            print(f"\n== {city.name_ru} ({city.slug}) ==")

            if "ydoc" in args.sources:
                print(f"Fetching YDoc: {YDOC_BASE}{city.ydoc_path}")
                records = ydoc.scrape_city(
                    client,
                    city.slug,
                    city.name_ru,
                    city.ydoc_path,
                    enrich_details=not args.no_enrich,
                )
                save_raw("ydoc", city.slug, records)
                print(f"  YDoc records: {len(records)}")
                all_records.extend(records)

            if "103" in args.sources:
                url = f"{SITE103_BASE}{city.site103_path}"
                print(f"Fetching 103.kz: {url}")
                html = client.get(url)
                records = site103.parse_list_page(
                    html, city.slug, city.name_ru, url
                )
                save_raw("103", city.slug, records)
                print(f"  103.kz records: {len(records)}")
                all_records.extend(records)
    finally:
        client.close()

    merged = merge_records(all_records)
    json_path = save_json(merged)
    db_path = save_sqlite(merged)

    try:
        from geocode import geocode_hospitals

        geocoded = geocode_hospitals()
        print(f"  Geocoded: {geocoded} hospitals")
    except Exception as exc:
        print(f"  Geocoding skipped: {exc}")

    summary = {
        "raw_records": len(all_records),
        "merged_hospitals": len(merged),
        "cities": sorted({item["city_slug"] for item in merged}),
        "json_path": str(json_path),
        "db_path": str(db_path),
    }
    print("\nDone.")
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
