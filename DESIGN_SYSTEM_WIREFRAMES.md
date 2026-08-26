# CleanNest — Design System & UX Wireframes

Project: cleannest.in — CleanNest, Deep Cleaning Services, Jalandhar (Punjab), India
Repo: ~/cleannest-site (github.com/zyekr0007-alt/cleannest, GitHub Pages, live on www.cleannest.in)
Companion doc: `CONTENT_ARCHITECTURE.md` (information architecture, copy, brand voice — read that for words; this doc for look + layout).
Status: Source of truth for the visual style and page layouts. Guides the frontend build (child task t_06a723f5).

---

## 0. How to use this doc

- §1–§7 are the **design spec** (tokens, palette, type, spacing, imagery, motion). These map 1:1 to CSS custom properties / classes a build should emit.
- §8 is the **wireframe pack** — a low-fidelity box diagram per page. Boxes = layout zones; labels = content; `+91 76100 00654` = the one canonical WhatsApp number; `[CTA]` = the primary "Get Free Quote" action.
- §9 is the **interaction/component** library (how the reusable pieces behave).
- §10 is **responsive + accessibility** rules.
- §11 is the **build handoff** checklist.

Design decisions here are FINAL. If a downstream task changes the palette, type scale, or a wireframe layout, it must come back to this file first — do not let two tasks invent two answers to the same question.

---

## 1. Guiding principles

The site is a **single-conversion lead machine**. Every visual choice serves trust + clarity + one action (WhatsApp). The aesthetic is **"clean, calm, professional local service"** — not a corporate SaaS, not cutesy.

1. **Prove it, don't brag.** Numbers (4.9★, 468 ratings, real ₹ starting prices, 12 cities) are the hero content. The design never competes with the proof.
2. **One action per screen.** A primary CTA is visible in the first viewport and repeated at the bottom band of every page. Nothing competes with it.
3. **Trust is the brand.** Verified/uniformed/trained staff, eco-safe family&pet-safe products, on-time, honest pricing. The UI reads calm and dependable.
4. **Mobile-first.** Nearly all visitors are on phones arriving from Google. Everything is built bottom-up for a 390px viewport and enhanced up.
5. **Light, airy, glassy.** Off-white surfaces + soft navy/cyan radial glows + glassmorphism cards. Feels like a clean home, not a heavy dashboard.
6. **Restrained motion.** Motion exists to guide the eye (reveal on scroll, CTA pulse settling to calm, gradient wave) — never to show off. No scroll-jacking, no auto-carousels that trap the user.

---

## 2. Color palette

| Token | Hex | Usage | Notes |
|-------|-----|-------|-------|
| `--navy` | `#0B4364` | Brand primary — section titles, badge text, key strokes | Deep trusting blue |
| `--navy-dark` | `#082E46` | Dark navy for depth, hover states, subtle overlays | |
| `--navy-deep` | `#061D2E` | Deepest navy — contrast text on cyan CTA, footer accents | |
| `--cyan` | `#0CD7E5` | Accent — highlighted word in titles (`.star`), links, icons | Headline pop |
| `--cyan-soft` | `#E0FAFD` | Chip/badge background, soft highlight fills | |
| `--ink` | `#12222E` | Body text | WCAG AA on white |
| `--muted` | `#4E606E` | Secondary/sub text | AA on white |
| `--white` | `#FFFFFF` | Card + page base | |
| `--surface` | `#F6F7F9` | Page background | Uniform light grey |
| `--surface-2` | `#F6F7F9` | Alt surface (kept = surface for a flat calm look) | |

**Accent gradients (for the headline gradient-words only — not general UI):**
- Cyan wave: `#0AA9C9 → #1CC9D8 → #0AA9C9` (the `.accent` / `.star` word, e.g. *"Done Right."*, *"Results"*, *"us?"*). Animate background-position for a slow shimmer.
- Navy wave: `#0B4364 → #082E46 → #1476A8 → #0B4364` (the `.acc-yellow` opener words, e.g. *"Professional Cleaning."*).
- CTA button fill: `linear-gradient(145deg, #2EE1EE 0%, #0CD7E5 45%, #0AA9C9 100%)` with a cyan glow shadow.

