# CleanNest Visual, Content, and Site-Structure Improvement Plan

> **For Hermes:** Use subagent-driven-development to implement this plan task-by-task. Run a specification review and then a visual/code-quality review after each phase.

**Goal:** Make cleannest.in feel like one trustworthy, proof-led local service brand, with a clearer conversion journey, consistent page templates, concise factual copy, and polished responsive presentation.

**Architecture:** Preserve the existing static GitHub Pages architecture and the current navy/cyan identity. Use `style.css` as the single visual source of truth, simplify `index.html` into a proof-led conversion sequence, and bring `services.html`, `pricing.html`, `areas-we-serve.html`, and `faqs.html` into the same shell before touching the long-tail service and city pages. Do not introduce a framework, runtime templating, new claims, or a second design system.

**Tech stack:** Static HTML, CSS, inline vanilla JavaScript, Python `unittest`, Playwright through `/Users/zyekr/scrapling-venv/bin/python`, GitHub Pages, protected `main` branch via pull request.

---

## Current context and assumptions

- Live source: `/Users/zyekr/cleannest-site`.
- Deployment repository: `https://github.com/zyekr0007-alt/cleannest`.
- `main` is protected; all work must use a feature branch and PR.
- The site currently has 42 root-level HTML pages: home, services, pricing, FAQ, areas hub, service pages, and city pages.
- The latest technical audit found no broken pages, internal links, or assets. Lighthouse after the first repair pass: Performance 75, Accessibility 100, Best Practices 100, SEO 100.
- The homepage visual system is already recognizable. This is a disciplined refinement, not a rebrand.
- Brand rules are fixed: navy `#0B4364`, cyan `#0CD7E5`, off-white background, no emojis, no promos or discount codes, real photos, WhatsApp-first conversion, and the canonical phone number `+91 76100 00654` / `917610000654`.
- Payment language must remain: 50% advance to confirm, 50% after service. Never say “no advance payment.”
- `build_service_pages.py` is stale and must not be run. It has previously clobbered real pages and created orphan slugs.
- `CONTENT_ARCHITECTURE.md` is stale: it documents an old 11-page site and still mentions the removed `CLEAN10` promotion. Updating it is part of this work.
- Claims requiring owner confirmation before strengthening or repeating them: `4.9 / 468` Google ratings, “verified and trained,” “uniformed,” “certified non-hazardous,” “eco-safe,” exact street address, and “most trusted.”

## Product and design direction

- **Audience:** homeowners, tenants, working families, local businesses, and NRIs arranging cleaning for family in Jalandhar and nearby towns.
- **Visitor mode:** Persuade. A visitor should identify the right service, see proof and an honest starting-price path, then open WhatsApp.
- **Structural thesis:** answer five questions in order: “Do you serve my need?” → “Can I trust the result?” → “What might it cost?” → “Do you serve my area?” → “How do I book?”
- **Visual thesis:** “clean proof, not decorative glass.” Keep the brand palette and soft surfaces, but reduce repeated cards, glows, and animations. Use one real before/after result as the signature visual moment.
- **Signature element:** a single hero proof card using an existing real result image with a restrained cyan dividing rule and a factual caption. Do not add stock imagery to the hero.
- **Typography:** retain Ultima for the wordmark and Nunito for display/body. Strengthen hierarchy through size, weight, width, and spacing instead of adding another font.
- **Target homepage sequence:** Header → Hero + proof → compact trust strip → Popular services → Results → Google reviews → Areas summary → four-question FAQ → final WhatsApp CTA → Footer.
- **Explicit anti-goals:** no redesign framework, no new app shell, no animated counters starting at zero, no generic “premium/luxury” copy, no fabricated testimonials, no extra pricing claims, no map on the homepage, no new legal/contact/about pages during this pass.

## Target wireframes

### Desktop

```text
┌────────────────────────────────────────────────────────────────────┐
│ CleanNest       Services Results Reviews Pricing Areas FAQs Quote │
├────────────────────────────────────────────────────────────────────┤
│ Local-service eyebrow        │ Real before/after proof             │
│ Professional Cleaning.       │ factual service caption             │
│ Done Right.                  │ 4.9 / review proof if confirmed     │
│ [Get Free Quote] [Results]   │                                     │
├────────────────────────────────────────────────────────────────────┤
│ Free quote in minutes | Starting rates shown | Open 7 days         │
├────────────────────────────────────────────────────────────────────┤
│ Popular services: 3 × 2 cards + All Services                       │
├────────────────────────────────────────────────────────────────────┤
│ Results carousel (primary proof)                                   │
├────────────────────────────────────────────────────────────────────┤
│ Google reviews: focused one-card carousel + Google links           │
├────────────────────────────────────────────────────────────────────┤
│ Areas summary                  │ Four common questions              │
├────────────────────────────────────────────────────────────────────┤
│ Final WhatsApp CTA                                                    │
├────────────────────────────────────────────────────────────────────┤
│ Compact footer                                                       │
└────────────────────────────────────────────────────────────────────┘
```

### Mobile

```text
CleanNest                                      Menu
Local-service eyebrow
Professional Cleaning.
Done Right.
Short supporting sentence
[Get Free Quote]
[View Results]
Real result proof card
Three trust facts
2-column popular services
Results carousel
One review at a time
Areas summary
Four FAQs
Final WhatsApp CTA
Compact footer
```

---

## Step-by-step implementation tasks

### Task 1: Create a clean working branch and record the baseline

**Objective:** Isolate the refinement and preserve reproducible before/after evidence.

**Files:**
- Create during execution: `.hermes/artifacts/visual-refresh/before/`
- Do not modify site files in this task.

