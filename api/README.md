# api

Tiny Express service that serves `data/listings.json` over HTTP with filters
and sort. Node 20+.

## Run

```
npm install
npm start
```

Listens on `:3000`. Override with `PORT=4000 npm start`. Override the data
file with `DATA_PATH=/abs/path/to/listings.json`.

## Endpoints

`GET /health` — `{ ok, listings, loadedAt }`.

`GET /api/listings` — query params:

| param      | type    | notes                                              |
|------------|---------|----------------------------------------------------|
| minPrice   | int     | inclusive                                          |
| maxPrice   | int     | inclusive, must be >= minPrice                     |
| location   | string  | case-insensitive substring match on location+postcode |
| status     | enum    | `repossessed` or `priced_for_quick_sale` (case-insensitive) |
| sort       | enum    | `price_asc`, `price_desc`, `recent`                |
| limit      | int     | default 50, max 200                                |
| offset     | int     | default 0                                          |

Returns `{ count, total, results }`. Bad inputs return 400 with a body of
`{ error: 'bad_request', issues: [{ path, message }] }`.

## Tests

```
npm test
```

Uses `node:test` + `supertest`. No Jest.

## Hot reload

The server watches the directory containing `listings.json` and re-reads the
file on rename (which is what the scraper's atomic write produces). Watching
the file itself breaks after the first rename because the watched inode is
gone.
