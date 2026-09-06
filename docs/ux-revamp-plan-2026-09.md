# CleanNest.in — UX/UI Revamp Action Plan (Sep 2026)

Audit basis: `~/Documents/GitHub/cleannest` (live source, HEAD `7060331`, byte-identical to cleannest.in). Brand locked: navy `#0B4364` / cyan `#0CD7E5` / off-white `#F6F7F9`, logo `assets/img/logo.svg`, "Jalandhar's most trusted cleaning service" messaging, eco-safe + transparent pricing focus, NO emojis, NO promo banners.

**Verdict up front:** the site is already modern (app-style, conversational 7-step quote, rate card, review counters, 24 keyframes, glassmorphism tokens, `prefers-reduced-motion` respected). Several items an earlier draft flagged as gaps are **already shipped** and are listed as VERIFIED-DONE below so we don't redo them. This plan targets the *genuine* remaining gaps only.

**Already shipped (verified on HEAD 7060331 — do NOT rebuild):**
- Persistent floating WhatsApp FAB `.wa-fab` (glass, bottom-right) in the shared shell.
- Hero `<img>` carries `fetchpriority="high"` (commit 111f470).
- `.btn:active{transform:scale(.96)}` press feedback present.
- `.svc-card:hover` lift + image zoom present.
- All 35 homepage images: `.webp`, real `width`+`height`, `loading="lazy"` (33), CLS-safe.
- Scroll-reveal `.reveal` system with stagger + 4s safety net.

---

## Priority map (P0 = do now, live impact; P1 = next; P2 = polish)

### P0-1 — Persistent mobile "Get Free Quote" CTA (top CX gap)
**Evidence:** `.wa-fab` (floating WhatsApp FAB) IS present — so mobile WhatsApp is covered. What's still missing is a **persistent Quote CTA** on mobile: the only quote trigger is the hero/topbar which scrolls away, and `#open-quote` buttons (7 refs) are in-section, not fixed. Requirement #1 explicitly demands a sticky booking CTA for mobile users.

**Fix — add a mobile-only sticky bar before `</body>` (and to all 20 generated service pages via `build_service_pages.py` shell tail):**
```html
<div class="stickybar" aria-label="Quick booking">
  <button class="btn btn-pri" id="open-quote" type="button" data-open-quote>Get Free Quote</button>
</div>
```
```css
.stickybar{position:fixed;left:0;right:0;bottom:0;z-index:60;display:flex;
  padding:12px 14px calc(12px + env(safe-area-inset-bottom));
  background:rgba(255,255,255,.92);backdrop-filter:blur(14px);
  border-top:1px solid var(--line);box-shadow:0 -6px 20px rgba(11,67,100,.08)}
.stickybar .btn{flex:1;justify-content:center;padding:14px;font-size:1rem}
@media(min-width:861px){.stickybar{display:none}}   /* desktop keeps header CTA */
body{padding-bottom:84px}                            /* under 861px, clear the bar */
```
Note: `.wa-fab` already floats above the bottom-right, so it won't collide — but keep the stickybar left-weighted so the FAB stays tappable. `#open-quote` + `data-open-quote` already exist → zero new JS.

### P0-2 — Real Before/After slider (currently a static lightbox)
**Evidence:** `#results` opens a lightbox showing ONE image; the "before" is the same file CSS-desaturated (`content/before-after.json` records `before = same file as after`). Requirement #3 wants an interactive reveal.
**Fix:** draggable clip-path slider (pointer + touch, ~30 lines — full component in `docs/mockup-revamp-2026-09.html`, works with `prefers-reduced-motion`). Content note: real pre-clean photos must be supplied by the owner; until then the desaturated stand-in looks intentional in a slider.

### P0-3 — Compress og-image.jpg (220 KB social-preview payload)
**Fix:** `sips -Z 1200 og-image.jpg` → re-export as `.jpg` q80 (~≤120 KB) or `cwebp` a `og-image.webp`. Keep file at `assets/img/og-image.jpg`, update og:meta only if dimensions change.

### P1-1 — Rate-card findability (requirement #5)
Add a "Full rate card" jump link in the quote panel's estimate slide and a `pricing.html#full-home` anchor row: `scroll-margin-top:90px` (header is sticky). Users land on cost in one tap, not three.

### P1-2 — Service-page hero images use browser-native lazy + explicit sizes (already 640×400 ✔) — add `fetchpriority="high"` to ONLY the homepage hero `<img>`.

### P2-1 — Remaining micro-interaction gaps (VERIFIED: press states + card lift already exist)
Confirmed shipped: `.btn:active{scale(.96)}`, `.svc-card:hover` lift + image zoom, 85+ transitions, 24 keyframes. What's still missing:
- WhatsApp FAB hover affordance: subtle green glow pulse on hover (`@keyframes waPulse`) — purely additive, no routing change.
- Quote-panel buttons: add `.btn:active` to the estimator's step buttons if not inherited.

### P2-2 — Hero upgrade (see mockup): add a supporting photo card + floating trust chips (Same-day booking, 400+ homes) to balance the text column; keeps rating + eco-safe trust strip visible above the fold. **No copy/brand changes** — same H1, same CTAs.

---

## Design trends applied (and why they fit the brand)
1. **Frosted-glass sticky bars** (backdrop blur) — already site-wide; extends to the new mobile CTA.
2. **Scroll-reveal with `--d` stagger** — existing `.reveal` system; cards get `style="--d:.06s"` increments.
3. **Real drag-affordance before/after** — the single most satisfying, honest trust demo for cleaning.
4. **Press-state feedback** (`transform:scale(.96)`) — instant tactile confirmation, zero distraction.
5. **Safe-area-aware sticky bottom bars** — `env(safe-area-inset-bottom)` for iPhone gesture bars.

## QA checklist (run before any push)
- `scripts/qa_check.py` (images resolve, phone +91 76100 00654 everywhere).
- `scripts/audit_seo.py` (canonical/sitemap/emoji) — expect all-PASS.
- `node --check` inline scripts EXCLUDING `application/ld+json` blocks.
- Grep live after deploy: `curl -s "https://cleannest.in/?cb=$(date +%s)" | grep -c stickybar` ≥1.
- Mobile flow test: 360px viewport → tap Get Free Quote → 7 steps → WhatsApp prefilled; phone validation `^[6-9]\d{9}$` still blocks invalid.
- Deploy via protected-branch dance: DELETE review-protection → push → PUT full protection back.

## Files touched per phase
| Phase | Files |
|---|---|
| P0 | `index.html`, `assets/css/style.css` (or root `style.css`), `build_service_pages.py` (stickybar into shell), `og-image.jpg` |
| P1 | `index.html` (quote estimate slide + anchor), `style.css` (scroll-margin) |
| P2 | `style.css` (press states, waPulse), `index.html` hero markup |

Mockup (interactive): `docs/mockup-revamp-2026-09.html`