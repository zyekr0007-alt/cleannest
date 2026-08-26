# CleanNest — cleannest.in (site v2)

Static site for **CleanNest — Deep Cleaning Services, Jalandhar** (Punjab, India).

- **Production domain:** https://www.cleannest.in (DNS switched 14 Aug 2026; HTTPS cert auto-provisions within hours of the switch)
- **Preview URL:** https://zyekr0007-alt.github.io/cleannest/ (redirects to the custom domain while the custom domain is set)
- **Repo:** github.com/zyekr0007-alt/cleannest — GitHub Pages auto-deploys from `main` (no build step)

## Stack

- Plain static HTML/CSS/JS — no framework, no build step, no dependencies
- Fonts: Sora (display) + Roboto (body) via Google Fonts
- Design: MyClean-style — white + royal blue `#1654CC` + cyan `#0CD7E5` + light blue `#F0F4FF`, navy `#0B4364` nav, pill buttons with arrows
- Real business content from the GMB listing ("Cleannest - Deep Cleaning Services"): real green logo (`assets/img/logo-emblem.png`), 9 real services, 4.9★/219 Google reviews + real review quotes, gallery photos, full address + hours, service areas

## Pages

- `index.html` — home: quote widget hero, rating badge, why-us, about + stats, 8-service grid, reviews, plans, how it works, what to expect, gallery, FAQ, CLEAN10 promo, schema.org (CleaningService + aggregateRating)
- `services.html` — all 9 services with details and WhatsApp CTA per service
- `about.html`, `faq.html`, `contact.html`, `book.html` — contact/book have WhatsApp lead forms (build prefilled wa.me URLs)
- `privacy.html`, `terms.html`, `refund.html`, `404.html`, `sitemap.xml`, `robots.txt`

## Business facts on the site

- Promo: **10% OFF with code CLEAN10**
- WhatsApp / booking line: **+91 76100 00654** — single canonical number (old +91 98151 12768 removed)
- Address: Shop 3, Wadala Rd, opp. Palm Royale Estate, Guru Teg Bahadur Nagar, Green Model Town, Jalandhar 144001
- Hours: 9 AM – 8 PM, 7 days a week
- Instagram: instagram.com/cleannest.co

## Editing

- Edit any page's HTML directly; `assets/css/style.css` (461 lines) holds all styles; `assets/js/main.js` (83 lines) holds the WhatsApp form logic + mobile nav + scroll reveal.
- Verify locally: `python3 -m http.server 8123` in this dir, open http://localhost:8123
- Commit to `main` — GitHub Pages deploys automatically.

## Deployment notes

- Domain `cleannest.in` is registered via Wix (Tucows backend, renews 2028-12-07).
- DNS (managed in Wix Domains → the domain → ⋮ → Manage DNS records):
  - `A @ → 185.199.108.153 / 185.199.109.153 / 185.199.110.153` (GitHub Pages)
  - `CNAME www → zyekr0007-alt.github.io`
  - GitHub Pages custom domain: `www.cleannest.in` (set in repo Settings → Pages); apex 301s to www automatically.
- HTTPS: GitHub Pages auto-issues the Let's Encrypt cert for the custom domain (may take up to a day after the DNS change; usually under an hour).
- Old Wix site is now dark at cleannest.in. The Wix site/plan can be cancelled in the Wix account once the new site is fully verified.
- `cleannest.co.in` (Zyro) still runs as a duplicate — recommend redirecting it to cleannest.in or shutting it down (owner decision).
- GMB website field currently points to `cleannest.co.in` — should be updated to `https://www.cleannest.in` (owner action in Google Business Profile).
- Canonicals point to `https://www.cleannest.in/...`.
