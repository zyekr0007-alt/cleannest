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

Missing mappings: `/blank-1` has no current accessibility-page equivalent;
actual indexed `/service-page/...` paths must be supplied before mapping them.
Do not invent path mappings or redirect those URLs indiscriminately.

Caching: current Pages HTML/assets advertise a 600-second cache. Configure
compression and immutable caching only for content-hashed assets at the chosen
edge; keep HTML revalidated. Do not mark mutable asset filenames immutable.
