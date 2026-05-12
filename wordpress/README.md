# wordpress

Two pieces:

- `react-app/` — Vite + React + TypeScript dashboard. Builds into the
  plugin's `build/` directory.
- `plugin/hidden-deals/` — WordPress plugin that registers an admin page and
  enqueues the bundled JS + CSS.

## Develop

```
cd react-app
npm install
npm run dev
```

Opens at http://localhost:5173. Set `VITE_API_URL=http://localhost:3001` if
the companion API is on a non-default port. Without an API reachable, the
dashboard falls back to the bundled `mock.json` so the UI still renders.

## Build

```
npm run build
```

Outputs exactly two files into `../plugin/hidden-deals/build/`:
`hidden-deals.js` and `hidden-deals.css`. Font files land in `build/assets/`
and are referenced by relative URL from the CSS — WordPress serves them
straight from the plugin folder.

## Install in WordPress

Drop `plugin/hidden-deals/` into `wp-content/plugins/` (or symlink it for
development), then activate from Plugins. The admin page appears as "Hidden
Deals" in the left sidebar.

The default API URL is `http://localhost:3000`. Override:

```
add_filter( 'hidden_deals_api_url', fn () => 'https://api.example.com' );
```