**Steps:**

1. Run:
   ```bash
   cd /Users/zyekr/cleannest-site
   git status --short --branch
   git switch -c feat/visual-content-structure
   ```
   Expected before switching: `## main...origin/main` with no modified files.

2. Capture the current live Lighthouse baseline:
   ```bash
   npx --yes lighthouse https://cleannest.in/ \
     --output=json \
     --output-path=.hermes/artifacts/visual-refresh/before/lighthouse.json \
     --chrome-flags='--headless --no-sandbox' \
     --quiet
   ```
   Expected: exit code 0. Record the category scores in the PR body; do not promise identical rerun numbers because Lighthouse varies.

3. Capture screenshots at the three real target widths using the visual QA script added in Task 3 after it exists. Until then, retain the live screenshots from the prior audit as reference only.

4. No commit is required because only ignored `.hermes/artifacts/` evidence should be created.

---

### Task 2: Correct the content and product source of truth

**Objective:** Make the written architecture describe the actual 42-page site and prohibit stale claims and promotions.

**Files:**
- Modify: `CONTENT_ARCHITECTURE.md`

**Steps:**

1. Replace the stale site map in `CONTENT_ARCHITECTURE.md` with these page groups:
   ```markdown
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
   ```

2. Replace the old homepage specification with the target sequence in this plan.

3. Delete every recommendation or example containing `CLEAN10`, `10% OFF`, or other promotional language.

4. Add a “Claims register” section:
   ```markdown
   ## Claims register

   | Claim | Current value | Publication rule |
   |---|---:|---|
   | Google rating | 4.9 | Keep only while the live GBP shows 4.9 |
   | Google ratings/reviews | 468 | Confirm before changing or expanding placement |
   | Hours | 9 AM–8 PM, 7 days | Confirm with owner before changing |
   | Payment | 50% to confirm, 50% after service | Required wording |
   | Training/uniforms/product safety | Unconfirmed | Do not strengthen or add without owner evidence |
   | “Most trusted” | Unsupported superlative | Replace with factual local-service wording |
   ```

5. Verify the stale content is gone:
   ```bash
   python3 - <<'PY'
   from pathlib import Path
   text = Path('CONTENT_ARCHITECTURE.md').read_text()
   for forbidden in ('CLEAN10', '10% OFF', 'currently no hub page', 'Only index.html + 8 service pages'):
       assert forbidden not in text, forbidden
   print('PASS: content architecture is current')
   PY
   ```
   Expected: `PASS: content architecture is current`.

6. Commit:
   ```bash
   git add CONTENT_ARCHITECTURE.md
   git commit -m "docs: update CleanNest content architecture"
   ```

---

### Task 3: Add structural regression tests before changing the layout

**Objective:** Turn the desired hierarchy and brand constraints into tests that initially expose the current gaps.

**Files:**
- Create: `tests/test_site_design.py`
- Create: `scripts/visual_qa.py`

**Step 1: Write the failing structural test**

Create `tests/test_site_design.py` with:

```python
from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]
CORE = ["index.html", "services.html", "pricing.html", "areas-we-serve.html", "faqs.html"]
FORBIDDEN = ("CLEAN10", "10% OFF", "no advance payment", "most trusted")
EMOJI = re.compile(r"[\U0001F300-\U0001FAFF\uFE0F]")


class SiteDesignTests(unittest.TestCase):
    def text(self, name):
        return (ROOT / name).read_text(encoding="utf-8")

    def test_core_pages_have_one_h1_and_shared_stylesheet(self):
        for name in CORE:
            html = self.text(name)
            self.assertEqual(len(re.findall(r"<h1\b", html, re.I)), 1, name)
            self.assertRegex(html, r'href="style\.css\?v=\d+"', name)

    def test_homepage_section_order(self):
        html = self.text("index.html")
        markers = [
            'id="home"', 'id="trust-strip"', 'id="services"', 'id="results"',
            'id="reviews"', 'id="cities"', 'id="faq"', 'id="final-cta"'
        ]
        positions = [html.index(marker) for marker in markers]
        self.assertEqual(positions, sorted(positions))

    def test_homepage_has_single_primary_h1(self):
        html = self.text("index.html")
        self.assertEqual(len(re.findall(r"<h1\b", html, re.I)), 1)
        self.assertIn("Professional", html)
        self.assertIn("Done Right", html)

    def test_no_forbidden_copy_or_emoji(self):
        for path in list(ROOT.glob("*.html")) + [ROOT / "CONTENT_ARCHITECTURE.md"]:
            text = path.read_text(encoding="utf-8")
            lower = text.lower()
            for phrase in FORBIDDEN:
                self.assertNotIn(phrase.lower(), lower, f"{path.name}: {phrase}")
            self.assertIsNone(EMOJI.search(text), path.name)

    def test_phone_and_whatsapp_number_are_canonical(self):
        for path in ROOT.glob("*.html"):
            html = path.read_text(encoding="utf-8")
            for number in re.findall(r"wa\.me/(\d+)", html):
                self.assertEqual(number, "917610000654", path.name)
            for number in re.findall(r"tel:([^\"']+)", html):
                self.assertEqual(re.sub(r"\D", "", number), "917610000654", path.name)

    def test_pricing_uses_shared_design_system(self):
        html = self.text("pricing.html")
        self.assertRegex(html, r'href="style\.css\?v=\d+"')
        self.assertNotIn("<style>\n:root{", html)


if __name__ == "__main__":
    unittest.main()
```

**Step 2: Run it to verify failure**

```bash
python3 -m unittest tests/test_site_design.py -v
```

