# CleanNest — Reviews Section Optimize + Gallery Photo Cleanup

> **For Hermes:** Plan only. No execution, no commits. Implementer should follow the
> steps below and commit + push to `main` after each phase.

**Goal:** (1) Make the Reviews section on `index.html` take far less vertical space
while keeping the 4.9★ / 468 reviews proof and the 5 real testimonials visible;
(2) Remove any AI-generated / edited fake "before-after" images from the gallery
carousel and keep only genuine photos.

**Architecture:** Tighten existing CSS (no new components) for the Reviews block:
compress the heading→aggregate gap, shrink card padding/avatar, and (optional) turn the
5 cards into a 1-row horizontally-scrolling compact strip so the whole section fits in
~1 viewport. For photos: do NOT guess real-vs-fake from file bytes — confirm each
candidate with a human (the user) since the user is the one who knows what's real.

---

## Phase A — Reviews section: space optimization (safe, do now)

### Task A1: Tighten section + heading spacing
**Files:** `style.css` (`.reviews`, `.reviews-head`, `.reviews-title`, `.reviews-aggregate`)
- `.reviews` padding `64px 22px` → `44px 22px`.
- `.reviews-head` margin-bottom `24px` → `16px`.
- `.reviews-aggregate` margin-top `16px` → `10px`; padding `10px 20px` → `8px 16px`.

### Task A2: Compact review cards
**Files:** `style.css` (`.review-card`, `.review-top`, `.review-avatar`, `.review-text`, `.review-tag`)
- `.review-card` padding `26px 24px 22px` → `18px 18px 16px`; radius `24px` → `18px`.
- `.review-top` margin-bottom `14px` → `10px`.
- `.review-avatar` `44px` → `38px`.
- `.review-text` font-size `0.92rem`/`1.55` → `0.86rem`/`1.5`.
- `.review-tag` margin-top `14px` → `10px`.

### Task A3 (optional, recommended for "compact"): single-row scroll strip
**Files:** `style.css` (`.reviews-grid`); no HTML change needed
- Replace `grid auto-fit` with:
  ```css
  .reviews-grid {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: minmax(230px, 1fr);
    gap: 12px;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    padding-bottom: 6px;
    -webkit-overflow-scrolling: touch;
  }
  .review-card { scroll-snap-align: start; }
  ```
  This puts all 5 cards in ONE row that scrolls sideways on small screens, keeping
  essential info (name, stars, text, Google tag) fully visible. Reduces section height
  by ~one full card row.
- If user prefers NO scrolling: instead set `.reviews-grid` to
  `grid-template-columns: repeat(5, 1fr)` on desktop (≥900px), `repeat(2,1fr)` ≤640px,
  `repeat(3,1fr)` middle — a denser static grid.

### Task A4: Verify Reviews changes
- `python3 -m http.server` in repo root (or `file://`) → screenshot at 1440px and 390px.
- Confirm: 4.9★ + "468 verified reviews on Google" still shown; 5 cards visible;
  section height noticeably smaller than before (visually). No overlap, no clipped text.
- Bump cache-buster `style.css?v=167` → `?v=168` in `index.html` and `services.html`.
- Commit + push `main`.

---

## Phase B — Gallery photo cleanup (requires human confirmation)

**Current gallery images referenced in `index.html` (~line 207–482), each `<button class="gallery-card">`:**
1. toilet-bathroom.webp — Bathroom & Toilet
2. bathroom-floor-tiles.webp — Bathroom Floor
3. sink-vanity.webp — Sink & Vanity
4. pedestal-sink.webp — Washbasin
5. bathroom-taps.webp — Wall Tiles & Taps
6. living-room-floor.webp — Living Room
7. balcony-floor.webp — Balcony
8. kitchen-before-after.webp — Kitchen
9. real/real-58.webp — Sofa
10. real/real-56.webp — Carpet
11. ac-before-after.webp — AC
12. chimney-before-after.webp — Chimney
13. commercial-before-after.webp — Commercial
14. real/real-02.webp — Bathroom
15. real/real-05.webp — Shower
16. real/real-09.webp — Toilet
17. real/real-11.webp — Shower
18. real/real-13.webp — Bathtub
19. real/real-15.webp — Shower
20. real/real-17.webp — Shower
21. real/real-19.webp — Sink
22. real/real-21.webp — Vanity
23. real/real-23.webp — Vanity
24. real/real-25.webp — Bathtub
25. real/real-27.webp — Shower
26. real/real-29.webp — Shower
27. real/real-34.webp — Sink
28. real/real-38.webp — Shower
29. real/real-46.webp — Toilet
30. real/real-52.webp — Vanity
31. real/real-01.webp — Post Construction
32. real/real-04.webp — Floor Tiles
33. real/real-07.webp — Floor Tiles
34. real/real-31.webp — Floor Tiles
35. real/real-32.webp — Floor Tiles
36. real/real-36.webp — Marble
37. real/real-40.webp — Marble
38. real/real-42.webp — Floor Tiles
39. real/real-44.webp — Balcony Tiles
40. real/real-48.webp — Wall & Switch
41. real/real-50.webp — Floor Tiles
42. real/real-57.webp — Sofa Fabric
43. real/real-58.webp — Sofa (dup)
44. real/real-56.webp — Carpet (dup)

**Constraint / honesty note:** I cannot reliably distinguish a real photo from an
AI-generated/edited one by inspecting file bytes (the webp files have stripped EXIF and
ambiguous metadata substrings). Deleting customer photos on a guess is a destructive
mistake. Therefore the *only* safe path is for the user (who knows the real jobs) to
identify which of the 13 top-level `results/*.webp` (and any `real/*.webp`) are fake.

### Task B1: Get the fake-list from the user
- Ask the user to name the files (by label above) that are AI-generated/edited and must
  be removed. Provide the list above. Do NOT delete anything until confirmed.

### Task B2: Remove confirmed fakes + fix references
**Files:** `index.html` (delete the matching `<button class="gallery-card">…</button>`
blocks), and `rm` the file from `assets/img/results/`.
- For each confirmed fake: remove its `<button>` block (keep the surrounding
  `.gallery-track` intact) and delete the image file.
- Keep `<div class="gallery-slide">` wrappers consistent (removing a slide is fine).
- Recommend keeping at least 12–16 genuine images so the carousel still looks full.

### Task B3: Verify gallery
- Screenshot gallery on live + local: every remaining image loads (no broken `src`),
  lightbox still opens. Count slides == remaining images.

---

## Open questions / decisions needed from user
1. **Reviews layout:** scroll-strip (A3) vs denser static grid (A3 alt)? Default recommend scroll-strip.
2. **Photo fakes:** user must list which labels/files are fake (B1). I will not guess.
3. Any photos in `real/` that are also fake? User to flag.

## Files touched
- `index.html` (Reviews block 498–573; gallery 207–482; cache-buster 80/97)
- `style.css` (Reviews rules ~1024–1345; cache-buster ?v=168)
- `services.html` (cache-buster only)
- `assets/img/results/*.webp` (deletions per B1/B2)
