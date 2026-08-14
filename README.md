# CleanNest — cleannest.in (site v2)

Static website for CleanNest cleaning services, Jalandhar, Punjab (India).

**Live preview:** https://zyekr0007-alt.github.io/cleannest/
**Production domain:** https://www.cleannest.in (DNS switch in progress — see Deployment)

## Stack
- Plain HTML + CSS + JS. No build step, no framework, no dependencies (only Google Fonts: Mukta).
- Hosted on GitHub Pages. Static = fast (~1 MB per page on the old Wix site → ~40 KB total here).

## Pages
`index.html` (home) · `services.html` · `book.html` (booking → WhatsApp) · `about.html` · `faq.html` · `contact.html` · `privacy.html` · `terms.html` · `refund.html` · `404.html` · `sitemap.xml` · `robots.txt`

## Business details encoded in the site
- Phone / WhatsApp: **+91 98151 12768** (`wa.me/919815112768`)
- Email: cleannestclub@gmail.com · Instagram: @cleannest.co
- Promo: **10% OFF first booking, code CLEAN10** (top banner + hero + pricing)
- Pricing model: quote-based (no invented price list) — every card/CTA routes to WhatsApp for a real quote
- JSON-LD: CleaningService schema (home), ItemList (services), FAQPage (faq), ContactPage/AboutPage/WebPage

## Editing
- Shared styles: `assets/css/style.css` (design tokens in `:root` — brand colors, radius, font)
- Shared JS: `assets/js/main.js` (mobile nav, scroll reveal, WhatsApp form handler)
- To change the phone number: search-replace `919815112768` (also update the wa.me links) — best done via repo search, all occurrences are the intl format.
- To add real prices later: drop a price table into the "Pricing" section of `index.html`.

## Local dev
```bash
python3 -m http.server 8123   # then open http://localhost:8123
```

## Deployment (GitHub Pages)
Repo: `zyekr0007-alt/cleannest` · branch `main` (site at repo root). Pushing to `main` auto-deploys.

### Pointing cleannest.in at this site (do once, at the domain registrar)
The domain currently runs on Wix (registrar backend: Tucows, bought 2025-12-07). Recommended path:

1. Create a free Cloudflare account and add `cleannest.in`.
2. In Cloudflare → DNS, add:
   - `A  @  185.199.108.153` (plus .109/.110/.111 — all four GitHub Pages IPs)
   - `CNAME  www  zyekr0007-alt.github.io`
3. At the current DNS provider (Wix Domains panel or wherever the domain's nameservers live), change nameservers to the two Cloudflare nameservers shown after step 1.
4. In Cloudflare: SSL/TLS → Full (strict not required), "Always Use HTTPS" on, and a Redirect rule `cleannest.in/* → https://www.cleannest.in/*` (keep www as canonical).
5. In GitHub repo → Settings → Pages → Custom domain: `www.cleannest.in`, tick Enforce HTTPS.
6. Wait for propagation (minutes to a few hours), then verify `https://www.cleannest.in`.

Email is Gmail (cleannestclub@gmail.com) — no MX records needed.

## SEO notes
- Canonicals point to `https://www.cleannest.in/...` — correct once DNS lands; while on the preview URL, Google consolidates to the production domain.
- `sitemap.xml` + `robots.txt` reference the production domain.
- Old Wix site has 4 blank pages (`/blank*`) and ~1 MB HTML per page — replaced entirely by this build.
