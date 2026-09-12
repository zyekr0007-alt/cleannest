# Redirect deployment

Current production: Cloudflare Pages project `cleannest`, connected to the
GitHub `main` branch, with `cleannest.pages.dev` as the origin. The active
Cloudflare Worker routes both public CleanNest hosts so legacy paths can keep
their 301 redirects while normal requests reach the current Pages deployment.

`redirect-worker.mjs` is a prepared edge entry point using the exact mappings in
`site/redirects.mjs`. It combines host and path normalization into one 301 and
preserves query strings. Unmatched paths pass through; it does not send unknown
pages to the homepage. Tests cover the mapping independently of a provider.

Cloudflare configuration is defined in `wrangler.jsonc`. It deploys the worker
to both apex and `www` routes while forwarding unmatched requests to the Pages
origin. Verify `/`, every mapping (with a query string), and both hosts using
HTTP headers after nameserver activation. The destination must return 200 with
a self-canonical URL.

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
