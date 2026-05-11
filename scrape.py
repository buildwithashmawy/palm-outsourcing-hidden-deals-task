import requests
from bs4 import BeautifulSoup

URL = "https://repossessedhousesforsale.com/properties/?pg=1"

resp = requests.get(URL, headers={"User-Agent": "Mozilla/5.0"}, timeout=15)
resp.raise_for_status()
soup = BeautifulSoup(resp.text, "html.parser")

seen = set()
for a in soup.select("a[href*='/properties/']"):
    href = a.get("href", "")
    if href in seen or href.rstrip("/").endswith("/properties"):
        continue
    seen.add(href)
    text = a.get_text(" ", strip=True)
    if text:
        print(href)
        print(" ", text[:140])
