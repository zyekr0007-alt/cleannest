# Cloudflare website deployment

Current production: GitHub Pages, main branch, repository root, CNAME `cleannest.in`.
Checked 9 September 2026: www redirects to apex; `/index.html` returns 200;
`/full-house-deep-cleaning.html` returns 404. GitHub Pages has no repository
configuration for arbitrary HTTP 301/308 responses. A `_redirects` file or
JavaScript redirect would not satisfy the specification on this host.

`redirect-worker.mjs` now serves the complete static website through a Workers
Static Assets binding. It uses the exact mappings in `site/redirects.mjs`,
combines host and path normalization into one 301, and preserves query strings.
Unknown paths use the real `404.html` response and are never sent to the
homepage. Tests cover the mapping independently of a provider.

Cloudflare configuration is defined in `wrangler.jsonc`. `npm run
build:cloudflare` creates a public-only `dist/` package and omits the original
full-size gallery PNGs. The `workers.dev` preview is explicitly marked noindex.
It deploys to both apex and `www` routes, but those routes cannot receive traffic
until the Cloudflare zone becomes active. Wix-managed nameservers are currently
locked, so the owner must transfer the domain to a registrar that permits custom
nameservers before production cutover. GitHub Pages remains the live origin
until that change is approved and completed.

The search-visible `/service-page/room-deep-clean` path is mapped to the closest
current service, `/full-house-cleaning.html`. The other exact legacy paths in
the Phase 1 recovery table are covered and query strings are retained.

Held mapping: `/blank-1` has no current accessibility-page equivalent. Leave it
unmapped until the owner supplies an equivalent page or confirms the intended
policy. Do not send it, or unknown `/service-page/...` paths, to the homepage.

Caching: current Pages HTML/assets advertise a 600-second cache. Configure
compression and immutable caching only for content-hashed assets at the chosen
edge; keep HTML revalidated. Do not mark mutable asset filenames immutable.

Gzip was confirmed on the current live CSS response. The new local preview
uses gzip to make lab transfer measurements more representative; this does not
change production cache headers. See GitHub's [static hosting description](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)
and [custom-domain redirect behavior](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/about-custom-domains-and-github-pages).
