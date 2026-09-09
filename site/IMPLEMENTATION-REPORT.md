# CleanNest implementation report

Historical audit snapshot before the subsequent owner-authorized [UI release](UI-RELEASE.md). The release includes this work and supersedes the palette/map details below.

9 September 2026. Implements the supplied CleanNest audit specification as a
refactor, preserving the existing wordmark, imagery, palette and conversion flow.
Changes are committed locally; this update has not been pushed or deployed.
The full specification is not yet complete: hosting and factual-content
dependencies remain below.

## Implemented

- Canonical homepage links now use `/`. Sitemap contains 60 canonical, indexable
  URLs; 66 generated HTML pages are retained. The quote page, 404 and four empty
  legacy article fallbacks are excluded. Exact legacy redirect mappings and an
  optional edge handler are prepared and tested, but not activated.
- Shared business identity uses one Jalandhar address and one schema `@id`.
  Other cities are service areas, not branches. FAQ schema and visible answers
  share data; services and eight current articles have page-specific structured
  data and breadcrumbs. Unknown authors/dates are omitted, not invented.
- All 24 services have specific preparation, scope/limitations, FAQs and useful
  related links. Unsupported treatment/certification claims were removed from
  active content. Prices reuse the central catalog, including quote supplements.
- City templates support verified introductions, localities, scheduling, jobs
  and reviews. Jalandhar uses the actual office information. Other pages stay
  conservative without fabricated local projects or operating rules. Dasuya and
  Hariana remain availability enquiries, not confirmed coverage.
- Eight journal articles now have semantic sections and contextual service
  links. Priority guides have substantive practical content. Competitor pages
  use neutral comparison questions, not unsupported allegations or prices.
- Results gain service context where original filenames identify the subject;
  no locality, date or customer attribution is inferred from a photo.
- Four layered stylesheets are replaced by maintained base/page sources,
  normalized radius/spacing/control tokens and minified, content-hashed output.
  Obsolete selectors were removed after template/script/state inspection.
  See [CSS audit](CSS-AUDIT.md). Retired stylesheets remain recoverable in Git.
- Mobile contact controls, service controls, pricing layout, care image, footer
  hierarchy and closing CTA are improved. Quote Back/Next geometry is consistent.
  Native FAQ keyboard interaction, menu, dialogs and carousel remain functional.
- Blocking intro is removed; header changes direction after 36px of movement.
  Map is static on mobile/reduced motion and starts in view on desktop. Later
  result images load near the viewport. Hero uses responsive WebP sources.
- Licensed Manrope and DM Serif fonts use WOFF2, reducing their combined size by
  65%. The existing Ultima font remains unchanged pending license verification.
  CSS and scripts, including quote dependencies, have content-hashed URLs.

## Verification

All checks below were run against the local generated update, not production.

| Check | Result |
| --- | --- |
| Build | 66 HTML pages generated successfully |
| Unit tests | 15 passing: pricing/supplements and redirect mappings |
| All-page checks | Metadata, canonicals, H1, internal links/anchors, images and local schema assertions pass |
| HTTP crawl | All 60 sitemap URLs return 200 with expected canonicals; unknown URL returns noindex 404 |
| Responsive browser checks | 16 representative routes × 4 viewports = 64 passing layout checks |
| Viewports | 360×800, 390×844, 768×1024, 1440×900 |
| Automated accessibility | No WCAG A/AA axe violations on the 16 checked mobile routes |
| Interactions | Menu/inert/Escape/focus, native FAQ, carousel/slider keyboard, dialog focus, quote next/back and reduced motion pass |
| Quote handoff | Synthetic contact data used to inspect the WhatsApp destination/message; no enquiry sent |
| Dependency audit | Zero reported vulnerabilities |
| Git whitespace check | Pass |

Screenshots and machine-readable results are in the ignored local
`.review/spec-qa/` directory. Browser checks capture 48 screenshots across the
required mobile/tablet/desktop widths. Representative screenshots were visually
reviewed. Automated accessibility and local schema assertions are not a claim
of exhaustive accessibility certification or Google Rich Results validation.

Final Lighthouse 12.8.2 runs used Chrome against the gzip-enabled local server:

| Metric | Mobile | Desktop |
| --- | --- | --- |
| Performance | 97 | 99 |
| Accessibility / Best practices / SEO | 100 / 100 / 100 | 100 / 100 / 100 |
| First contentful paint | 1.2s | 0.3s |
| Largest contentful paint | 2.6s | 0.9s |
| Cumulative layout shift | 0 | 0 |
| Total blocking time | 0ms | 0ms |

Mobile LCP is slightly above the specification's <2.5s target. These are lab
snapshots, not production guarantees. TBT does not establish INP; field INP and
Core Web Vitals require production measurements. Final reports are
`.review/spec-qa/lighthouse-final-{mobile,desktop}.report.{json,html}`.

Homepage CSS is 12,878 bytes gzip versus 19,289 previously (about 33% smaller).
The dedicated-page total is 14,985 bytes gzip. Measurements cover the same CSS
scope and do not claim equivalent whole-page transfer reductions.

## Still required

1. **Hosting/redirect activation:** current GitHub Pages does not implement the
   prepared arbitrary HTTP redirects. `/index.html` remains 200 and stale service
   paths remain 404 on production until a redirect-capable edge/host is chosen
   and configured. No DNS changes were made. See [hosting instructions](../hosting/README.md).
   Supply actual indexed `/service-page/...` paths before mapping them;
   `/blank-1` has no current accessibility-page equivalent.
2. **Unique city facts:** most cities still lack meaningful unique local content.
   Supply verified localities, actual travel/scheduling rules, real jobs/photos
   and city-attributed reviews. `site/city-content.mjs` requires
   `ownerVerified: true` and `sourceReference` for optional local modules.
   Data hooks are complete; full city-page differentiation is not.
3. **Brand/content evidence:** provide an approved compact favicon and confirm
   Ultima webfont/conversion rights. Existing full wordmark/favicon remains;
   no new logo was invented. Supply article authors/dates and genuine team/job
   history where available. No unsupported details were filled in to meet length.
4. **Deployment and external validation:** approve publishing, then crawl the
   live site, check redirects, validate schema with an external validator and
   rerun mobile/desktop performance. Refresh the sitemap and request appropriate
   reindexing in Search Console with authorized account access. Monitor index
   coverage, duplicate canonicals, 404s and field Core Web Vitals over time.
5. **Production caching:** long immutable caching requires edge/host setup and
   should apply only to content-hashed files. Current live gzip was verified;
   local preview compression does not change production headers.

## Maintenance and reproduction

```sh
npm ci
npm run build
npm test
npm run check
npm run dev
```

With the server running on the default port 8123:

```sh
node scripts/http-check.mjs
npm run check:browser
```

Browser checks require the installed `agent-browser` CLI and browser. To use the
current preview on port 8124:

```sh
node scripts/http-check.mjs http://127.0.0.1:8124
QA_BASE_URL=http://127.0.0.1:8124 npm run check:browser
```

Edit source modules/templates, not generated HTML or hashed assets. Prices are
assembled in `site/catalog.mjs` from the existing content source; business data
is in `site/business.mjs`, FAQs in the shared catalog, service guidance in
`site/service-content.mjs`, articles in `site/blog.mjs`, city hooks in
`site/city-content.mjs`, and CSS in `site/styles/`. Run the build before publishing
because GitHub Pages currently serves generated files from the repository root.

Pre-existing untracked hero-team images and `site/SESSION-update1.md` were left
untouched and excluded from the implementation commits.
