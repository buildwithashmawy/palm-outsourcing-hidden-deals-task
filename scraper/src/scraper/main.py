from __future__ import annotations

import argparse
import json
import logging
import sys
from pathlib import Path

from .http import fetch, make_session, polite_sleep
from .parser import parse_listings

log = logging.getLogger("scraper")

LIST_URL = "https://repossessedhousesforsale.com/properties/?pg={page}"


def parse_delay(spec: str) -> tuple[float, float]:
    parts = spec.split(",")
    if len(parts) != 2:
        raise argparse.ArgumentTypeError("delay must be 'low,high' e.g. 0.8,1.5")
    lo, hi = float(parts[0]), float(parts[1])
    if lo < 0 or hi < lo:
        raise argparse.ArgumentTypeError("delay must have 0 <= low <= high")
    return lo, hi


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description="scrape repossessed property listings")
    p.add_argument("--max-pages", type=int, default=5)
    p.add_argument("--out", type=Path, default=Path("../data/listings.json"))
    p.add_argument("--delay", type=parse_delay, default=(0.8, 1.5),
                   help="randomized sleep between pages, low,high seconds")
    p.add_argument("--verbose", action="store_true")
    return p


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.INFO,
        format="%(asctime)s %(levelname)s %(message)s",
        stream=sys.stderr,
    )
    session = make_session()
    all_listings = []
    for page in range(1, args.max_pages + 1):
        url = LIST_URL.format(page=page)
        log.info("fetching page %d", page)
        html = fetch(session, url)
        page_listings = parse_listings(html)
        log.info("  parsed %d listings", len(page_listings))
        all_listings.extend(page_listings)
        if page < args.max_pages:
            polite_sleep(*args.delay)

    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps([l.to_dict() for l in all_listings], indent=2))
    log.info("wrote %d listings to %s", len(all_listings), args.out)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
