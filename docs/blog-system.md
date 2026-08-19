# CleanNest Blog & Local SEO System

The blog already exists and is live: listing at `/blog.html`, 30 articles in
`blog/*.html`, all in the sitemap. This document is the operating manual for
publishing future articles and growing local organic traffic — **the system stays
lightweight (plain HTML, no framework, no runtime JS)**.

## 1. Content catalog → `content/blog.json`

Every article has one record: `title`, `url`, `slug`, `date`, `category`,
`image` (real site photo), `description`, `canonical`, `relatedService`
(only where the service genuinely exists — must match `content/services.json` slugs).
After any blog change: `python3 scripts/verify_content.py` must stay all-PASS.

## 2. Article template (copy an existing post)

Each article has the complete SEO skeleton already — reuse it:

| Piece | Where |
|---|---|
| SEO title (≤ ~60 chars) | `<title>` |
| Meta description (≤ ~160 chars) | `name="description"` |
| Canonical | `rel="canonical"` → `https://cleannest.in/blog/<slug>.html` |
| OG + Twitter (title/desc/image) | head metas |
| H1 | `page-head` `<h1>` (matches title) |
| H2/H3 structure | `.blog-body` — short sections, lists, honest practical steps |
| Visible meta | `.blog-meta`: date ("Updated 15 Aug 2026"), location, "CleanNest Team" |
| Featured image | `.blog-featured-img` figure (real photo, real width/height, lazy) |
| Article schema | JSON-LD `Article` (headline, description, author = Organization CleanNest, publisher, datePublished, mainEntityOfPage) |
| FAQ schema | JSON-LD `FAQPage` where the article answers genuine questions |
| Related-service CTA | `.blog-cta` — WhatsApp button with service prefill (matches analytics `svc` slug) |
| Related articles | `.blog-sidebar` → "Popular guides" list |

## 3. Publishing a new article (checklist)

1. Copy an existing post; change slug, title, description, date (today), body,
   featured image (real photo — blog image or matching service photo), alt text.
2. Add the "Popular guides" link to the new post on **every other article's**
   sidebar (the list is shared across posts — keep it uniform) and to `/blog.html`
   if it belongs in the grid (choose a `data-cat` + card with image + date).
3. Add the URL to `sitemap.xml` (lastmod = today).
4. Add the record to `content/blog.json`.
5. If the article targets a service, keep the `.blog-cta` WhatsApp text aligned
   with that service's `waText` and the analytics `SVC_MAP` slug.
6. Run `scripts/verify_content.py` + `scripts/qa_check.py`, check mobile + desktop,
   commit, push (cache-buster only if CSS/JS changed).

## 4. Topic bank (planned — publish only genuinely useful, verified content)

Already covered (30 posts): deep cleaning tips, how-often guides, bathroom,
kitchen/chimney, sofa, carpet/steam, move-out, office cleaning, post-construction
(renovation), pricing guide, checklists (Diwali, prepare-home), allergy cleaning,
marble floors, windows, water tanks, product guide, DIY vs pro.
Open topics for later: move-in cleaning, monsoon cleaning, seasonal deep-clean
checklists, per-service "how to prepare" guides.

**Rules:** no fake reviews/stats/certifications/awards; no "AI expert" personas —
author is always the real company (CleanNest); no invented pricing, service
details, or timelines; claims must match the rest of the site (4.9★/219 reviews,
quote-first process, 12 cities, 9 services).

## 5. Local SEO structure (already live — do not duplicate)

- **Service pages** `service-page/*.html` — 9 services, each "…in Jalandhar",
  own H1/FAQ/schema/quote CTA.
- **City pages** `cities/*.html` — 12 verified areas with unique intro + FAQ +
  distance chip. Do NOT create more near-identical city pages.
- **Local articles** — e.g. `how-to-choose-cleaning-service-jalandhar.html`,
  `house-deep-cleaning-cost-jalandhar.html` — "X in Jalandhar" topics.
- New local content should be an article or service-page addition, never a
  copy-paste city page.

## 6. Performance & design rules

- Images: real photos only, webp twin where possible, real width/height or CSS
  aspect-ratio (16/10 for blog), `loading="lazy"` on non-hero images.
- No heavy frameworks, no comment systems, no ad units, no popups, no social
  embeds. Minimal JS (only the shared `main.js`).
- Reading experience: generous whitespace, body copy ≥16px, line-height ~1.66,
  content column ~maxw (1160px) with sidebar on desktop, stacked on mobile.
