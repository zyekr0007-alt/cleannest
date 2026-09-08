# CleanNest redesign — September 2026

> The final page-by-page releases are documented in [FINAL-RELEASES.md](FINAL-RELEASES.md). Those refinements supersede the initial design notes below. The current site has 66 pages, including a dedicated Reviews page.

## Running and maintaining the site

The public site remains static HTML/CSS/JavaScript, compatible with GitHub Pages. No server, account system, third-party animation dependency or production build service is required. Node is used locally to generate the HTML from shared templates.

- `npm run build`: regenerate the 65 HTML pages, sitemap and browser pricing data.
- `npm run dev`: serve the project at http://127.0.0.1:8123.
- `npm test`: pricing and WhatsApp-message regression tests.
- `npm run check`: all-page structural, metadata, links and asset checks.
- `node scripts/browser-check.mjs`: checks 11 page types at 360, 768 and 1440 pixels using the installed agent-browser CLI; requires the local preview server.

Edit `scripts/build.mjs` for page templates, `site/components.mjs` for the header/process/care components, `site/map.mjs` for coverage, and `site/catalog.mjs` for services and business information. `assets/refinements.css` builds on `assets/site.css`; `assets/site.js` handles shared interactions. The estimator uses `assets/estimate.mjs` and `assets/quote-flow.js`.

`site/content.json` preserves the pre-redesign content and published prices. Its `rates` and `homes` are the price source of truth. Its individual service includes/FAQs and policy/article content feed the new templates. Some unused legacy homepage data is retained as a migration reference. Do not run the old `build_service_pages.py` or the one-time `scripts/capture-content.mjs` against the generated site.

Generated HTML is checked into the repository so GitHub Pages can publish it directly. The owner authorized publishing this reviewed version on 8 September 2026. The existing Pages configuration deploys `main` from the repository root to https://cleannest.in/.

## Approved direction and business rules

- Wordmark only: CleanNest in local Ultima, navy #0B4364. No circular C/nest mark is displayed. The larger wordmark is used in header/footer; `wordmark.svg` outlines the same font for favicon/business metadata.
- Warm off-white #F8F7F4, 14px button corners, concentric nested cards and aligned responsive grids. Manrope handles text/UI headings; DM Serif Display provides editorial heading contrast. Ultima is reserved for the wordmark.
- Six popular services on the homepage; all 24 existing service offerings in the directory.
- 13 owner-confirmed cities, including Jalandhar. The old Dasuya and Hariana URLs remain as coverage-enquiry pages; they are not listed as confirmed areas.
- Office address retained from existing policy pages and shown on Contact, not in visible homepage copy. The existing policies and public address source use PIN 144003; the old README’s conflicting 144001 was not used.
- Hours remain 9 AM–8 PM every day. Same-day availability is qualified.
- Owner confirmed trained/background-checked staff, suitable products and the free re-clean promise.
- Existing pricing retained. Exact scope, price and dates are confirmed over WhatsApp. Existing payment terms remain 50% to confirm and 50% after service.
- No stale aggregate rating/count is presented as live data. Existing customer review excerpts link to Google.

## Quote builder

Four screens: multi-select services → relevant tap choices and counts → name and phone → itemized estimate and WhatsApp. Service links preselect a service while still allowing other selections. Expandable access includes all 24 services and smaller cabinet, ceiling-fan, dining-chair and cushion extras.

Full-home estimates keep the published BHK ranges and collect kitchen/bathroom counts as scope information. Whole-home kitchen/bathroom work and other included basics are excluded from extras. The dedicated kitchen service includes hob, exhaust and cabinet cleaning; those are excluded as duplicate add-ons. Chimney cleaning is an optional ₹690 extra. Sofa cushion cleaning is not charged twice. Home-package chimney cleaning remains an optional specialist add-on, as requested by the owner.

Bathroom pricing is one ₹890–₹1,190 size/condition range, not standard/descaling tiers. Kitchen and full-home pricing retain their published ranges. Only sofa (Standard/Premium/Premium + steam) and AC have treatment options; other old tiers are represented as ranges with their original endpoints. Floor renewal retains material selection. Recliners add the published ₹150 surcharge and cannot exceed sofa seats. Custom jobs never display a priced subtotal as their complete total.