Expected initial failures:
- missing `trust-strip` and/or `final-cta` on `index.html`;
- `pricing.html` does not use `style.css`;
- stale “most trusted” copy remains.

Do not weaken the tests to match the existing site.

**Step 3: Add the visual QA script**

Create `scripts/visual_qa.py` with:

```python
from pathlib import Path
import json
import os
from playwright.sync_api import sync_playwright

BASE = os.environ.get("CN_QA_URL", "http://127.0.0.1:8833/")
OUT = Path(".hermes/artifacts/visual-refresh/current")
OUT.mkdir(parents=True, exist_ok=True)
results = []

with sync_playwright() as pw:
    browser = pw.chromium.launch(
        headless=True,
        executable_path="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    )
    for name, width, height in (("desktop", 1440, 900), ("scaled-mac", 782, 1000), ("mobile", 390, 844)):
        context = browser.new_context(
            viewport={"width": width, "height": height}, reduced_motion="reduce"
        )
        page = context.new_page()
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.on("console", lambda msg: errors.append(msg.text) if msg.type == "error" else None)
        response = page.goto(BASE, wait_until="domcontentloaded", timeout=30000)
        page.wait_for_timeout(2500)
        page.evaluate("""async () => {
            for (const el of document.querySelectorAll('section, footer')) {
                el.scrollIntoView({block: 'center'});
                await new Promise(resolve => setTimeout(resolve, 80));
            }
            scrollTo(0, 0);
        }""")
        metrics = page.evaluate("""() => ({
            status: document.readyState,
            viewport: innerWidth,
            scrollXAfterProbe: (scrollTo(1000, 0), scrollX),
            hiddenReveals: [...document.querySelectorAll('.reveal')]
                .filter(el => getComputedStyle(el).opacity === '0').length,
            brokenImages: [...document.images]
                .filter(img => img.complete && img.naturalWidth === 0 && !img.src.startsWith('data:'))
                .map(img => img.src),
            h1Count: document.querySelectorAll('h1').length,
        })""")
        page.evaluate("scrollTo(0, 0)")
        screenshot = OUT / f"home-{name}.jpg"
        page.screenshot(path=str(screenshot), type="jpeg", quality=82)
        results.append({
            "name": name,
            "http": response.status if response else 0,
            "errors": errors,
            "metrics": metrics,
            "screenshot": str(screenshot),
        })
        context.close()
    browser.close()

(OUT / "results.json").write_text(json.dumps(results, indent=2))
for result in results:
    assert result["http"] == 200, result
    assert result["errors"] == [], result
    assert result["metrics"]["scrollXAfterProbe"] == 0, result
    assert result["metrics"]["hiddenReveals"] == 0, result
    assert result["metrics"]["brokenImages"] == [], result
    assert result["metrics"]["h1Count"] == 1, result
print("PASS: 3 responsive viewports")
```

**Step 4: Commit the test scaffold**

```bash
git add tests/test_site_design.py scripts/visual_qa.py
git commit -m "test: add design and responsive QA gates"
```

---

### Task 4: Clarify the homepage hero copy and actions

**Objective:** Make the first viewport immediately answer what CleanNest does, where it operates, and what to do next.

**Files:**
- Modify: `index.html:128-164`

**Step 1: Add a failing assertion**

Add to `test_homepage_has_single_primary_h1`:

```python
self.assertIn("Home and commercial deep cleaning in Jalandhar", html)
self.assertIn('href="#results"', html)
```

Run:
```bash
python3 -m unittest tests.test_site_design.SiteDesignTests.test_homepage_has_single_primary_h1 -v
```
Expected: FAIL because the eyebrow and secondary result link are absent.

**Step 2: Replace only `.hero-copy` with this block**

```html
<div class="hero-copy">
  <p class="hero-eyebrow reveal">Home and commercial deep cleaning in Jalandhar</p>
  <h1 class="hero-title">
    <span class="hero-line reveal">Professional Cleaning.</span>
    <span class="hero-line reveal"><span class="accent">Done Right.</span></span>
  </h1>
  <p class="hero-sub reveal">Choose the service you need, see real results, and get a free quote on WhatsApp.</p>
  <div class="hero-ctas reveal">
    <button class="btn btn-primary btn-quote" id="open-quote" type="button" data-open-quote>Get Free Quote <span class="btn-icon" aria-hidden="true">→</span></button>
    <a class="btn btn-secondary" href="#results">View Real Results</a>
  </div>
</div>
```

Do not change the quote-panel behavior or WhatsApp URL.

**Step 3: Run the focused test**

Expected: PASS.

**Step 4: Commit**

```bash
git add index.html tests/test_site_design.py
git commit -m "refactor: clarify homepage hero journey"
```

---

### Task 5: Add one proof-led hero visual without adding new assets

**Objective:** Replace abstract empty space with credible evidence from a real CleanNest result.

**Files:**
- Modify: `index.html:141-162`
- Modify: `style.css`

**Step 1: Add a failing test**

```python
def test_homepage_hero_uses_real_result_proof(self):
    html = self.text("index.html")
    self.assertIn('class="hero-proof-card"', html)
    self.assertIn('assets/img/results/sink-vanity.webp', html)
    self.assertIn('width="640" height="640"', html)
```

Expected: FAIL.

**Step 2: Replace `.hero-aside` with this complete block**

