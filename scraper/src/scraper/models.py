from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Optional


@dataclass
class Listing:
    id: str
    title: str
    price: Optional[int]
    price_display: str
    location: str
    postcode: str
    status: str
    discount_pct: Optional[float]
    added_on: Optional[str]
    url: str
    scraped_at: str

    def to_dict(self) -> dict:
        return asdict(self)
