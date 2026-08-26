# CleanNest — Site Architecture, Content & Copy Spec

Project: cleannest.in — CleanNest, Deep Cleaning Services, Jalandhar (Punjab), India
Repo: ~/cleannest-site (github.com/zyekr0007-alt/cleannest, GitHub Pages, lives on www.cleannest.in)
Status: This document defines the information architecture, section copy, brand voice, and target audience for the site. Use it as the source of truth when writing or editing pages.

---

## 1. Purpose of the site (what cleannest.in is)

**One line:** cleannest.in is the marketing and lead-generation site for **CleanNest**, a professional deep-cleaning service based in Jalandhar, Punjab, with a single job: get a local homeowner or business to send a WhatsApp message and book a clean.

**What the business does:** Residential and commercial deep cleaning — full-house, kitchen, bathroom, sofa, carpet/steam, AC, chimney, and commercial/office cleaning, plus extras (mattress, fridge, fan, cabinet interior, villa, post-construction).

**The single conversion goal:** Every page funnels the visitor to one action — **Get a Free Quote on WhatsApp (+91 76100 00654)**. There is no online checkout. A quote is free, no obligation, confirmed with 50% advance, 50% after service.

**Why it exists (vs the competitors):** The site exists to convert Google/Business searches ("house cleaning near me Jalandhar") into WhatsApp conversations, backed by social proof (4.9★ Google rating, 468 ratings) and transparent starting prices.

---

## 2. Site map (Information architecture)

### 2a. Simple site map (the requested skeleton)

| Page | Purpose | Primary CTA |
|------|---------|-------------|
| **Home** (`index.html`) | Convert: state the promise, prove it, get the quote. | Get Free Quote |
| **About / Why CleanNest** | Build trust + answer "can I trust them in my home?" | Get Free Quote / WhatsApp |
| **Services** (hub + dedicated pages) | Let the visitor find their specific clean and see price + scope. | Get Exact Quote on WhatsApp |
| **Contact** | Give an immediate human path (WhatsApp, call, address, hours). | WhatsApp Us / Call Now |

### 2b. Full architecture (what is actually in the repo)

Current real pages:

- `/` — `index.html` (home: hero, 8-service grid, results gallery, reviews, why-us, cities, FAQ, starting prices, CTA band, footer)
- `/full-house-deep-cleaning.html`
- `/kitchen-deep-cleaning.html`
- `/bathroom-deep-cleaning.html`
- `/sofa-dry-cleaning.html`
- `/carpet-steam-cleaning.html`
- `/ac-services.html`
- `/chimney-cleaning.html`
- `/commercial-cleaning.html`
- `/faqs.html`
- `/sitemap.xml`, `/robots.txt`, `/CNAME`

### 2c. Recommended structure (target state)

Home
├─ About (story, team, why-us, stats, service-areas)   ← currently only a home "Why CleanNest" section; recommend a dedicated `/about.html`
├─ Services (hub `/services.html`)                     ← currently no hub page; 8 service pages exist and are linked from home + sitemap
│   ├─ Full House Deep Cleaning
│   ├─ Kitchen Deep Cleaning
│   ├─ Bathroom Deep Cleaning
│   ├─ Sofa Dry Cleaning
│   ├─ Carpet & Steam Cleaning
│   ├─ AC Services
│   ├─ Chimney Cleaning
│   └─ Commercial Cleaning
├─ Pricing (could live on home + a dedicated `/pricing.html`)
├─ FAQs (`/faqs.html`)                                  ← exists
├─ Reviews (carousel / grid on home, optional `/reviews.html`)
├─ Contact + Book (`/contact.html`, `/book.html`)       ← currently only the CTA band; recommend dedicated pages
└─ Legal: `/privacy.html`, `/terms.html`, `/refund.html`, `/404.html`

Gap note: `README.md` lists about/services/contact/book/privacy/terms/refund/404 pages that **do not exist** in the repo. Only index.html + 8 service pages + faqs.html are real. Fix README or build the missing pages.

---

## 3. Placeholder copy by section

Copy below is grounded in the live business facts. Where a page doesn't exist yet, this is the copy to drop in. All copy keeps the same voice (see §4) and ends near a WhatsApp/quote action.

### 3a. Home page

**Hero**
- Eyebrow / kicker: `Jalandhar's Most Trusted Cleaning Service`
- H1 (current): `Professional Cleaning. Done Right.`
- Subhead (current): `Premium deep cleaning services for homes, offices and businesses across Jalandhar.`
- Primary CTA: `Get Free Quote →`
- Trust strip: `4.9★ Google Rating · 468 verified ratings · 7 days a week, 9 AM – 8 PM`
- Secondary actions: `WhatsApp` · `Call` · `Instagram`

**Services grid (8 tiles)** — tile = image + label:
1. Full House Deep Cleaning
2. Kitchen Deep Cleaning
3. Bathroom Deep Cleaning
4. Sofa Dry Cleaning
5. Carpet & Steam Cleaning
6. AC Services
7. Chimney Cleaning
8. Commercial Cleaning
- Section intro: `Our Services` · `Tap a service to see details & get a quote.`