The form validates name and phone before revealing the estimate. Location/notes are optional. A privacy notice explains the handoff; the visitor explicitly chooses the WhatsApp link and presses Send there. No delivery or reserved-slot claim is made. No customer details are stored in localStorage or sent to a separate backend.

Owner confirmed that chimney cleaning is a separately charged kitchen add-on at ₹690. `kitchenIncludesChimney` is false, and kitchen inclusions, FAQ, quote suggestions and regression tests reflect this. Sofa ₹199/₹279/₹349 per seat and AC ₹490/₹690 per unit remain unchanged.

## Design and imagery

The design-engineering skill informed short press transitions, coordinated hero entry, modest scroll reveals, native disclosure controls and reduced-motion support. The image-generation skill was used through the built-in image tool for five new illustrative photographs. These are not represented as real team portraits or evidence of completed work. Existing service illustrations remain for other services.

Project-bound generated files: `assets/img/editorial/hero.webp`, `kitchen.webp`, `bathroom.webp`, `sofa.webp`, `chimney.webp`. Images were visually inspected and converted to optimized WebP. The originals remain in the image tool’s generated-images directory. Existing before-and-after originals were not modified. Gallery previews and the original-resolution lightbox use SVG viewBox crops to exclude branded poster margins and the circular logo.

The Apple-design skill informed nested radii, interrupted menu transitions and reduced-motion support. Apple's [ConcentricRectangle documentation](https://developer.apple.com/documentation/swiftui/concentricrectangle) is interpreted as coordinated inner/outer corner radii, not decorative repeated borders. Native web CSS/SVG is used, not SwiftUI.

Punjab map: `site/punjab.geojson` is the Punjab (IN-PB) simplified boundary from geoBoundaries gbOpen IND ADM1, sourced from DataMeet/Election Commission under CC BY 2.5 IN. Source: https://www.geoboundaries.org/api/current/gbOpen/IND/ADM1/ . City-centre coordinates are approximate Wikipedia/GeoHack positions, not travel-distance claims. Thirteen pins animate once on entry, with a distinct amber home pin and selectable city labels; reduced-motion users see the static complete map. Fonts are self-hosted with OFL licenses alongside the files.

Prompt set (built-in image generation):

1. Hero: premium architectural editorial photograph of a believable contemporary family living room in Punjab, India; ivory sofa, muted navy cushions, oak table, pale warm stone floor, sheer curtains, tall windows, morning light and natural shadows. Human-eye 28mm view, detailed fabric and wood, airy balanced composition, no people/text/logos/watermark. Illustrative interior rather than client work.
2. Kitchen: photorealistic editorial Indian kitchen, ivory cabinetry, quartz counters, stainless chimney mounted above a gas hob, sink, folded cloth and small plant; warm natural daylight, navy accents and believable material texture, consistent 4:3 service composition; no people/text/logos/watermarks.
3. Bathroom: photorealistic Indian residential bathroom, ivory stone tile, chrome taps, glass shower partition, oak vanity and white basin, neatly folded towels and sunlit surfaces; consistent warm ivory/oak/navy palette; no people/text/logos/watermarks.
4. Sofa: close editorial photograph of an upholstery extraction nozzle resting on an ivory linen sofa cushion with its hose extending out of frame, navy cushion behind, warm wood side table and natural daylight; realistic weave and equipment; no people/text/logos/watermarks.
5. Chimney: three-quarter close-up of a mechanically plausible brushed stainless kitchen chimney above a black glass gas hob, visible fitted mesh grease filter, one nitrile-gloved hand wiping the outer edge with a folded microfiber cloth; ivory cabinets, neutral stone backsplash and natural daylight; no face/text/logos/watermark.

## Verification and remaining practical limits

Automated structural checks cover all 65 pages. Browser checks cover 11 page types at phone, tablet and desktop widths with no broken images or document overflow. Homepage and quote review passed WCAG A/AA automated scans after contrast corrections; image-background items also received visual inspection. Automated scans do not replace physical-device or assistive-technology testing.

The actual quote form was exercised through review and its WhatsApp URL was intercepted locally to confirm the recipient and full message without sending a real enquiry. Service filters and image-gallery controls were checked in-browser. Pricing tests cover ranges, quantities, package exclusions, recliners, material tiers, custom subtotals and the outbound summary.

Additional owner-provided authentic team photographs can replace the illustrative About imagery later. The two pre-existing untracked team-collage files are preserved locally and excluded from this release. No real-world test enquiry has been sent.
