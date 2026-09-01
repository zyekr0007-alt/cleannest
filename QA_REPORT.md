# CleanNest QA Report — 2026-09-01

Full QA pass over all **45 pages** of cleannest.in (static site, GitHub Pages) after the
redesign push. Testing done with a real headless Chrome (agent-browser, fresh profile) against
a local server serving the exact repo content, plus static link/image/JS analysis.

## What was checked

| Check | Method | Result |
|---|---|---|
| All internal links (878) resolve | static scan of `href` on all pages | ✅ 0 broken |
| Anchor targets (`#id`) | static scan | ✅ 0 missing |
| Images exist | static scan of `src`/`srcset` + browser `naturalWidth` check | ✅ 0 broken (45/45 pages) |
| Inline JS syntax | `node --check` on every `<script>` block | ✅ 0 errors |
| Console errors | injected `window.onerror`/`console.error` hooks on every page (fresh Chrome profile, cache-free) | ✅ 0 errors after fixes |
| Horizontal overflow | `scrollWidth - innerWidth` at 1280 / 1024 / 768 / 390 px | ✅ 0 after fixes |
| Navigation | every page's nav/menu links point to existing pages | ✅ |
| Mobile responsive (390px) | overflow + menu + quote checks on all pages | ✅ |
| Lightbox | results.html + index.html gallery click → open/close | ✅ works |
| Quote modal | open/close + service options rendered (all pages) | ✅ works |
| Menu (mobile) | open/close, body scroll lock | ✅ works |
| Filter buttons (results.html) | kitchen filter: 61 → 13 items shown | ✅ works |
| Scroll reveal animations | `.rv`/`.scroll-reveal` elements gain `.in` on scroll | ✅ after fix |

## Issues found & fixed

### Fixed in this pass

1. **[MEDIUM] 15 service pages overflow horizontally (20–532px)**
   `.srv-hero-media` had no CSS rule; hero images declared `width="1260"` rendered unconstrained,
   overflowing the page at every desktop/tablet width (20px @1280, 276px @1024, 532px @768).
   - **Fix:** `style.css` — added `.srv-hero-media img { width: 100%; height: auto; display: block; }`
   - **Affected:** ac-services, balcony-cleaning, carpet-steam-cleaning, chandelier-cleaning,
     chimney-cleaning, commercial-cleaning, curtain-cleaning, exhaust-fan-cleaning, floor-renewal,
     gas-stove-cleaning, jet-washing, mattress-steam-cleaning, pool-cleaning, refrigerator-cleaning,
     window-blinds-cleaning (+ all service pages share the class).
   - **Verified:** overflow 0 at 1280/1024/768/390 on ac-services; image scales to column.

2. **[MEDIUM] pricing.html was a dead-end page**
   Standalone old template: no site nav, no menu, no footer links, no shared CSS — users landing
   from the "Pricing" nav link (present on all 44 other pages) had no way to navigate.
   - **Fix:** rebuilt `pricing.html` on the shared site template — same header/nav, mobile menu,
     quote modal, footer, sticky contact bar, shared `style.css` + fonts, preloader. Kept the full
     rate-card content and its SEO meta + LocalBusiness/OfferCatalog/Breadcrumb JSON-LD. Added a
     "Get Free Quote" CTA wired to the quote modal.
   - **Verified:** nav/menu/quote-modal/footer all present & working, 0 overflow @390 & desktop,
     content intact, 0 console errors.

### Already fixed upstream (parallel commits landed mid-QA — verified, no action needed)

- **about.html `TypeError: nums.every / els.every is not a function`** (NodeList has no `.every`):
  threw every 300ms in two fallback intervals, spammed the console forever, and killed the
  scroll-reveal fallback so 7 elements (incl. the "how we work" section) could stay invisible.
  Fixed in commit `ee39cb3` (`Array.from(...).every`) — re-verified: 0 errors, all `.rv` reveal.
- **Homepage/reviews desktop horizontal overflow** (reviews row `grid-auto-flow: column` without a
  scroll container: index 458px, reviews.html 3162px): fixed in the redesign commits by switching
  the ≥1024px layout to a balanced grid. Re-verified: overflow 0 on index + reviews.

### Not bugs (investigated)

- `G-XXXXXXXXXX` GA placeholder on all pages: gtag loads fine, collect calls return 204 — no
  console errors. It is a documented fill-in hook; left in place (owner must drop in the real
  Measurement ID when available).
- `data:image/gif` 1×1 images flagged by image checks are the lightbox placeholder `<img>` —
  intentional.
- `assets/js/motion.js` referenced on all pages — exists and serves 200.

## Final state

- **45/45 pages:** 0 console errors, 0 horizontal overflow (1280/1024/768/390), 0 broken images,
  all nav links valid, menu + quote modal + lightbox + filters functional.
- Files changed in this pass: `style.css` (1 rule), `pricing.html` (template rebuild).
- QA report: `QA_REPORT.md` (this file).
