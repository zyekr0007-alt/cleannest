# CleanNest SEO/GEO Phase 1 implementation report

**Date:** 10 September 2026  
**Branch:** `seo-geo-phase-1-2026-09-10`  
**Status:** implemented and verified locally; not deployed

## 1. Legacy Wix and migration URL recovery

Live status was rechecked on 10 September 2026. The redirect map is implemented
in `site/redirects.mjs` and the optional edge handler. It returns one permanent
301, preserves the original query string, combines `www`/protocol normalization
with the path redirect, and has automated no-chain tests. GitHub Pages cannot
activate arbitrary path-level permanent redirects, so production remains
unchanged until an owner-approved edge/host is configured.

| Old URL | Current live status | Best current equivalent | Proposed redirect | Reason |
|---|---:|---|---|---|
| `/index.html` | 200, canonical `/` | `/` | 301 `/` | Exact homepage duplicate |
| `/about` | 200, canonical `/about.html` | `/about.html` | 301 `/about.html` | Same About page |
| `/services` | 200, canonical `/services.html` | `/services.html` | 301 `/services.html` | Same service directory |
| `/book-online` | 404 | `/quote.html` | 301 `/quote.html` | Current interactive booking/estimate flow |
| `/service-page/room-deep-clean` | 404 | `/full-house-cleaning.html` | 301 `/full-house-cleaning.html` | Closest current deep-cleaning scope; no unrelated homepage redirect |
| `/blank` | 404 | `/privacy.html` | 301 `/privacy.html` | Legacy privacy route |
| `/blank-2` | 404 | `/terms.html` | 301 `/terms.html` | Legacy terms route |
| `/blank-3` | 404 | `/refund.html` | 301 `/refund.html` | Legacy refund route |
| `/full-house-deep-cleaning.html` | 404 | `/full-house-cleaning.html` | 301 `/full-house-cleaning.html` | Renamed equivalent service |
| `/kitchen-deep-cleaning.html` | 404 | `/kitchen-cleaning.html` | 301 `/kitchen-cleaning.html` | Renamed equivalent service |
| `/bathroom-deep-cleaning.html` | 404 | `/bathroom-cleaning.html` | 301 `/bathroom-cleaning.html` | Renamed equivalent service |
| `/sofa-dry-cleaning.html` | 404 | `/sofa-cleaning.html` | 301 `/sofa-cleaning.html` | Current sofa service covers selectable treatments |
| `/blog/deep-cleaning-cost-jalandhar-2026.html` | 200 alias page | `/pricing.html` | 301 `/pricing.html` | Maintained official rate card is the accurate replacement |
| `/blog/how-to-choose-right-cleaning-service-jalandhar.html` | 200 alias page | `/blog/urban-company-deep-cleaning-review-honest.html` | 301 to current article | Current article provides the maintained quote/comparison checklist |
| `/blog/moving-out-cleaning-jalandhar-tenants.html` | 200 alias page | `/full-house-cleaning.html` | 301 `/full-house-cleaning.html` | Closest current transactional scope; no current move-out guide |
| `/blog/what-professional-deep-clean-includes.html` | 200 alias page | `/full-house-cleaning.html` | 301 `/full-house-cleaning.html` | Current page defines whole-home scope and exclusions |
| `/blank-1` | 404 | None established | **HOLD — no redirect** | Audit/project evidence does not establish a current accessibility-page equivalent |
| `http://cleannest.in/*` | Host redirect exists | Same apex HTTPS path | 301 to `https://cleannest.in/*` | Protocol canonicalization without changing page intent |
| `https://www.cleannest.in/*` | Host redirect exists | Same apex HTTPS path | 301 to `https://cleannest.in/*` | Host canonicalization without changing page intent |

Unknown `/service-page/*` routes remain unmapped. They must not be redirected in
bulk. GSC, analytics, backlinks and the historical Wix URL export are still
needed to prove whether more exact legacy paths exist.

## 2. City-page classification

