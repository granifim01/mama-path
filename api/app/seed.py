from __future__ import annotations

import json
from pathlib import Path

from sqlalchemy.orm import Session

from app.config import DATA_DIR
from app.models import CourseCatalog, Hospital, ProductCatalog


def seed_from_json(db: Session) -> dict[str, int]:
    stats = {"hospitals": 0, "courses": 0, "products": 0}

    hospitals_path = DATA_DIR / "hospitals.json"
    if hospitals_path.exists():
        payload = json.loads(hospitals_path.read_text(encoding="utf-8"))
        for item in payload.get("hospitals", []):
            hospital = db.get(Hospital, item["id"]) or Hospital(id=item["id"])
            hospital.city_slug = item.get("city_slug", "")
            hospital.city_name = item.get("city_name", "")
            hospital.name = item.get("name", "")
            hospital.facility_type = item.get("facility_type", "unknown")
            hospital.address = item.get("address")
            hospital.phone = item.get("phone")
            hospital.rating = item.get("rating")
            hospital.lat = item.get("lat")
            hospital.lng = item.get("lng")
            hospital.has_paid_birth = item.get("has_paid_birth")
            hospital.free_birth_available = item.get("free_birth_available")
            hospital.payload = item
            db.merge(hospital)
            stats["hospitals"] += 1

    courses_path = DATA_DIR / "courses.json"
    if courses_path.exists():
        payload = json.loads(courses_path.read_text(encoding="utf-8"))
        catalog = db.get(CourseCatalog, 1) or CourseCatalog(id=1)
        catalog.payload = payload
        db.merge(catalog)
        stats["courses"] = len(payload.get("tracks", []))

    products_path = DATA_DIR / "products.json"
    if products_path.exists():
        payload = json.loads(products_path.read_text(encoding="utf-8"))
        catalog = db.get(ProductCatalog, 1) or ProductCatalog(id=1)
        catalog.payload = payload
        db.merge(catalog)
        stats["products"] = len(payload.get("categories", []))

    db.commit()
    return stats
