.PHONY: install scrape api dashboard build clean

PYTHON ?= python3

install:
	$(PYTHON) -m pip install -e ./scraper
	cd api && npm install
	cd wordpress/react-app && npm install

scrape:
	cd scraper && $(PYTHON) -m scraper.main --max-pages 15 --out ../data/listings.json --delay 0.8,1.5

api:
	cd api && npm start

dashboard:
	cd wordpress/react-app && npm run dev

build:
	cd wordpress/react-app && npm run build

clean:
	rm -rf wordpress/react-app/dist wordpress/plugin/hidden-deals/build api/node_modules wordpress/react-app/node_modules