```html
<div class="hero-aside">
  <figure class="hero-proof-card reveal">
    <img src="assets/img/results/sink-vanity.webp" alt="Sink vanity before and after professional cleaning by CleanNest" width="640" height="640">
    <figcaption>
      <span class="proof-kicker">Real CleanNest result</span>
      <span class="proof-title">Bathroom vanity deep clean</span>
    </figcaption>
  </figure>
  <a class="hero-rating reveal" href="https://www.google.com/maps/place/?q=place_id:ChIJ1zZzOUtbaR4RXbMy1OZsKsI" target="_blank" rel="noopener" aria-label="4.9 Google Rating, 468 live ratings, verified on Google — see our reviews">
    <span class="hr-cell"><span class="hr-top"><span class="hr-num" data-count="4.9" data-decimals="1">4.9</span></span><span class="hr-label">Google rating</span></span>
    <span class="hr-divider" aria-hidden="true"></span>
    <span class="hr-cell"><span class="hr-top"><span class="hr-count"><span data-count="468">468</span> ratings</span></span><span class="hr-label">View on Google</span></span>
    <span class="hr-arrow" aria-hidden="true">→</span>
  </a>
</div>
```

If the owner cannot confirm `4.9 / 468`, replace the rating card with “Read our Google reviews” and remove the numbers from visible copy and `aggregateRating` schema in the same commit.

**Step 3: Append the minimum CSS**

```css
.hero-proof-card {
  position: relative;
  width: min(100%, 520px);
  margin: 0;
  overflow: hidden;
  border: 1px solid rgba(11, 67, 100, 0.12);
  border-radius: 24px;
  background: var(--card);
  box-shadow: 0 24px 64px rgba(11, 67, 100, 0.16);
}
.hero-proof-card img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 1;
  object-fit: cover;
}
.hero-proof-card::after {
  content: "";
  position: absolute;
  inset: 0 auto 0 50%;
  width: 2px;
  background: rgba(12, 215, 229, 0.88);
  pointer-events: none;
}
.hero-proof-card figcaption {
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: 16px;
  display: grid;
  gap: 2px;
  padding: 12px 14px;
  border: 1px solid rgba(255, 255, 255, 0.72);
  border-radius: 14px;
  color: var(--navy-deep);
  background: rgba(255, 255, 255, 0.86);
  backdrop-filter: blur(14px);
}
.proof-kicker { color: var(--muted); font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; }
.proof-title { font-size: 1rem; font-weight: 800; }
@media (max-width: 767px) {
  .hero-proof-card { width: 100%; border-radius: 20px; }
}
```

**Step 4: Run tests and visual QA**

```bash
python3 -m unittest tests/test_site_design.py -v
python3 -m http.server 8833 --bind 127.0.0.1
# In a second shell:
CN_QA_URL=http://127.0.0.1:8833/ /Users/zyekr/scrapling-venv/bin/python scripts/visual_qa.py
```

Expected: tests pass except failures reserved for later tasks; visual script prints `PASS: 3 responsive viewports`. Inspect all three screenshots before committing. The hero image must not push the primary CTA below the first mobile viewport.

**Step 5: Commit**

```bash
git add index.html style.css tests/test_site_design.py
git commit -m "feat: add proof-led homepage hero"
```

---

### Task 6: Replace the standalone Why section with a compact trust strip

**Objective:** Reduce homepage length and card repetition while keeping the useful reassurance.

**Files:**
- Modify: `index.html`
- Modify: `style.css`

**Step 1: Add a failing test**

```python
def test_homepage_uses_compact_trust_strip(self):
    html = self.text("index.html")
    self.assertIn('id="trust-strip"', html)
    self.assertNotIn('<section class="about" id="about">', html)
```

Expected: FAIL.

**Step 2: Insert immediately after `</main>`**

```html
<section class="trust-strip" id="trust-strip" aria-label="Why choose CleanNest">
  <div class="trust-strip-inner">
    <span><strong>Free quote</strong><small>Confirmed on WhatsApp</small></span>
    <span><strong>Starting rates shown</strong><small>Exact price before booking</small></span>
    <span><strong>Open 7 days</strong><small>9 AM–8 PM</small></span>
  </div>
</section>
```

Delete the standalone `<section class="about" id="about">…</section>`. Preserve any still-valid unique statement by moving at most one sentence into the services or final CTA copy. Do not retain six mini-cards elsewhere.

**Step 3: Add restrained CSS**

```css
.trust-strip { padding: 0 22px 28px; }
.trust-strip-inner {
  width: min(100%, 1200px);
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border-block: 1px solid rgba(11, 67, 100, 0.13);
}
.trust-strip-inner > span { display: grid; gap: 2px; padding: 18px 22px; }
.trust-strip-inner > span + span { border-left: 1px solid rgba(11, 67, 100, 0.13); }
.trust-strip strong { color: var(--navy); font-size: 0.96rem; }
.trust-strip small { color: var(--muted); font-size: 0.82rem; }
@media (max-width: 640px) {
  .trust-strip-inner { grid-template-columns: 1fr; }
  .trust-strip-inner > span + span { border-left: 0; border-top: 1px solid rgba(11, 67, 100, 0.13); }
}
```

**Step 4: Run tests, visual QA, and commit**

Expected: the trust-strip test passes; no new horizontal scrolling at 390 or 782 pixels.

```bash
git add index.html style.css tests/test_site_design.py
git commit -m "refactor: compress homepage trust content"
```

---

### Task 7: Normalize section rhythm and reduce card-soup styling

**Objective:** Make the homepage scan as a deliberate sequence rather than a stack of unrelated widgets.

**Files:**
- Modify: `style.css`

**Step 1: Add a CSS-contract test**

```python
def test_shared_section_rhythm_tokens_exist(self):
    css = self.text("style.css")
    for token in ("--section-space", "--content-wide", "--content-reading"):
        self.assertIn(token, css)
```