**Results / gallery**
- Badge: `Results` · Title: `See the Results` · Sub: `Tap any job to see the before & after.`
- (Before/after imagery, per-job labels: Bathroom & Toilet, Kitchen, Sofa, Carpet, AC, Chimney, Commercial, Floor Tiles, etc.)

**Reviews**
- Badge: `Reviews` · Title: `Google Reviews` · Aggregate: `4.9` + star row + `468 live ratings · Verified on Google`
- Cards: real review names + 5-star rows + quotes. Link out: `See all reviews →`

**Why CleanNest (about / trust)**
- Badge: `Why CleanNest` · Title: `Why choose us?`
- Cards (name + snip + expandable detail):
  - Eco-safe — `Family & pet-safe`
  - Verified & trained — `Uniformed pro cleaners`
  - Always on time — `We arrive on schedule`
  - Honest pricing — `No surprises`
  - Free quote — `50% to book, 50% after`
  - Covers your city — `Jalandhar & nearby`

**Areas we cover** — `/cities`
`Areas we cover:` Jalandhar · Phagwara · Kapurthala · Hoshiarpur · Nakodar · Goraya · Adampur · Kartarpur · Sultanpur Lodhi · Nawanshahr · Phillaur · Ludhiana

**FAQ (home teaser)** — Badge `FAQ` · Title `Questions, answered`
- How much does house cleaning cost in Jalandhar? → Starting prices below; full-house deep cleaning starts ₹4,900. Exact quote free on WhatsApp.
- How does payment work? → 50% advance to confirm, 50% after service.
- Do I need to be home during the cleaning? → Not necessarily; we work out what's convenient.
- Are your products safe for kids and pets? → Yes, professional eco-friendly products.
- How do I book? → Tap Get Free Quote, pick services, send on WhatsApp.
- Link: `See all FAQs →`

**Starting prices** — Badge `Pricing` · Title `Starting prices` · Sub `Honest starting rates — your exact quote is free on WhatsApp.`
- Bathroom Deep Cleaning — From ₹890
- Kitchen Deep Cleaning — From ₹2,490
- Chimney Cleaning — From ₹690
- AC Cleaning (Normal) — From ₹490
- AC Snow Foam — From ₹690
- Sofa Cleaning (per seat) — From ₹199
- Mattress Steam Cleaning — From ₹1,199
- Refrigerator Cleaning — From ₹899
- Fan Cleaning — From ₹70
- Cabinet Interior Cleaning — From ₹490
- Carpet & Steam Cleaning — Custom quote
- Villa Cleaning — Custom quote
- Full House feature: 1 BHK ₹4,900 · 2 BHK ₹9,900 · 3 BHK ₹11,900 · 4 BHK ₹15,900
- Note: `All prices are starting rates and vary with home size & condition. Your final quote is free — no obligation.`
- CTA: `Get Exact Quote on WhatsApp →`

**CTA band (contact)**
- Badge: `Free Quote` · Title: `Ready for a spotless home?` · Sub: `Get your free quote in minutes — 50% to book, 50% after service.`
- Actions: `Get Free Quote` · `WhatsApp Us`
- Perks: `Free quote in minutes` · `No booking fee` · `7 days a week · 9 AM – 8 PM`
- Promo: `10% OFF with code CLEAN10`

### 3b. About / Why CleanNest page (create `/about.html`)

**Hero:** `Trusted by Jalandhar's homes and businesses.` · Sub: `CleanNest is a local, professional deep-cleaning team serving Jalandhar and nearby cities — 7 days a week.`

**Story (placeholder):** `CleanNest started with a simple idea: deep cleaning shouldn't be a gamble. We show up on time, use professional eco-friendly products, and finish the job properly. From a single bathroom to a whole house or an office, we treat every space like our own.`

**Stats band:** `4.9★` Google rating · `468+` reviews · `12` cities covered · `7 days` a week

**Why us (reuse home cards):** Eco-safe · Verified & trained · Always on time · Honest pricing · Free quote (50/50) · Covers your city

**What to expect (placeholder):** `Verified, uniformed team arrives on schedule; you get an upfront quote; we use professional, eco-safe products; we clean, check, and hand back the space spotless — and you pay the remaining 50% after the job.`

**CTA:** `Ready for a spotless home? → Get Free Quote`

### 3c. Services hub + service pages

**Hub (`/services.html`) — intro:** `Our Services` · `Professional deep cleaning for every corner of your home and business.`

