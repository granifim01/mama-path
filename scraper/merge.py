from __future__ import annotations

import re
from typing import Any


def merge_records(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    buckets: dict[str, list[dict[str, Any]]] = {}

    for record in records:
        key = _merge_key(record)
        buckets.setdefault(key, []).append(record)

    merged: list[dict[str, Any]] = []
    for key, group in buckets.items():
        merged.append(_merge_group(key, group))
    merged.sort(key=lambda item: (item["city_slug"], item["name"]))
    return merged


def _merge_key(record: dict[str, Any]) -> str:
    city = record.get("city_slug") or ""
    address_key = _address_key(record.get("address"))
    if address_key:
        return f"{city}|addr|{address_key}"

    name = record.get("normalized_name") or ""
    number = _extract_number(record.get("name"))
    if number:
        return f"{city}|roddom|{number}"
    return f"{city}|name|{name}"


def _address_key(address: str | None) -> str:
    norm = _normalize_address(address)
    if not norm:
        return ""
    house_match = re.search(r"(\d+[\w/]*)$", norm)
    if not house_match:
        return norm
    house = house_match.group(1).lower()
    street = norm[: house_match.start()].strip()
    street = street.replace("гани ", "")
    street = re.sub(r"\s+", " ", street).strip()
    if street and house:
        return f"{street}|{house}"
    return norm


def _normalize_address(address: str | None) -> str:
    if not address:
        return ""
    text = re.sub(r"[\u200b-\u200d\ufeff\u00ad]", "", address).lower()
    text = re.sub(r"[«»\"'""]", "", text)
    text = re.sub(r"[.,]", " ", text)
    text = re.sub(
        r"\b(алматы|астана|шымкент|караганда|город|г\.|область|обл\.)\b",
        " ",
        text,
    )
    replacements = {
        "проспект": "pr",
        "просп": "pr",
        "пр-т": "pr",
        "пр.": "pr",
        "улица": "ul",
        "ул.": "ul",
        "бульвар": "bul",
        "б-р": "bul",
        "микрорайон": "mkr",
        "мкр.": "mkr",
        "мкр": "mkr",
        "дом": "",
        "д.": "",
        "д ": " ",
    }
    for src, dst in replacements.items():
        text = text.replace(src, dst)
    text = re.sub(r"[^\w\s/]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def _extract_number(name: str | None) -> str | None:
    if not name:
        return None
    match = re.search(r"(?:№|#|no\s*)(\d+)", name, re.I)
    if match:
        return match.group(1)
    match = re.search(r"\b(\d+)\b", name)
    if match and re.search(r"род", name, re.I):
        return match.group(1)
    return None


def _merge_group(key: str, group: list[dict[str, Any]]) -> dict[str, Any]:
    primary = _pick_primary(group)
    sources = sorted({item["source"] for item in group})
    services = _dedupe_services(
        [service for item in group for service in item.get("services", [])]
    )
    reviews = _dedupe_reviews(
        [review for item in group for review in item.get("reviews", [])]
    )

    paid_flags = [item.get("has_paid_birth") for item in group if item.get("has_paid_birth") is not None]
    has_paid_birth = any(paid_flags) if paid_flags else None

    ratings = [item["rating"] for item in group if item.get("rating") is not None]
    avg_rating = round(sum(ratings) / len(ratings), 2) if ratings else primary.get("rating")

    display_name = _best_name(group)
    return {
        "id": key,
        "city_slug": primary.get("city_slug"),
        "city_name": primary.get("city_name"),
        "name": display_name,
        "normalized_name": primary.get("normalized_name"),
        "facility_type": primary.get("facility_type"),
        "facility_type_label": primary.get("facility_type_label"),
        "address": _first_non_empty(group, "address"),
        "phone": _first_non_empty(group, "phone"),
        "rating": avg_rating,
        "doctors_count": _first_non_empty(group, "doctors_count"),
        "schedule": _first_non_empty(group, "schedule"),
        "description": _first_non_empty(group, "description"),
        "has_paid_birth": has_paid_birth,
        "free_birth_available": _guess_free_birth(primary, services),
        "services": services,
        "reviews": reviews[:15],
        "sources": [
            {
                "source": item["source"],
                "source_id": item.get("source_id"),
                "source_url": item.get("source_url"),
                "detail_url": item.get("detail_url"),
            }
            for item in group
        ],
        "source_count": len(sources),
    }


def _best_name(group: list[dict[str, Any]]) -> str:
    candidates = [item.get("name") or "" for item in group]
    candidates = [name for name in candidates if name]
    if not candidates:
        return "Без названия"
    return sorted(candidates, key=lambda name: (-len(name), name))[0]


def _pick_primary(group: list[dict[str, Any]]) -> dict[str, Any]:
    def score(item: dict[str, Any]) -> int:
        value = 0
        if item.get("phone"):
            value += 2
        if item.get("services"):
            value += len(item["services"])
        if item.get("reviews"):
            value += len(item["reviews"])
        if item.get("description"):
            value += 2
        if item.get("rating") is not None:
            value += 1
        if item.get("source") == "ydoc":
            value += 1
        return value

    return sorted(group, key=score, reverse=True)[0]


def _first_non_empty(group: list[dict[str, Any]], field: str) -> Any:
    for item in group:
        value = item.get(field)
        if value not in (None, "", []):
            return value
    return None


def _dedupe_services(services: list[dict[str, Any]]) -> list[dict[str, Any]]:
    seen: set[str] = set()
    result: list[dict[str, Any]] = []
    for service in services:
        key = (service.get("title") or "").lower()
        if not key or key in seen:
            continue
        seen.add(key)
        result.append(service)
    return result


def _dedupe_reviews(reviews: list[dict[str, Any]]) -> list[dict[str, Any]]:
    seen: set[str] = set()
    result: list[dict[str, Any]] = []
    for review in reviews:
        text = (review.get("text") or "").strip()
        text = re.sub(r"^Отзыв\s*\.?\s*", "", text, flags=re.I).strip()
        review = {**review, "text": text}
        fingerprint = re.sub(r"\s+", " ", text.lower())[:180]
        if not fingerprint or fingerprint in seen:
            continue
        seen.add(fingerprint)
        result.append(review)
    return result


def _guess_free_birth(primary: dict[str, Any], services: list[dict[str, Any]]) -> bool | None:
    if primary.get("facility_type") == "public":
        return True
    if primary.get("facility_type") == "private":
        return False

    for service in services:
        title = (service.get("title") or "").lower()
        if "платн" in title and "род" in title:
            return False
    return None
