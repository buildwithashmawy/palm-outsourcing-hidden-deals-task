from __future__ import annotations

import sys

import requests

from .parser import parse_listings


def main():
    url = "https://repossessedhousesforsale.com/properties/?pg=1"
    resp = requests.get(url, headers={"User-Agent": "Mozilla/5.0"}, timeout=15)
    resp.raise_for_status()
    listings = parse_listings(resp.text)
    for l in listings:
        print(l.url)
    print(f"\n{len(listings)} listings", file=sys.stderr)


if __name__ == "__main__":
    main()
