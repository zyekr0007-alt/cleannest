# CleanNest Button & CTA Audit Report

Scanned **38 HTML files** in `~/Documents/GitHub/cleannest`. Every `<button>`, CTA `<a>`, nav, and footer was checked against site-wide patterns.

---

## (1) MISPLACED — buttons/CTAs that exist but shouldn't

None. Every button/CTA is on the correct page and section for its purpose.

---

## (2) MISSING — buttons that should exist but don't

### 2a. pricing.html nav missing 3 links
`pricing.html:300-304` uses a completely different nav structure (`.pn-nav`) with only: **Services, FAQs, Get a free quote, Call us**. Missing:
- **Results** (index.html#results) — present on every other page
- **Reviews** (index.html#reviews) — present on every other page
- **Areas** (areas-we-serve.html) — present on every other page

### 2b. Service page heroes lack "View Pricing"
Service pages (pool-cleaning, kitchen-cleaning, etc.) hero CTAs only offer **Get Free Quote on WhatsApp + Call**. Area/location pages (phillaur, banga, etc.) ALSO include a **View Pricing** button (line 97). Service page visitors have no direct link to pricing from the hero.

### 2c. Area pages link to non-existent files
Every location page (phillaur, banga, kapurthala, adampur, goraya, hariana, hoshiarpur, dasuya, nawanshahr, nakodar, kartarpur, sultanpur-lodhi) has a local-services grid linking to:
- `full-house-deep-cleaning.html`
- `kitchen-deep-cleaning.html`
- `bathroom-deep-cleaning.html`
- `sofa-dry-cleaning.html`

**None of these files exist.** Example: `phillaur.html:110`.

### 2d. No aria-current on nav links
- Service pages (pool-cleaning.html, kitchen-cleaning.html, etc.) don't set `aria-current="page"` on the **Services** nav link
- Area pages don't set `aria-current="page"` on the **Areas** nav link
- Only `services.html:111` and `areas-we-serve.html:395` set `aria-current`

---

## (3) WRONG LABEL — button text doesn't match site spec

### 3a. Nav CTA says "Get Quote" instead of "Get Free Quote"
Every page's `.desk-nav-cta` (e.g. `index.html:115`) uses label **"Get Quote"**, while every hero/banner CTA uses **"Get Free Quote"** or **"Get Free Quote on WhatsApp"**. Inconsistent branding.

### 3b. Area pages use different label in CTA band
Area page heroes use **"Get Free Quote"** (consistent), but their bottom CTA band uses **"WhatsApp for Quote"** (`phillaur.html:119`) — different wording from service pages which use **"Get Free Quote on WhatsApp"**.

---

## (4) WRONG HREF — wa.me or tel number mismatch

### 4a. Consistent numbers — no mismatch found
- WhatsApp: `917610000654` — consistent across all 38 pages ✓
- Phone: `tel:+917****0654` (masked) — consistent across all 38 pages ✓

### 4b. Area page service links point to files that don't exist
(See 2c above — these are broken hrefs, not phone/wa mismatches.)

---

## (5) DUPLICATE CTAs — same purpose, two buttons, same page

### 5a. recurring-cleaning.html:138 + :140 — two WhatsApp buttons, same destination
```
138:  <a class="btn btn-primary" href="wa.me/917610000654?text=...">Get Free Quote →</a>
140:  <a class="cta-btn cta-glass" href="wa.me/917610000654?text=...">WhatsApp Us</a>
```
Both point to the identical wa.me URL in the same CTA band. Different styling, same action — redundant.

---

## (6) NAV LINK CONSISTENCY — across all pages

| Page | Nav type | Services | Results | Reviews | Pricing | Areas | FAQs | Get Quote |
|---|---|---|---|---|---|---|---|---|
| index.html | desk-nav | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| services.html | desk-nav | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| All service pages (22) | desk-nav | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| All area pages (13) | desk-nav | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| areas-we-serve.html | desk-nav | ✓ | ✓ | ✓ | ✓ | ✓ ✓ | ✓ | ✓ |
| faqs.html | desk-nav | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **pricing.html** | **pn-nav** | ✓ | **✗** | **✗** | — | **✗** | ✓ | ✓* |

*`pricing.html` uses different labels: "Get a free quote" and "Call us" instead of "Get Quote".

**Verdict: pricing.html is the only outlier** — it's missing Results, Reviews, and Areas. All other 37 pages have identical desk-nav structure ✓.

---

## (7) FOOTER LINK CONSISTENCY — across all pages

| Link | Present on all pages? |
|---|---|
| CleanNest brand → index.html | ✓ (all 38 pages) |
| WhatsApp (wa.me) | ✓ (all 38 pages) |
| Instagram (instagram.com/cleannest.co) | ✓ (all 38 pages) |
| Directions (Google Maps) | ✓ (all 38 pages) |
| Email (cleannestclub@gmail.com) | ✓ (all 38 pages) |
| f-hours (9 AM – 8 PM) | ✓ (all 38 pages) |
| Copyright / bottom bar | ✓ (all 38 pages — text matches) |
| Call (tel:+917****0654) | ✓ (all 38 pages, in footer) |

**Verdict: Footer is 100% consistent** across all 38 pages.

---

## Summary of issues requiring action

| # | Severity | File(s) | Issue |
|---|---|---|---|
| 1 | **HIGH** | pricing.html:298-305 | Nav missing Results, Reviews, Areas |
| 2 | **HIGH** | All 13 area pages (line ~110) | Local service grid links to 4 non-existent HTML files |
| 3 | **MEDIUM** | All 38 pages (desk-nav-cta) | "Get Quote" should be "Get Free Quote" |
| 4 | **MEDIUM** | All service pages | Hero lacks "View Pricing" link |
| 5 | **LOW** | recurring-cleaning.html:138-141 | Duplicate WhatsApp buttons in same CTA band |
| 6 | **LOW** | All service + area pages | Missing aria-current on nav links |
| 7 | **LOW** | All area pages | "WhatsApp for Quote" vs "Get Free Quote on WhatsApp" |