Expected: FAIL.

**Step 2: Add these tokens to `:root`**

```css
--section-space: clamp(64px, 8vw, 112px);
--content-wide: 1200px;
--content-reading: 760px;
--line: rgba(11, 67, 100, 0.13);
```

**Step 3: Consolidate section geometry**

Append one authoritative block near the end of `style.css`, then remove older declarations only after computed-style parity is verified:

```css
.services, .gallery, .reviews, .cities, .faqs, .cta-band {
  width: min(100%, var(--content-wide));
  margin-inline: auto;
  padding: var(--section-space) clamp(20px, 4vw, 48px);
}
.section-head, .reviews-head {
  max-width: var(--content-reading);
  margin: 0 auto clamp(28px, 4vw, 48px);
  text-align: center;
}
.section-title, .reviews-title {
  max-width: 18ch;
  margin-inline: auto;
  font-size: clamp(1.9rem, 4vw, 3rem);
  line-height: 1.08;
  letter-spacing: -0.035em;
}
```

Keep glass effects only on the menu, quote panel, hero proof caption, and floating actions. Service cards, FAQ rows, area chips, and reviews should use solid white/off-white surfaces with one border and one shadow level.

**Step 4: Verify at breakpoint edges**

Run the visual script at 390, 782, and 1440. Add temporary manual checks at 640, 641, 767, 768, 1023, and 1024 before commit. Expected: no section changes width abruptly enough to create a visible jump or overflow.

**Step 5: Commit**

```bash
git add style.css tests/test_site_design.py
git commit -m "style: unify homepage rhythm and surfaces"
```

---

### Task 8: Refine service cards around outcomes and price paths

**Objective:** Help visitors choose quickly without turning the grid into a catalogue wall.

**Files:**
- Modify: `index.html:168-210`
- Modify: `services.html:132-307`
- Modify: `style.css`

**Rules:**

- Homepage: six popular services plus one “View all services” card.
- Each homepage card: real image, service name, one short outcome, and “From ₹X” only when the rate already exists in `pricing.html`.
- `services.html`: preserve all 20 services, grouped under Home, Upholstery, Appliances, Floors/Exterior, and Commercial/Specialized headings.
- Do not invent prices for custom-quote services.
- Entire cards remain links; avoid nested buttons.

**Step 1: Write failing assertions**

```python
def test_homepage_service_grid_is_curated(self):
    html = self.text("index.html")
    block = html[html.index('id="services"'):html.index('id="results"')]
    self.assertEqual(block.count('class="service-tile"'), 6)
    self.assertEqual(block.count('class="service-tile-all"'), 1)
```

Expected: FAIL if the current number differs.

**Step 2: Use this card anatomy consistently**

```html
<a class="service-tile" href="bathroom-deep-cleaning.html">
  <img src="assets/img/services/bathroom-deep-cleaning.webp" alt="Professional bathroom deep cleaning" width="640" height="400" loading="lazy">
  <span class="service-card-body">
    <strong>Bathroom Deep Cleaning</strong>
    <small>Descaling, fixtures, floor and hard-to-reach buildup.</small>
    <span class="service-card-meta">From ₹890 <span aria-hidden="true">→</span></span>
  </span>
</a>
```

**Step 3: Apply the same hierarchy to all homepage cards and category headings to `services.html`.**

**Step 4: Run tests and visual QA.**

Expected: two columns at 390 pixels, three columns at 782 pixels, and three or four balanced columns at 1440 pixels; all card titles remain readable without overlaying photos.

**Step 5: Commit**

```bash
git add index.html services.html style.css tests/test_site_design.py
git commit -m "refactor: make service selection clearer"
```

---

### Task 9: Make Results the site’s primary visual proof

**Objective:** Improve gallery comprehension without adding another carousel or decorative effect.

**Files:**
- Modify: `index.html:212-309`
- Modify: `style.css`

**Steps:**

1. Change the intro to:
   ```html
   <span class="section-badge">Real work</span>
   <h2 class="section-title">Results you can inspect</h2>
   <p class="section-sub">Tap any CleanNest job to view the full before-and-after result.</p>
   ```

2. Preserve all current real images, lightbox behavior, keyboard controls, dimensions, and alt text.

3. Remove any auto-advance when `prefers-reduced-motion: reduce` is active. Preserve swipe and dot navigation.

4. Ensure controls have minimum 44×44-pixel hit areas without visually inflating the dots.

5. Run:
   ```bash
   python3 -m unittest tests/test_site_design.py -v
   CN_QA_URL=http://127.0.0.1:8833/ /Users/zyekr/scrapling-venv/bin/python scripts/visual_qa.py
   ```
   Expected: PASS; no hidden gallery images and no horizontal page scrolling.

6. Commit:
   ```bash
   git add index.html style.css
   git commit -m "style: strengthen real-results proof"
   ```

---

### Task 10: Simplify reviews and remove unsupported wording

**Objective:** Make the review section credible and easier to scan.

**Files:**
- Modify: `index.html:311-390`
- Modify: `style.css`

**Steps:**

1. Keep the five current named review cards and both Google links.
2. Show one review at a time below 1024 pixels and two cards at a time at 1024 pixels and above.
3. Replace “live ratings” with “Google ratings” or “Google reviews,” matching what the linked Google Business Profile actually labels.
4. Keep the numeric aggregate only after owner confirmation. If unconfirmed, use the non-numeric heading “Read our Google reviews.”
5. Do not add “verified customer” badges unless Google visibly supplies that status.
6. Run Lighthouse accessibility locally. Expected: Accessibility 100 and no `label-content-name-mismatch` or `aria-required-children` failure.
7. Commit:
   ```bash
   git add index.html style.css
   git commit -m "refactor: simplify review proof"
   ```

