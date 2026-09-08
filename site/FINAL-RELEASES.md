# Final page releases — 8 September 2026

The owner requested implementation and immediate deployment one completed page at a time. This supersedes earlier notes asking for a second `go` before publishing. Preserve the two untracked original team photos.

1. Homepage and shared shell: deployed and verified, commit `03e61b9`. Fifteen comparison cards, rating/review carousel, neutral district map, centered logo entrance, scroll-responsive header, contact pills, compact service cards and footer. Structural checks, pricing regression suite, 11 route types at 360/768/1440, and local interaction checks passed. Live homepage HTTP 200 and 15 comparisons verified.
2. Services: completed in this release. Six approved primary images retained; six secondary illustrations replaced and visually verified. Smaller services use compact price rows; stove/exhaust remain quote add-ons. Chimney is a separate ₹690 extra across kitchen text, FAQ, catalog and estimate. Mobile/desktop visual checks, all-page structural checks, 12 pricing tests and service-page WCAG A/AA scan passed. Also tightened the homepage comparison image crops.
3. Pricing: completed in this release. Five two-column rate tables with readable service scope, units, starting rates and range endpoints. All 32 rows fit a 360px screen without table or page overflow; desktop fit, structural and WCAG A/AA checks passed. Services release `b46d5b3` and its live chimney-extra flag were verified before this release.
4. Reviews: pending. Dedicated page with owner-provided platform links and confirmed excerpts.
5. Service Areas: pending. District map at top and all 13 city links below.
6. FAQs: pending. Dedicated categorized accordion page using shared animation.

## Secondary photo prompt set

Built-in image generation, photorealistic-natural. Each is a separate landscape 4:3 service illustration in an Indian home, natural soft daylight, warm off-white and subtle navy details, realistic textures, no text/logos/watermarks. Illustrations are not presented as documentary client results.

- Mattress: upholstery extraction nozzle with hose on a bare ivory quilted bed mattress; whole mattress and bed edge clearly visible.
- Curtains: handheld fabric steamer treating full-height ivory linen curtains beside a sunlit window; pleats and fabric are the main subject.
- Blinds: navy-gloved hand and microfiber cloth cleaning horizontal white venetian blind slats.
- Carpet: metal carpet extraction wand with hose cleaning a beige woven area rug; low view emphasizing rug texture.
- Refrigerator: open refrigerator with white interior, glass shelves and drawers; gloved hand wiping a shelf, no food clutter.
- Floor: professional single-disc scrubber with round brush head on pale Indian marble in a believable lobby.

Final assets go in `assets/img/editorial/{mattress,curtains,blinds,carpet,fridge,floor}-v2.webp`. Existing generated originals remain under the image tool's generated-images directory.
