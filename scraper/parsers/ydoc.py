from __future__ import annotations

import re
from typing import Any
from urllib.parse import urljoin

from bs4 import BeautifulSoup

from config import YDOC_BASE
from parsers.base import (
    FetchClient,
    clean_text,
    hospital_type_guess,
    normalize_name,
    paid_services_from_prices,
)


def parse_list_page(html: str, city_slug: str, city_name: str, source_url: str) -> list[dict[str, Any]]:
    soup = BeautifulSoup(html, "lxml")
    hospitals: list[dict[str, Any]] = []

    for card in soup.select('[data-qa^="lpu-id-"]'):
        external_id = card.get("data-qa", "").replace("lpu-id-", "")
        if not external_id:
            continue

        name = clean_text(
            _text(card.select_one('[data-qa="lpu_card_heading_lpu_name"]'))
        )
        if not name:
            continue

        facility_type = clean_text(
            _text(card.select_one('[data-qa="lpu_card_subheading_lputype_name"]'))
        )
        address = clean_text(
            _text(card.select_one('[data-qa="lpu_card_btn_addr_text"]'))
        )
        phone = clean_text(
            _text(card.select_one('[data-qa="lpu_card_btn_phone_text"]'))
        )
        rating = _parse_rating(
            _text(card.select_one('[data-qa="lpu_card_stars_text"]'))
        )
        doctors_count = _parse_int(
            _text(card.select_one('[data-qa="lpu_card_subheading_doctors_count"]'))
        )
        prices_count = _parse_int(
            _text(card.select_one('[data-qa="lpu_card_btn_prices_num"]'))
        )
        schedule = clean_text(
            _text(card.select_one('[data-qa="lpu_card_btn_schedule_text"]'))
        )
        detail_path = _detail_path(card, external_id, city_slug)

        hospitals.append(
            {
                "source": "ydoc",
                "source_id": external_id,
                "source_url": source_url,
                "detail_url": urljoin(YDOC_BASE, detail_path),
                "city_slug": city_slug,
                "city_name": city_name,
                "name": name,
                "normalized_name": normalize_name(name),
                "facility_type": hospital_type_guess(name, facility_type),
                "facility_type_label": facility_type,
                "address": address,
                "phone": phone,
                "rating": rating,
                "doctors_count": doctors_count,
                "prices_count": prices_count,
                "schedule": schedule,
                "services": [],
                "reviews": [],
                "has_paid_birth": None,
            }
        )

    return hospitals


def enrich_hospital_detail(
    client: FetchClient, hospital: dict[str, Any]
) -> dict[str, Any]:
    detail_url = hospital.get("detail_url")
    if not detail_url:
        return hospital

    html = client.get(detail_url)
    soup = BeautifulSoup(html, "lxml")

    description = clean_text(
        _text(soup.select_one('[data-qa="lpu_card_description"]'))
    )
    if description:
        hospital["description"] = description

    services = _parse_services(soup)
    if services:
        hospital["services"] = services
        hospital["has_paid_birth"] = paid_services_from_prices(services)

    reviews = _parse_reviews(soup)
    if reviews:
        hospital["reviews"].extend(reviews)

    return hospital


def scrape_city(
    client: FetchClient,
    city_slug: str,
    city_name: str,
    path: str,
    enrich_details: bool = True,
) -> list[dict[str, Any]]:
    source_url = urljoin(YDOC_BASE, path)
    html = client.get(source_url)
    hospitals = parse_list_page(html, city_slug, city_name, source_url)

    if enrich_details:
        for hospital in hospitals:
            enrich_hospital_detail(client, hospital)

    return hospitals


def _text(node: Any) -> str | None:
    if not node:
        return None
    return node.get_text(" ", strip=True)


def _parse_rating(raw: str | None) -> float | None:
    if not raw:
        return None
    lowered = raw.lower()
    if "отзыв" in lowered:
        return None
    match = re.search(r"([\d.]+)", raw.replace(",", "."))
    if not match:
        return None
    value = float(match.group(1))
    if value <= 0 or value > 5:
        return None
    if value == int(value) and value < 4:
        return None
    return value


def _parse_int(raw: str | None) -> int | None:
    if not raw:
        return None
    digits = re.sub(r"[^\d]", "", raw)
    return int(digits) if digits else None


def _detail_path(card: Any, external_id: str, city_slug: str) -> str:
    link = card.select_one("a[href*='/lpu/']")
    if link and link.get("href"):
        return link["href"]
    return f"/{city_slug}/lpu/{external_id}/"


def _parse_services(soup: BeautifulSoup) -> list[dict[str, Any]]:
    services: list[dict[str, Any]] = []
    for row in soup.select('[data-qa="price_row"], .price-row, tr'):
        title_node = row.select_one('[data-qa="price_name"], .price-name, td:first-child')
        price_node = row.select_one('[data-qa="price_value"], .price-value, td:last-child')
        title = clean_text(_text(title_node))
        price_raw = clean_text(_text(price_node))
        if not title or not price_raw or "тенге" not in price_raw.lower():
            continue
        services.append({"title": title, "price_raw": price_raw})
    return services


def _parse_reviews(soup: BeautifulSoup) -> list[dict[str, Any]]:
    reviews: list[dict[str, Any]] = []
    for block in soup.select('[data-qa="review_card"], .review-card, .response-card'):
        text = clean_text(_text(block))
        if not text or len(text) < 20:
            continue
        reviews.append(
            {
                "source": "ydoc",
                "text": text[:2000],
                "author": None,
                "rating": None,
                "date": None,
            }
        )
    if reviews:
        return reviews

    for heading in soup.find_all(string=re.compile("отзыв", re.I)):
        parent = heading.find_parent(["section", "div"])
        if not parent:
            continue
        for paragraph in parent.select("p, .text-body-2"):
            text = clean_text(_text(paragraph))
            if text and len(text) > 40:
                reviews.append(
                    {
                        "source": "ydoc",
                        "text": text[:2000],
                        "author": "Пациент",
                        "rating": None,
                        "date": None,
                    }
                )
        if reviews:
            break

    return reviews[:10]
