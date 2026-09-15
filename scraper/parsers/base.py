from __future__ import annotations

import re
import time
from typing import Any

import httpx

from config import REQUEST_DELAY_SEC, USER_AGENT


def clean_text(value: str | None) -> str | None:
    if not value:
        return None
    text = re.sub(r"[\u200b-\u200d\ufeff\u00ad]", "", value)
    text = re.sub(r"\s+", " ", text).strip()
    return text or None


def parse_price_tenge(raw: str | None) -> int | None:
    if not raw:
        return None
    digits = re.sub(r"[^\d]", "", raw)
    return int(digits) if digits else None


def normalize_name(name: str | None) -> str:
    if not name:
        return ""
    text = name.lower()
    text = re.sub(r"[«»\"'""]", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    text = text.replace("роддом", "родильный дом")
    text = re.sub(r"родильный\s+дом\s*№?\s*(\d+)", r"roddom \1", text)
    text = re.sub(r"роддом\s*№?\s*(\d+)", r"roddom \1", text)
    text = re.sub(r"№\s*(\d+)", r"no \1", text)
    text = re.sub(r"[^\w\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


class FetchClient:
    def __init__(self) -> None:
        self._client = httpx.Client(
            headers={"User-Agent": USER_AGENT},
            timeout=30.0,
            follow_redirects=True,
        )
        self._last_request_at = 0.0

    def get(self, url: str) -> str:
        elapsed = time.time() - self._last_request_at
        if elapsed < REQUEST_DELAY_SEC:
            time.sleep(REQUEST_DELAY_SEC - elapsed)
        response = self._client.get(url)
        response.raise_for_status()
        self._last_request_at = time.time()
        return response.text

    def close(self) -> None:
        self._client.close()


def hospital_type_guess(name: str, explicit: str | None = None) -> str:
    if explicit:
        lowered = explicit.lower()
        if "клиник" in lowered or "центр" in lowered:
            return "private"
        if "роддом" in lowered or "родильн" in lowered:
            return "maternity_hospital"

    lowered = name.lower()
    private_markers = (
        "клиник",
        "центр",
        "медицин",
        "приват",
        "keruen",
        "рахат",
        "interteach",
        "достар",
    )
    if any(marker in lowered for marker in private_markers):
        return "private"
    if re.search(r"№\s*\d+|роддом|родильн", lowered):
        return "public"
    return "unknown"


def paid_services_from_prices(services: list[dict[str, Any]]) -> bool | None:
    paid_markers = ("платн", "партнер", "индивидуальн", "кесарев")
    for service in services:
        title = (service.get("title") or "").lower()
        if any(marker in title for marker in paid_markers):
            return True
    return None