---

### Task 11: Rebuild pricing.html on the shared visual system

**Objective:** Remove the visually separate inline pricing theme and make pricing feel native to CleanNest.

**Files:**
- Modify: `pricing.html`
- Modify: `style.css`
- Modify: `tests/test_site_design.py`

**Step 1: Run the already-failing pricing test**

```bash
python3 -m unittest tests.test_site_design.SiteDesignTests.test_pricing_uses_shared_design_system -v
```
Expected: FAIL.

**Step 2: Preserve before editing**

Preserve exactly: title, meta description, canonical, Open Graph tags, Service JSON-LD, every published rate, “starting rates” disclaimer, WhatsApp link, Instagram link, directions link, email, and footer.

**Step 3: Replace the inline page-specific `:root`, reset, body, and table theme with:**

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="style.css?v=194">
```

Use the same `.brand-strip`, `.desk-nav`, mobile menu, and `.footer` markup as `index.html`; keep one H1.

**Step 4: Move pricing-only styles into one scoped block in `style.css`**

All selectors must begin with `.pricing-page`:

```css
.pricing-page { width: min(100%, 1100px); margin: 0 auto; padding: 140px 22px var(--section-space); }
.pricing-page .pricing-intro { max-width: 720px; margin: 0 auto 48px; text-align: center; }
.pricing-page .price-group { margin-top: 36px; }
.pricing-page .price-table { overflow: hidden; border: 1px solid var(--line); border-radius: 18px; background: var(--card); }
.pricing-page .price-row { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(0, 1.2fr) minmax(120px, .7fr); border-top: 1px solid var(--line); }
.pricing-page .price-row > * { padding: 16px 18px; }
@media (max-width: 700px) {
  .pricing-page .price-table-head { display: none; }
  .pricing-page .price-row { grid-template-columns: 1fr; padding: 16px; }
  .pricing-page .price-row > * { padding: 3px 0; }
}
```

Use existing class names if practical; do not rewrite all price data merely to match this example.

**Step 5: Run tests**

Expected: `test_pricing_uses_shared_design_system` passes, all rates remain byte-for-byte present, and JSON-LD parses.

**Step 6: Commit**

```bash
git add pricing.html style.css tests/test_site_design.py
git commit -m "style: unify pricing with CleanNest design system"
```

---

### Task 12: Clarify the Areas and FAQ hubs

**Objective:** Turn two dense utility pages into easy decision-support pages without adding features.

**Files:**
- Modify: `areas-we-serve.html`
- Modify: `faqs.html`
- Modify: `style.css`

**Areas rules:**

- Lead with Jalandhar as the primary market.
- Show nearby towns in a clean linked grid.
- Preserve each real city link and unique city content.
- Remove repeated locality walls from the visual page if they are already present in page copy or schema; do not remove crawlable city names entirely.
- Add one sentence explaining that availability depends on the job and location, with WhatsApp as the confirmation path.

**FAQ rules:**

- Keep four groups: Booking & Quotes, Services & Pricing, Care & Safety, Areas & Good to Know.
- Put “How payment works” and “How to get a quote” first.
- Make the answer wording consistent with the 50/50 payment rule.
- Replace unconfirmed safety claims with neutral wording pending owner confirmation.
- Do not add FAQ search; the page is not large enough to justify it.

**Verification:**

```bash
python3 -m unittest tests/test_site_design.py -v
```

Add focused assertions that all 14 area links still exist and that `faqs.html` contains `50%` at least twice: visible copy and FAQ JSON-LD. Expected: PASS.

**Commit:**

```bash
git add areas-we-serve.html faqs.html style.css tests/test_site_design.py
git commit -m "refactor: clarify areas and FAQ hubs"
```

---

### Task 13: Standardize service-page information order without running the stale generator

**Objective:** Make every service page answer the same customer questions in the same order while preserving unique SEO copy.

**Files:**
- Modify manually: the 20 service HTML pages listed in `sitemap.xml`
- Modify: `style.css`
- Modify: `tests/test_site_design.py`
- Do not run: `build_service_pages.py`

**Required sequence on every non-redirect service page:**

```text
Service hero: service name + one concrete outcome + Get Free Quote
What is included
Who this is for / when to book
Real result image or service photo
Starting-price path or Custom quote
Service-specific FAQs
Final WhatsApp CTA
Shared footer
```

**TDD steps:**

1. Add a service-page list to `tests/test_site_design.py` from `sitemap.xml`, excluding city pages, hubs, and the four legacy aliases.
2. Assert each service page contains one H1, a `Service` JSON-LD object, `data-open-quote` or a canonical WhatsApp CTA, a footer, and at least two FAQ items.
3. Run and record the exact failing pages.
4. Fix one page family at a time: four established deep/dry-cleaning pages, recurring cleaning, then the newer specialized pages.
5. Re-run after each family; never perform a blind site-wide string replacement.
6. Commit each family separately, for example:
   ```bash
   git add full-house-deep-cleaning.html kitchen-deep-cleaning.html bathroom-deep-cleaning.html sofa-dry-cleaning.html
   git commit -m "refactor: standardize core service journeys"
   ```

**Acceptance:** unique titles, descriptions, canonicals, service names, scopes, and FAQs remain unique. No service page receives a price not already present in `pricing.html`.

---

### Task 14: Improve city pages without creating doorway-page duplication

**Objective:** Make city pages locally useful instead of near-identical SEO shells.

**Files:**
- Modify manually: `adampur.html`, `banga.html`, `dasuya.html`, `goraya.html`, `hariana.html`, `hoshiarpur.html`, `kapurthala.html`, `kartarpur.html`, `nakodar.html`, `nawanshahr.html`, `phagwara.html`, `phillaur.html`, `sultanpur-lodhi.html`
- Modify: `tests/test_site_design.py`

**Required city-page content:**

- H1: `Professional Cleaning Services in [City]`.
- One unique 60–100-word intro grounded in the city, travel area, and services actually offered.
- Six popular service links.
- A short availability note: exact coverage confirmed on WhatsApp.
- Two genuinely local FAQs; do not manufacture neighborhood names.
- One primary WhatsApp CTA with the city prefilled.

**TDD:**

1. Assert each city appears in its title, H1, canonical URL, Service schema, visible CTA text, and WhatsApp message.
2. Add a similarity guard using normalized paragraph text; fail if two city intros are identical.
3. Run to identify current failures.
4. Edit one city per commit or one small geographic group per commit.
5. Re-run after every group.

**Risk rule:** if no real local detail is available, keep the copy concise and factual rather than inventing local landmarks or travel claims.

---

### Task 15: Add the final CTA and remove duplicated conversion controls

**Objective:** Finish every homepage journey with one clear choice rather than competing buttons.

**Files:**
- Modify: `index.html`
- Modify: `style.css`

**Markup:**

```html
<section class="final-cta" id="final-cta">
  <div class="final-cta-inner">
    <p class="section-badge">Free quote</p>
    <h2>Tell us what needs cleaning.</h2>
    <p>Choose your service and send the request on WhatsApp. We will confirm the scope, exact price, and available time.</p>
    <button class="btn btn-primary" type="button" data-open-quote>Get Free Quote</button>
    <small>50% to confirm the booking. The remaining 50% is due after service.</small>
  </div>
