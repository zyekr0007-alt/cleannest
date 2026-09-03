# CleanNest — Content Architecture and Publication Rules

Project: cleannest.in — CleanNest deep-cleaning services, Jalandhar, Punjab, India

Repository: `/Users/zyekr/cleannest-site`
Purpose: define the current information architecture, conversion journey, factual content boundaries, and maintenance rules for the static site.

## Product purpose

CleanNest uses the site to help homeowners, tenants, families, local businesses, and people arranging cleaning for relatives identify a suitable service and request a free quote on WhatsApp. There is no online checkout. Booking requires 50% to confirm and the remaining 50% after service.

The site should answer these questions in order:

1. Do you serve my need?
2. Can I trust the result?
3. What might it cost?
4. Do you serve my area?
5. How do I book?

## Current information architecture

- `index.html` — conversion-focused homepage
- `services.html` — all-services hub
- `pricing.html` — official starting-rate card
- `areas-we-serve.html` — service-area hub
- `faqs.html` — complete FAQ page
- 20 service-detail pages at the repository root
- 14 city/area pages at the repository root
- Four legacy service aliases that canonicalize to their current deep/dry-cleaning pages
- `sitemap.xml`, `robots.txt`, and `CNAME`

The repository contains 42 root-level HTML pages. Service-detail and city pages use unique titles, descriptions, canonical URLs, visible copy, and structured data. `build_service_pages.py` is stale and must not be run.

## Homepage specification

The homepage is a proof-led conversion path in this order:

1. Header
2. Hero with one real CleanNest result and quote/results actions
3. Compact trust strip
4. Six popular services and a link to all services
5. Real results
6. Google reviews
7. Service-area summary
8. Four common questions
9. Final WhatsApp quote action
10. Compact footer

The homepage must keep one H1: `Professional Cleaning. Done Right.` It should explain that CleanNest provides home and commercial deep cleaning in Jalandhar, show real work before decorative claims, and end with one clear quote action.

## Page responsibilities

### Services

`services.html` lists all 20 current services under clear categories. Each service page should present the service name and outcome, what is included, when to book, a real result or relevant existing photo, an honest starting-price path or custom-quote path, service-specific FAQs, a final WhatsApp action, and the shared footer.

### Pricing

`pricing.html` is the only complete rate card. Published figures are starting rates, not guaranteed final prices. The exact scope and price are confirmed before booking on WhatsApp. Custom-quote services must not receive invented prices.

### Areas

`areas-we-serve.html` leads with Jalandhar and links to every current city page. City pages should remain concise and useful, avoid invented neighbourhood or landmark detail, and explain that exact coverage depends on the job and location and is confirmed on WhatsApp.

### FAQs

`faqs.html` groups questions under Booking & Quotes, Services & Pricing, Care & Safety, and Areas & Good to Know. Payment wording is always 50% to confirm and 50% after service. Unconfirmed training, uniform, and product-safety claims must not be strengthened.

## Conversion and contact rules

- Primary action: request a free quote through the existing quote panel and WhatsApp flow.
- Canonical display number: `+91 76100 00654`.
- Canonical telephone and WhatsApp number: `917610000654`.
- Preserve the existing direct WhatsApp, Call, Email, Instagram, Directions, and Google Business Profile links.
- Preserve quote-panel behaviour, service preselection, and generated WhatsApp message content.
- Do not add checkout, account, or booking-platform claims.

## Claims register

| Claim | Current value | Publication rule |
|---|---:|---|
| Google rating | 4.9 | Keep only while the live GBP shows 4.9 |
| Google ratings/reviews | 468 | Confirm before changing or expanding placement |
| Hours | 9 AM–8 PM, 7 days | Confirm with owner before changing |
| Payment | 50% to confirm, 50% after service | Required wording |
| Training/uniforms/product safety | Unconfirmed | Do not strengthen or add without owner evidence |
| “Most trusted” | Unsupported superlative | Replace with factual local-service wording |

Existing `4.9 / 468` values may remain in their current contexts, but must not be expanded, relabelled as verified, or used to create new claims without confirmation.

## Brand and copy rules

- Palette: navy `#0B4364`, cyan `#0CD7E5`, and off-white surfaces.
- Typography: Ultima for the wordmark and Nunito for display/body copy.
- Use real existing photos. Do not introduce decorative stock imagery into the hero.
- No emojis, promotions, discount codes, generic luxury language, or unsupported superlatives.
- Use concise Indian English, factual service descriptions, and active CTA labels.
- Use `From ₹X` only when that rate already appears in `pricing.html`; otherwise use `Custom quote`.
- Keep all unique page metadata and structured data intact when changing presentation.
- Canonical URLs use `https://cleannest.in/`.

## Maintenance checks

Before publishing content changes:

1. Confirm there are 42 root HTML files and 42 sitemap URLs.
2. Validate one canonical URL and valid JSON-LD on each applicable page.
3. Check internal links and image paths.
4. Confirm all WhatsApp and telephone links use the canonical number.
5. Check for promotional remnants, unsupported claims, and emojis.
6. Run the structural and responsive QA suites.