**Background (body):** layered soft radial glows + one linear wash:
`radial-gradient(80% 60% at 15% 10%, rgba(12,215,229,.18), transparent 55%), radial-gradient(70% 55% at 85% 25%, rgba(11,67,100,.16), transparent 55%), radial-gradient(90% 70% at 50% 95%, rgba(20,118,168,.14), transparent 60%), linear-gradient(160deg, #F6F7F9 0%, #F6F7F9 55%, #E6EDF3 100%)` (fixed attachment).

**Rule of thumb:** navy = trust & text authority; cyan = one highlighted keyword per heading + the CTA; yellow/amber is NOT part of the palette (the former `--acc-yellow` is now the navy wave, not literal yellow). Never introduce a third accent color into a section — keep it two-tone + neutrals.

---

## 3. Typography

| Role | Family | Weight | Size | Notes |
|------|--------|--------|------|-------|
| Brand wordmark | `Ultima` (Ultima.ttf / UltimaBold.ttf, self-hosted) | 400 / 700 | clamp(34px, 4.5vw, 44px) mark; wordmark follows | `@font-face`, `font-display: swap` |
| H1 hero | `Nunito` | 800 | clamp(~2.2rem, 6vw, 3.4rem), `line-height: 1.1`, `letter-spacing: -0.02em` | Split into `.hero-line` spans; gradient words per §2 |
| Section H2 | `Nunito` | 800 | clamp(1.9rem, 4vw, 2.5rem) | `letter-spacing: -0.02em`, color `--navy`, one `.star` word in `--cyan` |
| Section badge/kicker | `Nunito` | 600 | 0.8rem, uppercase, `letter-spacing: .04em` | Pill: `--cyan-soft` bg, `--navy` text, radius 999px |
| H3 / card title | `Nunito` | 700 | 1.1–1.25rem | |
| Body | `Nunito` | 400–600 | 1rem, `line-height: 1.6` | `--ink` |
| Sub/eyebrow | `Nunito` | 500–600 | 0.95–1rem | `--muted` |
| Price | `Nunito` | 800 | emphasize figure, "From ₹X" in `--cyan` / navy | |

**Stack:** `Nunito, -apple-system, sans-serif`. Load via Google Fonts (or self-host) for body + headings; Ultima is self-hosted for the lockup only. Never put long text in Ultima.

---

## 4. Spacing, radius, elevation

- **Spacing scale (in `rem`):** 4px `.25` · 8px `.5` · 12px `.75` · 16px `1` · 24px `1.5` · 32px `2` · 48px `3` · 64px `4` · 96px `6`.
  - Page/section vertical rhythm: ~**80–96px** between major sections on desktop, **~56–64px** on mobile.
  - Card padding: **24px**; tile/pill padding: **16px**.
  - Section inner max-width: **~1120px**, centered, gutter **clamp(16px, 4vw, 32px)**.
- **Radius:** `--radius: 16px` for cards/panels; **999px** for pills, badges, avatars, buttons with full-round ctas; **8px** for small inputs.
- **Elevation:** `--shadow: 0 10px 30px rgba(11,67,100,.12)` (default card). CTA glow: `0 8px 22px rgba(12,215,229,.32)` → hover `0 14px 34px rgba(12,215,229,.55)`.
- **Glassmorphism tokens:** `--glass-bg: rgba(255,255,255,.55)`, `--glass-bg-strong: rgba(255,255,255,.7)`, `--glass-border: 1px solid rgba(255,255,255,.65)`, `--glass-shadow: 0 12px 40px rgba(11,67,100,.14), inset 0 1px 0 rgba(255,255,255,.7)`, `--glass-backdrop: blur(18px) saturate(160%)`. Use for the header, menu panel, and floating quote panel.

---

## 5. Motion & feedback

Shared tokens (Emil Kowalski curves):

