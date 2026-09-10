# Redirect deployment

Current production: GitHub Pages, main branch, repository root, CNAME `cleannest.in`.
Checked 9 September 2026: www redirects to apex; `/index.html` returns 200;
`/full-house-deep-cleaning.html` returns 404. GitHub Pages has no repository
configuration for arbitrary HTTP 301/308 responses. A `_redirects` file or
JavaScript redirect would not satisfy the specification on this host.

`redirect-worker.mjs` is a prepared edge entry point using the exact mappings in
`site/redirects.mjs`. It combines host and path normalization into one 301 and
preserves query strings. Unmatched paths pass through; it does not send unknown
pages to the homepage. Tests cover the mapping independently of a provider.

Owner action: choose/configure a redirect-capable edge in front of GitHub Pages
or a new host. This code has NOT been activated, and DNS has NOT been changed.
Once activated, verify `/`, every mapping (with a query string), and both hosts
using HTTP headers. The destination must return 200 with a self-canonical URL.

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