No city URL was deleted. Jalandhar remains indexable. The 12 normalized template
duplicates remain accessible for users and link discovery but now use
`noindex,follow` and are excluded from the XML sitemap until unique, verified
local value is available. This is reversible and avoids fabricating locality,
travel, project or review facts.

| Page | Classification | Phase 1 action | Unique information required before KEEP + IMPROVE |
|---|---|---|---|
| Jalandhar | **KEEP + IMPROVE** | Indexable; title/H1/copy now focus on the listed office, local availability, contact, services and pricing | Add real localities served, travel/scheduling rules and linked first-party projects only when owner verified |
| Adampur | **NOINDEX** | Self-canonical retained; removed from sitemap | Confirm locality coverage, travel terms, lead time, most relevant services and a real project/review if one exists |
| Banga | **NOINDEX** | Self-canonical retained; removed from sitemap | Same city-specific operational evidence required |
| Goraya | **NOINDEX** | Self-canonical retained; removed from sitemap | Same city-specific operational evidence required |
| Hoshiarpur | **NOINDEX** | Self-canonical retained; removed from sitemap | Same city-specific operational evidence required |
| Kapurthala | **NOINDEX** | Self-canonical retained; removed from sitemap | Same city-specific operational evidence required |
| Kartarpur | **NOINDEX** | Self-canonical retained; removed from sitemap | Same city-specific operational evidence required |
| Ludhiana | **NOINDEX** | Self-canonical retained; removed from sitemap | Same city-specific operational evidence required |
| Nakodar | **NOINDEX** | Self-canonical retained; removed from sitemap | Same city-specific operational evidence required |
| Nawanshahr | **NOINDEX** | Self-canonical retained; removed from sitemap | Same city-specific operational evidence required |
| Phagwara | **NOINDEX** | Self-canonical retained; removed from sitemap | Same city-specific operational evidence required |
| Phillaur | **NOINDEX** | Self-canonical retained; removed from sitemap | Same city-specific operational evidence required |
| Sultanpur Lodhi | **NOINDEX** | Self-canonical retained; removed from sitemap | Same city-specific operational evidence required |
| Dasuya | **MERGE** | Enquiry function is handled by the area hub; orphan page retained as `noindex,follow` and removed from sitemap | Create a dedicated page only if coverage, demand and unique operations are verified |
| Hariana | **MERGE** | Enquiry function is handled by the area hub; orphan page retained as `noindex,follow` and removed from sitemap | Create a dedicated page only if coverage, demand and unique operations are verified |

The site already has one explicit “outside these areas?” enquiry module on the
service-area hub. No local office, address, review, project or staffing claim was
added for any other city.

## 3. Canonical business identity

`site/business.mjs` is now the internal source of truth used by visible contact
components, footer, schema, canonical origin, redirect origin, social links,
directions and the quote handoff. It contains the currently implemented name,
domain, phone, display phone, email, working hours, WhatsApp, Instagram,
directions, Justdial profile, address and confirmed city list.

The Google review URL is deliberately `null`: the existing map link is a
directions destination and is not reused as a review CTA. Undated rating totals
were removed from the homepage/reviews UI. The Google review action now links to
the sourced excerpts on the CleanNest reviews page; Directions remains a
separate footer/contact action. Once the owner supplies the verified Google
review/profile URL, that single source field can safely enable an external CTA.

The structured-data graph now links `LocalBusiness` → `WebSite` → each
`WebPage`, with the same stable business ID and canonical origin.

## 4. Quote-flow CLS

The original Lighthouse trace attributed 0.387 of CLS to the footer moving when
Manrope loaded; the quote H1 had a further 0.00087 font shift. The page also
shipped an empty `#quote-stage` and inserted the whole first step after a client
fetch.

Phase 1 changes:

- changed local font loading from late `swap` reflow to `optional`, while
  preloading Manrope on the quote template;
- server-rendered the complete first quote step, progress state, choices and
  prices before JavaScript runs;
- retained explicit image dimensions and progressive enhancement;
- continued to allow the client to take over the same markup and state without
  reserving an artificial viewport-height shell.

Post-change Lighthouse mobile: performance **97**, CLS **0.000**, LCP **2.48 s**.

