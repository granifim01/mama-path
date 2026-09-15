#!/usr/bin/env python3
"""Re-merge hospitals from latest raw scrapes without hitting the network."""

from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from merge import merge_records
from storage import save_json, save_sqlite

RAW_DIR = Path(__file__).resolve().parent.parent / "data" / "raw"


def load_latest_raw() -> list[dict]:
    records: list[dict] = []
    seen: set[str] = set()

    for path in sorted(RAW_DIR.glob("*.json"), reverse=True):
        stem = path.stem
        parts = stem.split("_")
        if len(parts) < 3:
            continue
        source = parts[0]
        city = parts[1]
        key = f"{source}|{city}"
        if key in seen:
            continue
        seen.add(key)

        payload = json.loads(path.read_text(encoding="utf-8"))
        if isinstance(payload, list):
            records.extend(payload)
            print(f"  {path.name}: {len(payload)} records")

    return records


def main() -> int:
    if not RAW_DIR.exists():
        print(f"No raw directory: {RAW_DIR}", file=sys.stderr)
        return 1

    print("Loading latest raw files…")
    records = load_latest_raw()
    if not records:
        print("No raw records found.", file=sys.stderr)
        return 1

    merged = merge_records(records)
    json_path = save_json(merged)
    db_path = save_sqlite(merged)

    print(f"\nMerged {len(records)} raw → {len(merged)} hospitals")
    print(f"  JSON: {json_path}")
    print(f"  SQLite: {db_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
