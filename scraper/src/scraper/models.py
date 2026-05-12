from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import List, Optional


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
    images: List[str] = field(default_factory=list)

    def to_dict(self) -> dict:
        return asdict(self)