## 5. Results/gallery delivery

The 29 original 1254×1254 PNG files remain untouched (about 66 MiB combined).
They are no longer referenced by the gallery cards, no-JavaScript links or
lightbox. Phase 1 generated 145 responsive derivatives:

- WebP: 480 and 720 pixels, plus the existing 880-pixel previews;
- AVIF: 480, 720 and 880 pixels;
- total new derivative footprint: about 5.6 MiB.

Cards use `<picture>`, AVIF/WebP `srcset`, viewport-aware `sizes`, intrinsic
dimensions/aspect ratios, eager/high priority only for the first result, and
native lazy loading below it. The lightbox uses the 880-pixel AVIF/WebP rather
than a 1.6–3.1 MiB PNG. Visual cropping still excludes the poster margins.

Rendered mobile evidence: first image selected a 480-pixel AVIF at DPR 1; the
lightbox selected an 880-pixel AVIF; zero PNG originals were requested. Final
Lighthouse mobile: performance **97**, CLS **0.000**, LCP **2.63 s** (before:
82, 0.0007 and 3.63 s respectively).

## 6. Article attribution and BlogPosting data

All eight current articles now visibly identify the CleanNest Cleaning Journal
and show the factual repository-backed page update date, 10 September 2026.
Their BlogPosting nodes include `dateModified`, a crawlable representative
`ImageObject`, publisher, linked WebPage entity and canonical main entity.

No author or original publication date was inferred. Those fields remain absent
from visible bylines and JSON-LD until supplied by the owner.

Affected articles:

1. Ultimate Deep Cleaning Checklist for Every Room
2. How Often Should You Deep Clean Your Home?
3. Bathroom Deep Cleaning: Hard-Water Marks, Grout and Moisture
4. Kitchen Deep Cleaning: A Practical Grease-Cleaning Guide
5. Sofa Cleaning: Dry Cleaning, Steam and Shampoo Explained
6. AC Cleaning: What to Check Before the Next Season
7. CleanNest and Urban Company: Comparing Cleaning Quotes
8. Local Cleaning Service or Booking Platform? Questions to Ask

## 7. Search-intent separation

| URL | Distinct role after Phase 1 | Title | H1 direction |
|---|---|---|---|
| `/` | CleanNest brand and primary local commercial introduction | `CleanNest \| Professional Cleaning in Jalandhar` | Professional cleaning for home and work |
| `/services.html` | Browse/compare service-category directory | `Cleaning Services Directory \| CleanNest Jalandhar` | Explore CleanNest cleaning services |
| `/jalandhar.html` | Jalandhar office, availability and local contact landing page | `Cleaning Company in Jalandhar \| CleanNest` | CleanNest cleaning services in Jalandhar |

Descriptive internal links now connect home → full directory, directory →
Jalandhar availability, and Jalandhar → directory/pricing/contact.

## Before vs after

