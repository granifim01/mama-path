from __future__ import annotations

import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
RAW_DIR = DATA_DIR / "raw"
DB_PATH = DATA_DIR / "hospitals.db"
JSON_PATH = DATA_DIR / "hospitals.json"


def ensure_dirs() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    RAW_DIR.mkdir(parents=True, exist_ok=True)


def save_raw(source: str, city_slug: str, payload: list[dict[str, Any]]) -> Path:
    ensure_dirs()
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    path = RAW_DIR / f"{source}_{city_slug}_{timestamp}.json"
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    return path


def save_json(hospitals: list[dict[str, Any]]) -> Path:
    ensure_dirs()
    payload = {
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "count": len(hospitals),
        "hospitals": hospitals,
    }
    JSON_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    return JSON_PATH


def save_sqlite(hospitals: list[dict[str, Any]]) -> Path:
    ensure_dirs()
    conn = sqlite3.connect(DB_PATH)
    try:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS hospitals (
                id TEXT PRIMARY KEY,
                city_slug TEXT,
                city_name TEXT,
                name TEXT,
                facility_type TEXT,
                address TEXT,
                phone TEXT,
                rating REAL,
                has_paid_birth INTEGER,
                free_birth_available INTEGER,
                payload_json TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
            """
        )
        conn.execute("DELETE FROM hospitals")
        updated_at = datetime.now(timezone.utc).isoformat()
        for hospital in hospitals:
            conn.execute(
                """
                INSERT INTO hospitals (
                    id, city_slug, city_name, name, facility_type, address, phone,
                    rating, has_paid_birth, free_birth_available, payload_json, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    hospital["id"],
                    hospital.get("city_slug"),
                    hospital.get("city_name"),
                    hospital.get("name"),
                    hospital.get("facility_type"),
                    hospital.get("address"),
                    hospital.get("phone"),
                    hospital.get("rating"),
                    _bool_to_int(hospital.get("has_paid_birth")),
                    _bool_to_int(hospital.get("free_birth_available")),
                    json.dumps(hospital, ensure_ascii=False),
                    updated_at,
                ),
            )
        conn.commit()
    finally:
        conn.close()
    return DB_PATH


def _bool_to_int(value: Any) -> int | None:
    if value is None:
        return None
    return 1 if value else 0
