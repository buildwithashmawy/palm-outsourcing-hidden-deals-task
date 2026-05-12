# scraper

Small Python package that fetches the public listings index from
`repossessedhousesforsale.com`, parses each card, and writes a deduplicated
JSON file. No JS rendering, no auth-walled pages.

## Run

```
python -m scraper.main --max-pages 15 --out ../data/listings.json --delay 0.8,1.5
```

Flags:

- `--max-pages` how many index pages to walk
- `--out` output path (atomic write — temp + rename)
- `--delay low,high` randomized sleep between pages, seconds
- `--verbose` debug-level logging on stderr

## Tests

```
pytest
```

Tests run against the saved HTML in `tests/fixtures/`, not the live site.

## Notes

The parser anchors on text content and link shape (`/properties/<id>`) rather
than CSS classes — the site uses utility-class soup that would rot on any
redesign. Cards with unparseable titles still yield a record with the URL and
price preserved.
