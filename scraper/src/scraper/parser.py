from __future__ import annotations

import hashlib
import re
from datetime import datetime, timezone
from typing import Optional
from urllib.parse import urldefrag, urlsplit, urlunsplit

from bs4 import BeautifulSoup
from bs4.element import Tag

from .models import Listing


PROPERTY_HREF = re.compile(r"/properties/\d+")

STATUS_RE = re.compile(r"(Repossessed|Priced For Quick Sale)", re.I)
DISCOUNT_RE = re.compile(r"(\d+(?:\.\d+)?)\s*%")
DATE_RE = re.compile(r"Added on (\d{1,2} [A-Z][a-z]{2,9},?\s*\d{4})")
TITLE_RE = re.compile(r"\d+\s+bedroom .+? for sale in .+?,\s*[A-Z]{1,2}\d[A-Z\d]?\b")
POSTCODE_RE = re.compile(r"\b([A-Z]{1,2}\d[A-Z\d]?)\s*$")
# TODO: brittle if site changes the comma-separated price formatting (e.g. starts using spaces)
PRICE_RE = re.compile(r"(?:£\s*)?(\d{1,3}(?:,\d{3})+|\d{5,})")
IMAGE_HOST_RE = re.compile(r"^https?://[\w.-]*digitaloceanspaces\.com/", re.I)
MAX_IMAGES_PER_LISTING = 6


def _canonical_url(href: str) -> str:
    href, _ = urldefrag(href)
    parts = urlsplit(href)
    return urlunsplit((parts.scheme, parts.netloc, parts.path, "", ""))


def _listing_id(canonical_url: str) -> str:
    return hashlib.sha1(canonical_url.encode("utf-8")).hexdigest()[:12]


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def parse_listings(html: str, base_url: str = "https://repossessedhousesforsale.com") -> list[Listing]:
    soup = BeautifulSoup(html, "html.parser")
    seen: set[str] = set()
    out: list[Listing] = []
    scraped_at = _now_iso()

    for anchor in soup.select("a[href]"):
        href = anchor.get("href", "")
        if not PROPERTY_HREF.search(href):
            continue
        absolute = href if href.startswith("http") else f"{base_url}{href}"
        canonical = _canonical_url(absolute)
        if canonical in seen:
            continue
        card = _find_card(anchor)
        if card is None:
            continue
        seen.add(canonical)
        out.append(_extract_listing(card, canonical, scraped_at))
    return out


def _find_card(anchor: Tag) -> Optional[Tag]:
    node = anchor
    for _ in range(8):
        node = node.parent
        if node is None:
            return None
        text = node.get_text(" ", strip=True)
        if "Added on" in text and STATUS_RE.search(text) and len(text) < 1500:
            return node
    return None


def _extract_images(card: Tag) -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for img in card.find_all("img"):
        src = img.get("src") or img.get("data-src") or ""
        if not src or not IMAGE_HOST_RE.match(src):
            continue
        if src in seen:
            continue
        seen.add(src)
        out.append(src)
        if len(out) >= MAX_IMAGES_PER_LISTING:
            break
    return out


def _extract_listing(card: Tag, canonical_url: str, scraped_at: str) -> Listing:
    text = card.get_text(" ", strip=True)

    status = ""
    m = STATUS_RE.search(text)
    if m:
        raw = m.group(1).lower()
        status = "repossessed" if "repossessed" in raw else "priced_for_quick_sale"

    discount_pct: Optional[float] = None
    m = DISCOUNT_RE.search(text)
    if m:
        discount_pct = float(m.group(1))

    title = ""
    location = ""
    postcode = ""
    m = TITLE_RE.search(text)
    if m:
        title = m.group(0).strip()
        # location is the text between "for sale in " and the trailing postcode
        body = re.split(r"\bfor sale in\s+", title, maxsplit=1)
        if len(body) == 2:
            tail = body[1]
            pc = POSTCODE_RE.search(tail)
            if pc:
                postcode = pc.group(1)
                location = tail[: pc.start()].rstrip(", ").strip()

    price: Optional[int] = None
    price_display = ""
    after_title = text.split(title, 1)[1] if title and title in text else text
    if re.search(r"\bPOA\b", after_title[:200], re.I):
        price_display = "POA"
    else:
        m = PRICE_RE.search(after_title)
        if m:
            raw = m.group(1)
            price = int(raw.replace(",", ""))
            price_display = f"£{raw}"

    added_on: Optional[str] = None
    m = DATE_RE.search(text)
    if m:
        raw = m.group(1).replace(",", "")
        for fmt in ("%d %b %Y", "%d %B %Y"):
            try:
                added_on = datetime.strptime(raw, fmt).date().isoformat()
                break
            except ValueError:
                continue

    return Listing(
        id=_listing_id(canonical_url),
        title=title,
        price=price,
        price_display=price_display,
        location=location,
        postcode=postcode,
        status=status,
        discount_pct=discount_pct,
        added_on=added_on,
        url=canonical_url,
        scraped_at=scraped_at,
        images=_extract_images(card),
    )
