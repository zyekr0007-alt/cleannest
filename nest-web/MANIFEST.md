# nest-web — frozen snapshot of the live site

This directory is a complete, byte-faithful copy of **https://cleannest.in** as it
was served on **14 September 2026, 00:0x IST**. It is an archive, not a source
tree: nothing here is built, and nothing here should be edited. The site is
generated from `site/` by `scripts/build.mjs`.

## Provenance

| | |
|---|---|
| Captured from | `https://cleannest.in` (apex) |
| Served by | Cloudflare Worker `cleannest-redirects`, proxying to `cleannest.pages.dev` |
| Built from | branch `main`, commit `642e6c1` |
| Build | Cloudflare Pages, `npm run build` |
| Files | 189 (69 HTML, 120 assets) |
| Size | 6.3 MB |

## Fidelity

- Every HTML page is **byte-identical** to the live response — `wget` was run
  without link conversion, so no URLs were rewritten.
- All **68 sitemap URLs** are present.
- Assets include 51 files the server still serves although no page links to
  them (superseded bundles and unused images). They are kept because they are
  reachable in production, not because anything needs them.
- Query-string URLs (`quote.html?service=…`) are links into `quote.html`, not
  separate pages, and are not stored as files.
- `generated/quote-flow-acd0071de78c.mjs` is served live but is **not** produced
  by the current build. It is kept because it is live; it is the one file here
  with no counterpart in the source tree.

## Browsing it

Static files with extensionless links, so serve it over HTTP rather than opening
the files directly:

```
cd nest-web && python3 -m http.server 8080
```

## Why this exists

The repository was cleaned and its history collapsed on 14 September 2026. This
snapshot is the record of what production actually looked like at that moment,
so the redesign can always be compared against it — or restored wholesale.
