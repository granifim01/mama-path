from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class CityTarget:
    slug: str
    name_ru: str
    ydoc_path: str
    site103_path: str


CITIES: list[CityTarget] = [
    CityTarget(
        slug="almaty",
        name_ru="Алматы",
        ydoc_path="/almaty/top/roddom/",
        site103_path="/list/rodilnye-doma/almaty/",
    ),
    CityTarget(
        slug="astana",
        name_ru="Астана",
        ydoc_path="/astana/top/roddom/",
        site103_path="/list/rodilnye-doma/astana/",
    ),
    CityTarget(
        slug="shymkent",
        name_ru="Шымкент",
        ydoc_path="/shymkent/top/roddom/",
        site103_path="/list/rodilnye-doma/shymkent/",
    ),
    CityTarget(
        slug="karaganda",
        name_ru="Караганда",
        ydoc_path="/karaganda/top/roddom/",
        site103_path="/list/rodilnye-doma/karaganda/",
    ),
]

YDOC_BASE = "https://ydoc.kz"
SITE103_BASE = "https://www.103.kz"

USER_AGENT = (
    "MamaPathBot/0.1 (+https://github.com/mama-path; research/educational scraper)"
)

REQUEST_DELAY_SEC = 1.5
