# CleanNest Content & Visual Asset System

Single source of truth for every repeating piece of CleanNest website content.
**Nothing in this system changes the design** — it organizes what already exists.

## How to use it

1. Edit the JSON catalog (`content/*.json`).
2. Edit the matching HTML locations (table below).
3. Run the verifier to confirm every location is in sync:

```bash
python3 scripts/verify_content.py   # from the repo root
```

The verifier extracts the live HTML and compares it against the JSON — it reports
any catalog entry missing from any page that should contain it.

## 1. Brand tokens → `content/brand.json` (+ `assets/css/style.css :root`)

The design language is defined once, in CSS custom properties. Never hard-code a
color, radius, or font in HTML.

| Token | Value | Use |
|---|---|---|
| `--navy` | `#0B4364` | primary, gradients, buttons, footer |
| `--cyan` | `#0CD7E5` | accent, focus outlines, hover |
| `--cyan-ink` | `#067A86` | accessible cyan text on white (AA) |
| `--cyan-soft` | `#E6F6FA` | section bands (`alt-bg`) |
| `--ink` / `--text` / `--muted` | `#0B3A55` / `#45586A` / `#647480` | headings / body / secondary (AA) |
| `--danger` | `#B3261E` | form errors only |
| Fonts | Sora (display) + Inter (body) | Google Fonts, both families |

Rules: body ≥ 16px, small text ≥ 0.78rem, h1 ≤ clamp(1.9rem,4vw,2.85rem), h2 ≤ 2rem.
Buttons: `btn` (primary navy gradient) / `btn-wa` (WhatsApp green) / `btn-line` /
`btn-ghost` / `btn-sm`. Radius: cards 16px, large 22px, pills 999px. Sections 88px
vertical rhythm; cards 24px padding; grids 22px gap.

## 2. Image system

| Folder | Role | Spec |
|---|---|---|
| `assets/img/services/` | 9 service photos | 16:10 (1260×790), jpg + webp twin (q82, method 6), `<picture>` markup with jpeg fallback |
| `assets/img/gallery/` | real CleanNest work photos | `work-N.jpg/webp`; hero 800×668 (5:4); before/after reuse the same file (before = CSS desaturation) |
| `assets/img/blog/` | blog thumbnails | 16:10 via CSS aspect-ratio |
| `assets/img/og-cover.jpg` | social share | 1200×630 |
| `assets/img/logo-emblem.png`, `favicon*`, `apple-touch-icon.png` | brand | never change |

**Rules:** real CleanNest photography only — never swap in generic stock.
Never delete the jpg original (it's the fallback). New photos: add jpg + webp twin
(Pillow q82 method=6), reference via `<picture>`, give every img width/height or a
CSS aspect-ratio to avoid layout shift.

## 3. Before/After projects → `content/before-after.json`

Each project: `role` (featured / mini-1..3), `before` + `after` (same real file —
the "before" layer is the same photo desaturated by CSS, never a different image),
plus optional `serviceType` / `location` / `notes` — **leave empty until CleanNest
verifies them; never invent project details.**

Add a new project:
1. Copy a `.ba-mini` block in `index.html` (pattern: `div.ba-mini[data-slider]`
   with two `<picture>` layers + `.ba-divider` + Before/After tags).
2. Add the entry to `before-after.json`.
3. Run the verifier.

## 4. Services → `content/services.json`

9 services, each with `name`, `slug` (analytics-safe), `short` (card copy), `image`
+ `webp`, `url`, `category` (home/fabric/appliance/commercial), `homepage` flag,
`waText` (pre-filled WhatsApp message).

A service appears in 5+ places — **when you change a service, update all of them**:

1. `content/services.json`
2. `index.html` — service card block (if `homepage: true`)
3. `services.html` — full section + JSON-LD `Service` list
4. `service-page/<slug>.html` — the dedicated page (copy the template pattern)
5. Footer "Our Services" column
6. `sitemap.xml` — the service page URL

The analytics service slugs (`content/services.json → slug`) are already wired into
`assets/js/main.js` `SVC_MAP` — keep the two lists identical if you rename a service.

## 5. Reviews → `content/reviews.json`

3 genuine Google reviews (4.9★ / 219 — verified). Fields: `name`, `avatar`
(initials or `"g"` for the Google logo), `rating`, `text`, `source`, optional
`service` tag. **Never add fake reviews.** A review appears on: homepage marquee
(`index.html`), About page, and the homepage JSON-LD `review` array — keep all
three in sync (schema reviews must match the visible cards exactly).

## 6. Service areas → `content/areas.json`

12 verified cities with `url` + factual `distance` (from the city page chip).
Each area appears in: homepage chips + footer band (`index.html`), its city page
(`cities/<slug>.html`), the homepage JSON-LD `areaServed` list, and (via footer)
every page. Add a new area only when CleanNest actually serves it.

## 7. Maintenance discipline

- One catalog per content type; the HTML is the render, the JSON is the record.
- After ANY content change: `python3 scripts/verify_content.py` must be all-PASS.
- The existing QA script `scripts/qa_check.py` covers image refs + phone; run both.
- Content changes never require a design change: cards, sliders, chips, and CTAs
  are all class-based components — new content reuses the same components.