| Issue | Before | Change made | After | Files changed | Verification |
|---|---|---|---|---|---|
| Legacy Wix routes | Search-visible routes 404 or noncanonical 200 variants | Exact one-to-one map, query preservation, no-chain edge behavior; added room-deep-clean mapping | 16 mapped paths pass 301 destination tests; `/blank-1` and unknown paths safely held | `site/redirects.mjs`, `hosting/redirect-worker.mjs`, `hosting/README.md`, redirect tests | 301/no-chain/query tests pass; production activation intentionally pending |
| Duplicate city pages | 12 exact normalized duplicates indexable; Dasuya/Hariana orphaned in sitemap | Classified; non-Jalandhar duplicates noindexed and removed from sitemap; Jalandhar improved | 14 risky pages out of sitemap, self-canonical and accessible; Jalandhar indexable | `site/city-content.mjs`, `scripts/build.mjs`, generated city HTML, `sitemap.xml` | Automated city/sitemap tests and structural crawl pass |
| Business identity | Facts and destinations could diverge; review CTA reused directions | Canonical business module extended and consumed by redirects/quote/schema/UI | One internal record; review and directions actions separated | `site/business.mjs`, `site/seo.mjs`, `site/final-home.mjs`, `site/final-pages.mjs`, `assets/quote-flow.js` | Identity/schema structural check and review-link test pass |
| Quote CLS | CLS 0.387; empty quote-stage HTML | Stable font strategy plus server-rendered initial step | CLS 0.000; performance 97; LCP 2.48 s | `site/styles/base.css`, `scripts/build.mjs`, `assets/quote-flow.js`, generated quote assets/HTML | Lighthouse and rendered quote interactions pass |
| Gallery images | Lightbox referenced ~66 MiB of PNG originals | Responsive AVIF/WebP architecture, dimensions, sizes, lazy/eager policy | No original PNG requested; 480/720/880 choices; LCP 2.63 s | `scripts/build.mjs`, `assets/site.js`, `site/styles/base.css`, `assets/img/results/responsive/`, generated gallery HTML/assets | Browser network check, lightbox test, image tests and Lighthouse pass |
| Article attribution | 8 pages lacked visible date/byline and article image/date fields | Added factual update date, publication label, representative ImageObject and entity links | Supported metadata visible and in JSON-LD; unknown author/publish date omitted | `site/blog.mjs`, `site/seo.mjs`, eight generated articles | All 8 article/schema tests and structural crawl pass |
| Intent cannibalization | Home, Services and Jalandhar used overlapping lead intent | Distinct titles, H1s, supporting copy and internal anchors | Brand intro, catalogue and local landing roles are explicit | `site/final-home.mjs`, `site/final-pages.mjs`, `site/city-content.mjs`, `scripts/build.mjs` | Role/title tests and rendered templates pass |

## Verification summary

- `npm test`: **27/27 passed**.
- `npm run check`: **66 HTML pages checked**, **46 sitemap URLs**, no link,
  anchor, image, canonical, heading, schema or business-identity errors.
- `npm run check:browser`: **16 representative templates** at 360×800,
  390×844, 768×1024 and 1440×900; menu, quote, FAQ, carousel, comparison,
  dialog and reduced-motion checks passed; no enquiry sent.
- Manual 390px quote/service/menu/gallery checks: document width equals viewport
  width; sofa options, service-change control and menu fit; gallery/lightbox work.
- Lighthouse mobile: quote **69 → 97**, CLS **0.387 → 0.000**, LCP
  **3.03 s → 2.48 s**; results **82 → 97**, CLS **0.0007 → 0.000**,
  LCP **3.63 s → 2.63 s**.

## OWNER INPUT REQUIRED

1. **Google review/profile URL:** supply the verified customer-facing URL from
   the Google Business Profile owner dashboard. It must be distinct from the
   directions link.
2. **Article authors:** provide the factual person or organization responsible
   for each of the eight articles, plus any reviewer only where one actually
   reviewed the content.
3. **Original publication dates:** provide the factual first-publication date
   for each article. The implemented 10 September 2026 value is explicitly the
   content modification date supported by repository history, not a fabricated
   publication date.
4. **Business profile confirmation:** confirm the public trading/legal name,
   primary phone, email, displayed street address, 9 AM–8 PM daily hours,
   WhatsApp, Instagram, Justdial profile and whether all 13 listed cities are
   genuinely current service areas. Directory call-tracking numbers should be
   identified separately.
5. **City evidence:** for every city intended to become indexable, provide exact
   localities served, any travel fee/distance rule, normal scheduling/lead-time
   facts, services actually offered there, and real local projects/reviews with
   permission and source URLs. A city name alone is insufficient.
6. **Dasuya and Hariana:** confirm whether they are true service areas or only
   enquiry locations. They currently remain merged conceptually into the general
   out-of-area enquiry and are not indexable.
7. **Redirect infrastructure:** approve/configure a redirect-capable edge or host
   in front of GitHub Pages before the tested permanent redirects can become
   live. No DNS or hosting change was made.
8. **Legacy exports:** provide Google Search Console, analytics, backlink and Wix
   URL exports to identify any additional exact legacy paths. Also confirm
   whether `/blank-1` ever had a current accessibility equivalent.