| Token | Value | Used for |
|-------|-------|----------|
| `--ease-out` | `cubic-bezier(0.23,1,0.32,1)` | Entrances, reveals |
| `--ease-in-out` | `cubic-bezier(0.77,0,0.175,1)` | Panel/dialog slides |
| `--dur-press` | 160ms | Button presses |
| `--dur-quick` | 220ms | Hovers, micro |
| `--dur-standard` | 300ms | Modals, reveals |

Patterns:
- **Reveal on scroll:** elements fade+rise (`opacity 0→1`, `translateY(14px)→0`) with `.reveal`, one-shot, `--ease-out`, `--dur-standard`. Never loop.
- **CTA pulse:** primary button pulses **twice then rests** calm (`ctaPulse 2.6s ease-in-out 2`), plus a slow sheen sweep (`ctaShine 6s`). Reads confident, not promo-y.
- **Gradient word wave:** hero accent words shimmer via animated background-position (`cyanWave 6s` / `navyWave 4.5s`).
- **Link/button hover:** pointer press; CTA lifts `translateY(-3px) scale(1.04)` + brighter glow; arrow icon slides `+4px`.
- **Never:** scroll-jack, auto-rotating carousels that control the user, parallax, marquee tickers (removed in commit dcf4409), or floating sticky WA/call buttons that appear on scroll (removed in 087fa4a — do NOT reintroduce).

---

## 6. Imagery direction

- **Photography:** real, honest, **in homes/businesses like the customer's** — clean, bright, slightly warm daylight (not studio-polished, not luxury-staged). Subjects: sparkling kitchens, gleaming bathrooms, deep-cleaned sofas/carpets, technicians in uniform + gloves/masks, spray + cloth. No gratuitous stock "chef/handshake" clichés.
- **Before/after is the hero proof asset.** Each result tile is a **vertical split or a tap-to-flip** showing same space, before (duller, cluttered, stained) vs after (bright, spotless). KEEP THE SAME CAMERA ANGLE on both frames. Land on a real `.webp` (compressed, 640–1280px). Couple each with a short label: `Bathroom & Toilet`, `Bathroom Floor`, `Kitchen`, `Sofa`, `Carpet`, `AC`, `Chimney`, `Commercial`, `Floor Tiles`.
- **Service tiles:** one square-ish `.webp` per service, `640×400`, `loading="lazy"`, with a label tag overlay. Consistent 3:2 crop.
- **Iconography:** thin-stroke line icons (viewBox 24, `stroke="currentColor"`, `stroke-width≈2`, square caps/joins) — matches the existing menu/footer icon style. Use for services, why-us cards, contact actions, and step markers. Prefer inline SVG for crispness.
- **Photos always softened against the calm bg:** card container with `--radius`, soft shadow, subtle glass on overlays. Avoid hard-edged imagery floating raw on the page.

---

## 7. Global chrome (every page)

- **Preloader:** brief brand mark (navy circle + cyan glow) that fades; skip on return visits for repeat loads (existing behavior).
- **Header / top bar:** always-visible **brand mark + "CleanNest" wordmark** (Ultima). A **menu button** opens a full-screen glass dialog panel (`role="dialog" aria-modal="true"`, Esc + close button, body scroll locked). Panel holds: Services, Results, Reviews, Pricing, FAQs, + a non-link note `Serving Jalandhar & nearby cities — 7 days a week`. Hide the hamburger while the sheet is open.
- **Primary CTA button style (`.btn-primary`):** cyan gradient fill, navy-dark text, rounded, glow, pulse-then-calm. Trigger: opens the multi-step quote modal (or `wa.me` link where no modal is needed).
- **Footer (all pages):** brand + tagline (Ultima / Nunito), action buttons `WhatsApp Us · Call Now · Email Us · Instagram`, contact info (`+91 76100 00654`, `cleannestclub@gmail.com`, Jalandhar, Punjab, `Open 7 days · 9 AM – 8 PM`), and `© 2026 CleanNest · All rights reserved`. Includes the promo line `10% OFF — code CLEAN10`.

