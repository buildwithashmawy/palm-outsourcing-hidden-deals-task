from pathlib import Path

from scraper.parser import parse_listings


FIX = Path(__file__).parent / "fixtures"


def _read(name: str) -> str:
    return (FIX / name).read_text()


def test_page_1_returns_ten_unique_listings():
    listings = parse_listings(_read("page_1.html"))
    assert len(listings) == 10
    assert len({l.id for l in listings}) == 10
    assert len({l.url for l in listings}) == 10


def test_page_1_first_listing_fields():
    listings = parse_listings(_read("page_1.html"))
    sample = next(l for l in listings if "Gedney Close" in l.title)
    assert sample.price == 179000
    assert sample.price_display == "£179,000"
    assert sample.postcode == "DN37"
    assert sample.location == "Gedney Close, Grimsby"
    assert sample.status == "priced_for_quick_sale"
    assert sample.discount_pct == 8.6
    assert sample.added_on == "2026-04-30"
    assert sample.url.startswith("https://repossessedhousesforsale.com/properties/")
    assert "?pg=" not in sample.url


def test_page_2_returns_ten_listings():
    listings = parse_listings(_read("page_2.html"))
    assert len(listings) == 10
    for l in listings:
        assert l.status in {"repossessed", "priced_for_quick_sale"}
        assert l.url.startswith("https://")


def test_status_distribution_includes_both_kinds():
    pool = parse_listings(_read("page_1.html")) + parse_listings(_read("page_2.html"))
    statuses = {l.status for l in pool}
    assert "repossessed" in statuses
    assert "priced_for_quick_sale" in statuses


POA_FIXTURE = """
<html><body>
  <a href="/properties/99999">
    <div class="card">
      <p>To view property Start free trial</p>
      <div>Repossessed</div>
      <div>0%</div>
      <div>2 bedroom flat for sale in Imaginary Road, Nowhere, ZZ1</div>
      <span>ZZ1</span>
      <div>POA</div>
      <div>Added on 1 May, 2026</div>
    </div>
  </a>
</body></html>
"""


def test_poa_price_is_preserved_without_integer():
    listings = parse_listings(POA_FIXTURE)
    assert len(listings) == 1
    l = listings[0]
    assert l.price is None
    assert l.price_display == "POA"
    assert l.status == "repossessed"


MISSING_DISCOUNT_FIXTURE = """
<html><body>
  <a href="/properties/12345">
    <div class="card">
      <p>To view property Start free trial</p>
      <div>Priced For Quick Sale</div>
      <div>3 bedroom house for sale in Some Lane, Anywhere, AB1</div>
      <span>AB1</span>
      <div>250,000</div>
      <div>Added on 15 Mar, 2026</div>
    </div>
  </a>
</body></html>
"""


def test_missing_discount_is_none():
    listings = parse_listings(MISSING_DISCOUNT_FIXTURE)
    assert len(listings) == 1
    assert listings[0].discount_pct is None
    assert listings[0].price == 250000
