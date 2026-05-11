from __future__ import annotations

import argparse
import json
import logging
import os
import sys
import tempfile
from pathlib import Path

from .http import fetch, make_session, polite_sleep
from .models import Listing
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
    seen: dict[str, Listing] = {}
    for page in range(1, args.max_pages + 1):
        url = LIST_URL.format(page=page)
        log.info("fetching page %d", page)
        html = fetch(session, url)
        page_listings = parse_listings(html)
        new = 0
        for l in page_listings:
            if l.id in seen:
                continue
            seen[l.id] = l
            new += 1
        log.info("  parsed %d listings, %d new", len(page_listings), new)
        if page < args.max_pages:
            polite_sleep(*args.delay)

    write_atomic(args.out, list(seen.values()))
    log.info("wrote %d listings to %s", len(seen), args.out)
    return 0


def write_atomic(path: Path, listings: list[Listing]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    payload = json.dumps([l.to_dict() for l in listings], indent=2, ensure_ascii=False)
    fd, tmp_name = tempfile.mkstemp(prefix=path.name + ".", dir=str(path.parent))
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            f.write(payload)
        os.replace(tmp_name, path)
    except Exception:
        if os.path.exists(tmp_name):
            os.unlink(tmp_name)
        raise


if __name__ == "__main__":
    raise SystemExit(main())