---

## 8. Wireframe pack (low-fidelity)

Legend: `[CTA]` = primary Get-Free-Quote action (cyan button) · `WA/Wa` = WhatsApp button → `wa.me/917610000654` · `#` = anchor/id · boxes = layout zones · `⁄` = vertical divider. Mobile = single column stacking of the same zones.

### 8.1 Home — `index.html`

```
┌──────────────────────────────────────────────────────────────┐
│ [brand+CleanNest]                    (menu button)   ← topbar │
├──────────────────────────────────────────────────────────────┤
│ ◄ HERO (gradient bg soft navy/cyan glows)                   │
│   kicker: Jalandhar's Most Trusted Cleaning Service          │
│   H1: "Professional Cleaning." (navy wave)                   │
│       "Done Right." (cyan wave)                              │
│   sub: Premium deep cleaning for homes, offices & businesses │
│   [Get Free Quote →]  (primary CTA, pulse-then-calm)         │
│   [WhatsApp] [Call] [Instagram]   ← secondary contact row    │
│   trust: ★4.9 · Google Rating  ⁄  468 live ratings · Verified │
│                                                              │
│ ◄ SERVICES  badge:Our Services  sub:Tap a service...        │
│   [tile] [tile] [tile] [tile]        ← 8 image tiles, 4x2    │
│   [tile] [tile] [tile] [tile]        (labels over photos)    │
│                                                              │
│ ◄ RESULTS  badge:Results  H2:See the [Results]              │
│   before/after carousel (arrow nav)                          │
│   [b/a] [b/a] [b/a] [b/a]   ← tap → lightbox full image      │
│                                                              │
│ ◄ REVIEWS  H2:Google [Reviews]  ★4.9 + star row + 468 live   │
│   [card] [card] [card]  ← names + 5★ + quotes · See all →    │
│                                                              │
│ ◄ WHY US  badge:Why CleanNest  H2:Why choose [us]?          │
│   [Eco-safe] [Verified & trained] [Always on time]           │
│   [Honest pricing] [Free quote 50/50] [Covers your city]     │
│                                                              │
│ ◄ CITIES  Areas we cover: 12 city chips                      │
│ ◄ FAQ teaser  badge:FAQ  H2:Questions, [answered]           │
│   accordion (5 Q) · See all FAQs →                           │
│ ◄ PRICING  badge:Pricing  H2:Starting [prices]              │
│   [From ₹890] [From ₹2,490] ... (price list)                 │
│   Full-house tiers: 1/2/3/4 BHK ₹4,900/9,900/11,900/15,900    │
│   note: starting rates, vary; [Get Exact Quote →]            │
│                                                              │
│ ◄ CTA BAND (navy)  badge:Free Quote  H2:Ready for a [spotless │
│   home?]  sub 50/50   [Get Free Quote] [WhatsApp Us]         │
│   perks: free quote · no booking fee · 7 days 9AM-8PM        │
│   promo: 10% OFF — code CLEAN10                              │
│                                                              │
│ FOOTER (per §7)                                              │
└──────────────────────────────────────────────────────────────┘
```
*Note in build:* the H1 second line / gradient words use animated background-clip text per §2/§5 — never a third accent color.

### 8.2 About — `/about.html` (NEW)

```
┌──────────────────────────────────────────────────────────────┐
│ topbar (same)                                                │
│ HERO: H1 "Trusted by Jalandhar's homes and businesses."      │
│   sub: local, professional deep-cleaning team, 7 days/week   │
│ stats band: ★4.9  ⁄  468+ reviews  ⁄  12 cities  ⁄  7 days   │
│ [Get Free Quote →]  [WhatsApp]                               │
│                                                              │
│ STORY card (2-col: text + image of team/clean)               │
│ WHY US (reuse 6 cards from home)                             │
│ WHAT TO EXPECT (numbered step list: arrive→quote→products→   │
│   clean→check→pay remaining 50%)                             │
│ SERVICE AREAS (12 city chips) + map embed optional           │
│ CTA band: Ready for a spotless home? [CTA]                    │
│ FOOTER                                                        │
└──────────────────────────────────────────────────────────────┘
```