Per-service page template (each page = 1 clean):
- **H1:** `[Service]` (e.g. Full House Deep Cleaning)
- **Subhead:** `A complete top-to-bottom deep clean of your [scope].` (one sentence)
- **Section "What we cover":** bullet list of the exact surfaces/items included (e.g. Full house: kitchen, bathrooms, bedrooms, living areas, balconies, windows, fans, etc.)
- **Section "Before & After":** before/after imagery for that service
- **Section "Price":** starting rate + tier list where applicable (full house uses the 1–4 BHK tiers)
- **Section "Why CleanNest":** short trust strip (eco-safe, trained, on-time, honest pricing, free quote)
- **FAQ block:** 2–3 service-specific answers, link to `/faqs.html`
- **CTA band:** `Ready for a spotless space?` · `Get Free Quote` · `WhatsApp Us`

### 3d. Contact / Book pages (create)

**Contact (`/contact.html`):**
- Heading: `Let's get your space spotless.`
- Primary: `WhatsApp Us +91 76100 00654` (button opens `wa.me/917610000654` with a prefilled message)
- Call: `+91 76100 00654` (tel link, 9 AM – 8 PM, 7 days)
- Email: `cleannestclub@gmail.com`
- Address: `Shop 3, Wadala Rd, opp. Palm Royale Estate, Guru Teg Bahadur Nagar, Green Model Town, Jalandhar 144001`
- Instagram: `@cleannest.co`
- Hours: `7 days a week · 9 AM – 8 PM`
- Map embed + a short lead form that builds a prefilled wa.me URL.

**Book (`/book.html`):**
- Steps: (1) Tap a service or tell us the job → (2) We send a free quote → (3) Pay 50% to confirm → (4) We clean → (5) Pay 50% after.
- CTA: `Get Free Quote on WhatsApp`

### 3e. Footer (all pages)

- Brand: `CleanNest` · Tagline: `Jalandhar's most trusted cleaning service`
- Actions: `WhatsApp Us` · `Call Now` · `Instagram`
- Contact block: WhatsApp number, phone, email, address, hours
- Links: Services, FAQs, About, Contact, (Legal: Privacy, Terms, Refund once built)
- Note: promo `10% OFF — code CLEAN10`

---

## 4. Brand voice

- **Confident but warm and local.** Sounds like a trustworthy, professional local business, not a corporate — "Jalandhar's most trusted cleaning service."
- **Proof-driven, not hype.** Numbers carry the pitch: 4.9★, 468 ratings, real starting prices, 12 cities, 7 days a week. Avoid vague superlatives without a number behind them.
- **Reassuring.** Big deal in this category is trust in your home: emphasize verified + uniformed + trained staff, eco-safe family/pet-safe products, arriving on time, honest no-surprise pricing.
- **Clear and concrete.** Say exactly what's cleaned and what it costs. Lead with the service and the price, not adjectives.
- **Action-oriented.** Every section ends near a quote/WhatsApp action. Verbs: Get, Book, Tap, Request, Call, Message.
- **Tone:** Indian English, warm, helpful, plain — no corporate jargon, no "premium luxury" padding. Friendly but not cutesy.

**Do:** lead with the result; give real prices; name real cities; repeat the free-quote + 50/50 + 7-days cadence; use short sentences.
**Don't:** bury the CTA; invent facts; overuse exclamation marks; use vague claims ("best in the world"); drop the trust signals.

---

## 5. Target audience

**Primary:** Homeowners and tenants in & around Jalandhar (and commuters living abroad booking for family — e.g. a reviewer in New Zealand booked for parents), typically 25–55, who:
- Want a deep clean without doing it themselves (working people / busy families / NRIs arranging cleaning for relatives).
- Search Google for "house cleaning Jalandhar", "deep cleaning near me", "sofa cleaning", "AC service".
- Decide on trust + price + speed, and are happy to book over WhatsApp.
- Value safety (kids/pets), punctuality, and a fixed honest price.
- Price band: mid-range; starting prices ₹70–₹15,900 make it "bookable on a whim" but the free quote removes commitment fear.

**Secondary:** Small businesses, shops, offices, and property managers (commercial cleaning) needing recurring or one-off deep cleans, and post-construction/house-warming cleans.

**Payment/booking profile:** Prefers WhatsApp (no app, no account), pays 50% to book / 50% after, wants a free no-obligation quote before committing.

---

## 6. Content rules for contributors

1. Every page leads with one clear CTA (WhatsApp quote) repeated at the hero and the bottom band.
2. Use the canonical number **+91 76100 00654** everywhere (old +91 98151 12768 is retired). wa.me link: `https://wa.me/917610000654`.
3. Keep prices in INR with the "From ₹X / starting rates" framing; never imply a fixed price for custom work (carpet, villa = custom quote).
4. Preserve the 4.9★ / 468-rating facts; if Google shows a different count, update both the badge and the review-count text together.
5. Don't change the brand voice; match the patterns above. Drop-in copy from §3 verbatim where a page is missing.
6. Refer to the promo consistently as **10% OFF with code CLEAN10**.
7. Local SEO: keep the canonical domain `www.cleannest.in`, the service areas (12 cities), and schema.org LocalBusiness (with rating + hours + areasServed) on the home page.
