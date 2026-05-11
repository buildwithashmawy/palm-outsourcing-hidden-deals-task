from __future__ import annotations

import hashlib
import re
from datetime import datetime, timezone
from typing import Iterable
from urllib.parse import urldefrag, urlsplit, urlunsplit

from bs4 import BeautifulSoup

from .models import Listing


PROPERTY_HREF = re.compile(r"/properties/\d+")


def _canonical_url(href: str) -> str:
    """drop query/fragment so the same listing on different pages collapses."""
    href, _ = urldefrag(href)
    parts = urlsplit(href)
    return urlunsplit((parts.scheme, parts.netloc, parts.path, "", ""))


def _listing_id(canonical_url: str) -> str:
    return hashlib.sha1(canonical_url.encode("utf-8")).hexdigest()[:12]


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def parse_listings(html: str, base_url: str = "https://repossessedhousesforsale.com") -> list[Listing]:
    """parse a listings page into Listing records. duplicates by url are dropped."""
    soup = BeautifulSoup(html, "html.parser")
    seen: set[str] = set()
    out: list[Listing] = []
    scraped_at = _now_iso()

    for anchor in soup.select("a[href]"):
        href = anchor.get("href", "")
        if not PROPERTY_HREF.search(href):
            continue
        canonical = _canonical_url(href if href.startswith("http") else f"{base_url}{href}")
        if canonical in seen:
            continue
        # walk up looking for the card container — text-and-structure match, not class names
        card = _find_card(anchor)
        if card is None:
            continue
        seen.add(canonical)
        out.append(_extract_listing(card, canonical, scraped_at))
    return out


def _find_card(anchor) -> object | None:
    # the card div sits ~4 levels above each property anchor on this site,
    # but anchor it on content rather than depth so we survive minor reshuffles.
    node = anchor
    for _ in range(8):
        node = node.parent
        if node is None:
            return None
        text = node.get_text(" ", strip=True)
        if "Added on" in text and ("Repossessed" in text or "Quick Sale" in text):
            if len(text) < 1500:
                return node
    return None


def _extract_listing(card, canonical_url: str, scraped_at: str) -> Listing:
    text = card.get_text(" ", strip=True)
    return Listing(
        id=_listing_id(canonical_url),
        title="",
        price=None,
        price_display="",
        location="",
        postcode="",
        status="",
        discount_pct=None,
        added_on=None,
        url=canonical_url,
        scraped_at=scraped_at,
    )