### 8.3 Services hub — `/services.html` (NEW)

```
┌──────────────────────────────────────────────────────────────┐
│ topbar                                                        │
│ HERO: H1 "Our Services"  sub "Professional deep cleaning for  │
│   every corner of your home and business."  [CTA]             │
│ 8 service cards (image + title + 1-line + From ₹ / Custom)    │
│   [Full House] [Kitchen] [Bathroom] [Sofa]                    │
│   [Carpet] [AC] [Chimney] [Commercial]                        │
│   each → its detail page                                      │
│ CTA band: Ready for a spotless space?  [CTA]                  │
│ FOOTER                                                        │
└──────────────────────────────────────────────────────────────┘
```

### 8.4 Service detail template (× 8, e.g. `full-house-deep-cleaning.html`)

```
┌──────────────────────────────────────────────────────────────┐
│ topbar  ·  breadcrumb: Services / Full House Deep Cleaning    │
│ HERO: H1 "Full House Deep Cleaning"  sub "A complete top-to-  │
│   bottom deep clean of ~your scope~."  [Get Exact Quote →]    │
│                                                              │
│ WHAT WE COVER  H2 "What we cover"   ← bullet list of surfaces │
│ BEFORE & AFTER  H2 "Before [&] After"  ← b/a slider/tiles     │
│ PRICE  H2 starting rate + tiers (full house: 1-4 BHK)        │
│ WHY CLEANNEST  ← trust strip (5 short items)                  │
│ FAQ (2-3 service-specific) · See all FAQs →                   │
│ CTA band: Ready for a spotless space?  [CTA]                  │
│ FOOTER                                                        │
└──────────────────────────────────────────────────────────────┘
```
Variants: keep layout identical; swap service name, scope bullets, one b/a image, and price lines. Custom-quote services (Carpet, Villa) show `Custom quote` instead of a tier table.

### 8.5 Pricing — `/pricing.html` (recommended NEW; or keep on home)

```
│ H1 "Starting prices"  sub "Honest starting rates — exact      │
│   quote free on WhatsApp."                                     │
│ price table: item | From ₹X  (per §3a list)                    │
│ full-house tiers: 1/2/3/4 BHK ₹4,900/9,900/11,900/15,900       │
│ note: starting rates vary by size & condition                   │
│ [Get Exact Quote →] at the end                                 │
```

### 8.6 FAQs — `/faqs.html`

```
│ H1 "Questions, answered"  sub/CTA                              │
│ category accordion: General · Pricing · Booking · Products ·   │
│   Cities · Each service                                        │
│ search field (optional) · See all FAQs handled per accordion   │
│ CTA band at bottom                                             │
```

### 8.7 Contact — `/contact.html` (NEW)

```
│ H1 "Let's get your space spotless."                            │
│ [WhatsApp Us (wa.me, prefilled)]  [Call tel:91...]  [IG]       │
│ contact card: phone / email cleannestclub@gmail.com /          │
│   address Shop 3, Wadala Rd, opp. Palm Royale Estate, GTB      │
│   Nagar, Green Model Town, Jalandhar 144001 · hours 7d 9-8     │
│ map embed + short lead form that builds a prefilled wa.me URL  │
```

### 8.8 Book — `/book.html` (NEW)

```
│ H1 "Book a clean in [5] steps"                                 │
│ steps: (1) Tap a service / tell us (2) free quote (3) pay 50%  │
│   to confirm (4) we clean (5) pay 50% after                    │
│ [Get Free Quote on WhatsApp]  [Call]                           │
```

### 8.9 Legal set — `/privacy.html`, `/terms.html`, `/refund.html` (NEW) & `/404.html` (NEW)

- Legal: calm single-column prose page — H1, updated date, short sections, no CTA band (link to Contact in footer).
- 404: centered brand mark, "We couldn't find that page" + [Go Home] + [WhatsApp].

