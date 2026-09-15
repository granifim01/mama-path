from __future__ import annotations

import re
from typing import Any
from urllib.parse import urljoin

from bs4 import BeautifulSoup

from config import SITE103_BASE
from parsers.base import (
    clean_text,
    hospital_type_guess,
    normalize_name,
    paid_services_from_prices,
    parse_price_tenge,
)


def parse_list_page(html: str, city_slug: str, city_name: str, source_url: str) -> list[dict[str, Any]]:
    soup = BeautifulSoup(html, "lxml")
    hospitals: list[dict[str, Any]] = []

    cards = soup.select("div.PlaceList__itemWrapper")
    if not cards:
        cards = _fallback_cards(soup)

    for card in cards:
        name = _extract_name(card)
        if not name:
            continue
        detail_url = _extract_link(card)
        name = _fix_name_from_slug(name, detail_url)

        address = clean_text(_text(card.select_one(".Place__addressText")))
        facility_label = clean_text(_text(card.select_one(".Place__type")))
        rating = _parse_rating(card)
        schedule = clean_text(_text(card.select_one(".Place__timeWrapper")))
        services = _extract_services(card)
        review = _extract_review(card)

        reviews = []
        if review:
            reviews.append(
                {
                    "source": "103.kz",
                    "text": review,
                    "author": "Пациент",
                    "rating": None,
                    "date": None,
                }
            )

        hospitals.append(
            {
                "source": "103.kz",
                "source_id": _source_id_from_url(detail_url, name),
                "source_url": source_url,
                "detail_url": detail_url,
                "city_slug": city_slug,
                "city_name": city_name,
                "name": name,
                "normalized_name": normalize_name(name),
                "facility_type": hospital_type_guess(name, facility_label),
                "facility_type_label": facility_label,
                "address": address,
                "phone": None,
                "rating": rating,
                "doctors_count": None,
                "prices_count": len(services),
                "schedule": schedule,
                "services": services,
                "reviews": reviews,
                "has_paid_birth": paid_services_from_prices(services),
            }
        )

    return hospitals


def _fallback_cards(soup: BeautifulSoup) -> list[Any]:
    cards = []
    for wrapper in soup.select("div.PlaceList__itemWrapper--content"):
        parent = wrapper.find_parent("div", class_="PlaceList__itemWrapper")
        cards.append(parent or wrapper)
    return cards


def _extract_name(card: Any) -> str | None:
    title_link = card.select_one(
        ".Place__headerLink.Place__title, a.Place__title.Link, .Place__mainTitle a.Place__title"
    )
    if title_link:
        return clean_text(
            title_link.get("data-text") or title_link.get("title") or _text(title_link)
        )

    for link in card.select("a.Link"):
        if "Place__rating" in (link.get("class") or []):
            continue
        title = link.get("data-text") or link.get("title") or _text(link)
        if title and len(title) > 2 and not re.fullmatch(r"[\d.,]+", title):
            return clean_text(title)
    return None


def _extract_link(card: Any) -> str | None:
    for selector in (".Place__wholeLink", ".Place__mainTitle a", "a.Link"):
        link = card.select_one(selector)
        if link and link.get("href"):
            href = link["href"]
            if href.startswith("http"):
                return href
            return urljoin(SITE103_BASE, href)
    return None


def _extract_services(card: Any) -> list[dict[str, Any]]:
    services: list[dict[str, Any]] = []
    price_items = card.select(".PlacePrices__item")
    for item in price_items:
        title = clean_text(
            _text(item.select_one(".PlacePrices__itemTitle"))
            or item.get("title")
        )
        price_raw = clean_text(_text(item.select_one(".PlacePrices__itemText")))
        if not title:
            continue
        services.append(
            {
                "title": title,
                "price_raw": price_raw,
                "price_from": parse_price_tenge(price_raw),
            }
        )
    return services


def _extract_review(card: Any) -> str | None:
    review = clean_text(_text(card.select_one(".Place__reviewMsg")))
    if review:
        review = re.sub(r"^Отзыв\s*\.?\s*", "", review, flags=re.I).strip()
        return review[:2000]
    return None


def _parse_rating(card: Any) -> float | None:
    rating_node = card.select_one(".Place__rating .StarRating span:last-child")
    if not rating_node:
        rating_node = card.select_one(".Place__rating span")
    if not rating_node:
        return None
    raw = _text(rating_node)
    if not raw:
        return None
    match = re.search(r"^([\d.]+)$", raw.replace(",", ".").strip())
    return float(match.group(1)) if match else None


def _fix_name_from_slug(name: str, url: str | None) -> str:
    if not url:
        return name
    slug = url.rstrip("/").split("/")[-1].lower()
    slug_match = re.search(
        r"(?:cent[r]?|dom|opc|roddom|rodil)[^\d]*(\d+)|(?:^|-)(\d+)(?:\.|$)",
        slug,
    )
    name_match = re.search(r"№\s*(\d+)", name)
    if not slug_match or not name_match:
        return name
    slug_num = slug_match.group(1)
    if slug_num != name_match.group(1):
        return re.sub(r"№\s*\d+", f"№{slug_num}", name, count=1)
    return name


def _source_id_from_url(url: str | None, name: str) -> str:
    if url:
        slug = url.rstrip("/").split("/")[-1]
        if slug:
            return slug
    return re.sub(r"[^\w]+", "-", name.lower()).strip("-")


def _text(node: Any) -> str | None:
    if not node:
        return None
    return node.get_text(" ", strip=True)
