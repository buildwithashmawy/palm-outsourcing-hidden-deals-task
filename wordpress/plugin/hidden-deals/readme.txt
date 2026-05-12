=== Hidden Deals ===
Contributors: elashmawydev
Tags: properties, dashboard, listings
Requires at least: 6.0
Tested up to: 6.5
Requires PHP: 7.4
Stable tag: 0.1.0
License: MIT
License URI: https://opensource.org/licenses/MIT

Admin dashboard that surfaces repossessed and priced-for-quick-sale property listings from a small companion API.

== Description ==

Hidden Deals adds a top-level admin page that renders a React dashboard against a small JSON API. Filter by price, postcode, or status, sort by price or recency, and click through to the source listing.

The dashboard expects the companion API at http://localhost:3000 by default. Override with:

`add_filter( 'hidden_deals_api_url', function () { return 'https://your-api.example.com'; } );`

== Installation ==

1. Copy this folder into wp-content/plugins/ so the path is wp-content/plugins/hidden-deals/.
2. Activate via Plugins.
3. Open Hidden Deals from the admin sidebar.

The companion API and scraper live in the same repository — see the top-level README.

== Changelog ==

= 0.1.0 =
* First release. Dashboard, filters, sort, mock fallback.