---

## 9. Interaction & component library

- **Quote modal (the core converter).** A bottom sheet / centered glass panel (`role="dialog" aria-modal="true"`) with:
  - progress dots (`role="tablist"`), slide 0 = service multi-select (`What do you need cleaned? / Tap any service — pick more than one`), slide 1 = confirm + build a **prefilled** `wa.me/917610000654?text=...` message, then a `Request sent` state. Esc + overlay + close button. Body scroll locked while open. Back/forward respecting the step.
- **Menu sheet.** Full-screen glass panel (see §7). Keyboard: Esc closes, focus trap, `aria-label` on icon buttons.
- **Before/After.** Tap-to-flip or a drag slider between the two same-angle frames. Support keyboard (Enter/Space toggles). Only one auto-demo run; never auto-rotate forever.
- **Gallery lightbox.** Tapping a result tile opens the full image in a modal with label + close; arrow keys to navigate.
- **Reviews.** Static grid of real-name cards (5★ row + quote). Aggregate badge (★4.9 · 468 live ratings · Verified on Google) links to Google Maps.
- **FAQ accordion.** Expand/collapse with `aria-expanded`, gentle `--dur-standard` height transition; only one open at a time (or allow multiple, but keep consistent).
- **City chips.** Inline pill chips, wrap on mobile, `--cyan-soft` bg.
- **Buttons.** Primary (cyan gradient, navy-dark text) / secondary contact (outline or soft: WhatsApp/call/IG with icons) / text-link `→`. Consistent 48px touch targets.

---

## 10. Responsive & accessibility

- **Breakpoints:** base mobile (≤480) → 480–768 → 768–1024 → ≥1024. Grids collapse from multi-col to single col.
- **Touch targets** ≥44×44px; tap areas generous on mobile.
- **Focus:** visible custom focus ring (navy/cyan) on all interactive elements; not removed on hover.
- **Contrast:** `--ink`/`--muted` on white pass AA; ensure navy text on cyan-soft chips passes; keep CTA navy-dark text on cyan fill.
- **Reduced motion:** under `prefers-reduced-motion`, disable the gradient wave, pulse, sheen, and reveal animations; keep instant state changes.
- **Semantics:** one `<h1>` per page; landmarks (`header/main/footer`), list semantics for services/prices/cities, `alt` on all images, labels on inputs.
- **SEO/local:** keep canonical `www.cleannest.in`, schema.org `LocalBusiness` (rating + hours + areasServed) on home; `sitemap.xml`, `robots.txt`, `CNAME`. Preserve the WhatsApp number `+91 76100 00654` exactly.

---

## 11. Build handoff checklist (for the frontend child)

1. Reuse/adopt the existing tokens in `style.css` (navy/cyan/surface, glass, motion curves) as the canonical source; do not fork a second palette.
2. Emit the new pages as static HTML following the wireframes §8.2–§8.9.
3. Reconcile the README gap (README lists about/services/contact/book/privacy/terms/refund/404 that don't exist) — build the missing pages or fix README.
4. Reuse the quote modal + menu sheet + before/after + footer as shared components; keep copy from `CONTENT_ARCHITECTURE.md` verbatim.
5. Do NOT reintroduce: marquee ticker, scroll-appearing floating WA/call buttons, auto-rotating carousels, or a third accent color.
6. Verify: build → serve locally → check at 390/768/1280 widths → run an accessibility pass (labels, contrast, focus, reduced-motion) → push to `main`.
7. Every page ends near a WhatsApp/quote action; number `+91 76100 00654` appears on every page (footer/CTA).

---

## 12. Concurrency guard

`DESIGN_SYSTEM_WIREFRAMES.md` is the design source of truth. If another agent changes the palette/type/layout in `style.css` or `index.html` concurrently (this repo has shared access), re-read this doc + re-fetch `git pull` before finalizing any build. Design decisions must reconcile here, not in scattered one-off edits.