</section>
```

Remove any adjacent duplicate WhatsApp and quote buttons that perform the same action. Keep direct WhatsApp, Call, Email, Instagram, and Directions actions in the footer.

**Verification:** homepage-section-order test passes; keyboard focus opens the existing quote panel; generated WhatsApp message still contains the selected service.

**Commit:**

```bash
git add index.html style.css
git commit -m "refactor: focus the final quote action"
```

---

### Task 16: Remove dead CSS only after the new design is stable

**Objective:** Recover performance without changing appearance late in the project.

**Files:**
- Modify: `style.css`

**Steps:**

1. Run Lighthouse and record `unused-css-rules`. Baseline from the prior audit was approximately 14 KiB of unused CSS on the homepage.
2. Search each candidate selector across all 42 HTML pages before removing it. A selector unused on the homepage may still support a service or city page.
3. Remove only selectors with zero repository references or selectors explicitly replaced in Tasks 5–12.
4. Run the complete test suite and visual QA after each removal batch.
5. Stop after one bounded cleanup pass; do not chase a perfect Lighthouse score.
6. Commit:
   ```bash
   git add style.css
   git commit -m "perf: remove superseded visual styles"
   ```

**Acceptance:** no screenshot regression, no broken responsive behavior, and Performance must not fall below the pre-change live baseline of 75 in two consecutive Lighthouse runs.

---

### Task 17: Final full-site validation

**Objective:** Prove visual, functional, content, and technical integrity before opening the PR.

**Files:**
- Verification only; fix defects in the file that owns them.

**Commands and expected results:**

1. Structural tests:
   ```bash
   python3 -m unittest tests/test_site_design.py -v
   ```
   Expected: all tests pass.

2. Existing repository QA script created during the prior audit, if promoted into the repo; otherwise use the new unittest suite plus sitemap/link checks. Required assertions:
   - 42 root HTML pages;
   - 42 sitemap URLs;
   - one canonical per page;
   - valid JSON-LD;
   - no missing image files;
   - no internal 404s;
   - no emojis or promo remnants;
   - one WhatsApp and telephone number variant.

3. Inline JavaScript syntax:
   ```bash
   python3 - <<'PY'
   from pathlib import Path
   import re, subprocess, tempfile
   for page in Path('.').glob('*.html'):
       html = page.read_text()
       scripts = re.findall(r'<script(?![^>]+src=)[^>]*>(.*?)</script>', html, re.S)
       for i, script in enumerate(scripts):
           if 'application/ld+json' in html[max(0, html.find(script)-100):html.find(script)]:
               continue
           path = Path(tempfile.gettempdir()) / f'{page.stem}-{i}.js'
           path.write_text(script)
           subprocess.run(['node', '--check', str(path)], check=True)
   print('PASS: inline JavaScript syntax')
   PY
   ```
   Expected: `PASS: inline JavaScript syntax`.

4. Responsive visual QA:
   ```bash
   python3 -m http.server 8833 --bind 127.0.0.1
   CN_QA_URL=http://127.0.0.1:8833/ /Users/zyekr/scrapling-venv/bin/python scripts/visual_qa.py
   ```
   Expected: `PASS: 3 responsive viewports`.

5. Manual screenshot review checklist:
   - 390 px: CTA and hero proof appear without overlap; service grid is readable; no input zoom.
   - 782 px: desktop-scale typography remains active; no cramped middle layout.
   - 1440 px: content does not become a narrow phone column; hero balance is intentional.
   - No heading, button, card, carousel control, or footer content is clipped.
   - Only the menu, quote panel, proof caption, and floating actions use glass effects.

6. Impeccable detector, once at the end:
   ```bash
   node /Users/zyekr/.ghost/profiles/gpt/skills/impeccable/scripts/detect.mjs --json index.html services.html pricing.html areas-we-serve.html faqs.html style.css
   ```
   Expected: review every finding; zero unresolved high-severity issues.

7. Lighthouse twice against local:
   ```bash
   npx --yes lighthouse http://127.0.0.1:8833/ --output=json --output-path=.hermes/artifacts/visual-refresh/after/lighthouse-1.json --chrome-flags='--headless --no-sandbox' --quiet
   npx --yes lighthouse http://127.0.0.1:8833/ --output=json --output-path=.hermes/artifacts/visual-refresh/after/lighthouse-2.json --chrome-flags='--headless --no-sandbox' --quiet
   ```
   Expected target bands: Accessibility 100, Best Practices 100, SEO 100, no console errors, zero CLS, and Performance not below 75 in both runs.

8. Git checks:
   ```bash
   git diff --check
   git status --short --branch
   ```
   Expected: no whitespace errors; only intended files modified.

---

### Task 18: Open the protected-branch PR, review, merge, and verify production

**Objective:** Deploy only after all quality gates pass and verify the served bytes, not merely the push.

**Steps:**

1. Push the feature branch:
   ```bash
   git push -u origin feat/visual-content-structure
   ```

2. Open a PR with before/after screenshots, Lighthouse summaries, the full page-count/link-count results, and explicit confirmation that no prices, phone numbers, payment terms, or review claims were invented.

3. Review the PR in two passes:
   - specification compliance against this plan;
   - visual/code quality and regression risk.

4. Merge through GitHub after approval. Do not push directly to `main`.

5. Poll GitHub Pages until the build for the merge commit reports `built`.

6. Verify production:
   ```bash
   curl -fsS "https://cleannest.in/?verify=$(date +%s)" -o /tmp/cleannest-live.html
   python3 - <<'PY'
   from pathlib import Path
   html = Path('/tmp/cleannest-live.html').read_text()
   for marker in ('id="trust-strip"', 'class="hero-proof-card"', 'id="final-cta"'):
       assert marker in html, marker
   print('PASS: visual refresh is live')
   PY
   ```
   Expected: `PASS: visual refresh is live`.

7. Run Lighthouse once against the live URL and compare to the baseline. Report real results, including regressions.

---

## Files expected to change

**Core documentation and tests**
- `CONTENT_ARCHITECTURE.md`
- `tests/test_site_design.py`
- `scripts/visual_qa.py`

**Primary visual and information architecture**
- `index.html`
- `style.css`
- `services.html`
- `pricing.html`
- `areas-we-serve.html`
- `faqs.html`

**Second phase: template consistency and unique content**
- 20 service-detail HTML pages listed in `sitemap.xml`
- 13 named city pages listed in Task 14

**Do not modify or run**
- `build_service_pages.py`
- the stale `/Users/zyekr/cleannest-app` copy
- `/Users/zyekr/Documents/deepseek/cleannest-website`

## Risks and tradeoffs

- **Conversion versus visual novelty:** the hero proof card is the one visual risk. Everything else should become quieter, not more decorated.
- **Homepage length:** removing the six-card Why section improves focus but slightly reduces repeated trust language. The trust strip and proof sections must carry the essential reassurance.
- **Performance:** adding a hero image can hurt LCP. Use the existing WebP, explicit dimensions, and no new hero script. Do not preload it until Lighthouse proves preload helps.
- **Review-schema risk:** syntactically valid `aggregateRating` markup can still violate Google guidance when used as self-serving LocalBusiness review markup. Confirm the GBP values and consider removing the aggregate schema if rich-result compliance is uncertain.
- **Content truth:** safety, training, uniform, “most trusted,” and address claims must not be strengthened without owner confirmation.
- **Static duplication:** header/footer markup is duplicated across many pages. This plan deliberately avoids introducing a new build system; a separate later plan can add safe materialized partials after the visual work stabilizes.
- **Generator risk:** `build_service_pages.py` is known stale. Running it can overwrite live improvements.
- **Lighthouse variance:** compare two runs and focus on category bands and major metrics, not a single exact score.
- **Protected branch:** a review is required. Do not weaken branch protection as part of ordinary implementation; use the normal PR approval path.

## Open questions that must be resolved before publishing claim changes

1. Does the live Google Business Profile currently show exactly 4.9 and 468 ratings/reviews?
2. Can CleanNest substantiate “verified and trained,” “uniformed,” “eco-safe,” and “certified non-hazardous”?
3. Are the published hours still 9 AM–8 PM, seven days a week?
4. Is the full street address in the old content document current and intended for public display?
5. Which six services produce the most enquiries? Until analytics is connected, use Full House, Kitchen, Bathroom, Sofa, AC, and Chimney as the homepage defaults.
6. Should analytics use GoatCounter or a real GA4 Measurement ID? Existing `gtag()` event handlers are inert without a loaded analytics service; analytics implementation should be a separate, focused task.

## Definition of done

- The homepage follows the target sequence and has one visual focal point.
- All core pages visibly share the same typography, header, spacing, palette, CTA language, and footer.
- Pricing content is unchanged factually but no longer looks like a separate website.
- Service and city pages have consistent information order without duplicate or invented copy.
- All structural tests pass.
- Responsive QA passes at 390, 782, and 1440 pixels, plus breakpoint edges.
- Lighthouse remains Accessibility 100 / Best Practices 100 / SEO 100, with no performance regression below the current 75 baseline in two consecutive runs.
- The merged GitHub Pages build is verified on `https://cleannest.in`, including served HTML markers and working WhatsApp quote flow.
