# Navy and ice-blue UI follow-up

9 September 2026. Owner requested these UI changes and authorized publishing
them together with the preceding implementation audit.

## Changes

- Horizontal three-step booking journey, including mobile: circular SVG icons,
  small numbered badges, simple arrows and readable captions.
- Clear translucent review-star pills with a single first-view shimmer.
  CSS transform/opacity, 1100ms, existing ease-in-out curve; purpose is occasional
  marketing delight. No loop, no keyboard/hover trigger, and no shimmer for
  reduced-motion or Save-Data users. No animation library added.
- Geographic Punjab outline and all thirteen city markers use the same
  projection. Jalandhar is highlighted at its approximate city-centre coordinates
  (75.57618 E, 31.326015 N). Connecting lines, district illustration and map
  replay/zoom animation are removed. Nearby city links stay accessible below.
- WhatsApp and Instagram use unmodified SVG paths from Simple Icons 15.0.0 (CC0),
  replacing hand-drawn approximations. Shared email and FAQ icons now apply to
  navigation/footer/contact; FAQ disclosures use chevrons. The WhatsApp quote
  handoff uses the same brand SVG. Sources are linked in `assets/brand-icons.mjs`.
- Palette: navy #0A2647, accent #2C5F8A, canvas #F8FAFC, ice #EBF0F5,
  body #475569, status #1B6B48, white cards, borders #D1D9E6,
  hover #0F3A6B and badges #D6E4F0. Footer is navy with white text.
  Gold is retained specifically for review stars. Photos and wordmark shape
  are unchanged.

## Verification and publishing

Build, 66-page structural/schema/link audit, 60-URL local HTTP crawl and pricing,
redirect and UI unit tests pass. The 64 responsive checks cover 16 routes at
360, 390, 768 and 1440 pixels. The suite also checks brand icons, horizontal
steps, line-free map, Jalandhar coordinates, quote flow and reduced motion.
Automated WCAG A/AA checks found no violations on the 16 mobile routes.
Manual screenshots cover the mobile steps, reviews, map and footer and desktop
steps. Evidence is in the ignored `.review/` directory.

Homepage CSS is now 63,107 bytes / 13,143 gzip (about 32% less compressed CSS
than the original four-layer baseline). Additional dedicated-page CSS is
9,640 bytes / 2,036 gzip. Earlier Lighthouse scores in IMPLEMENTATION-REPORT.md
describe the preceding build, not this color/map follow-up.

Publish generated files by pushing `main` to the existing GitHub Pages origin;
no hosting migration or DNS change is part of this release. Retain previous
hashed files so a cached older HTML document can still load its dependencies.
Pre-existing untracked hero images and SESSION-update1.md remain untouched.

Known dependencies from [the audit report](IMPLEMENTATION-REPORT.md) remain:
arbitrary legacy HTTP redirects need an edge/host decision; unique city facts,
approved compact favicon, Ultima licensing confirmation and Search Console
work need owner input/access. Publishing this code does not resolve those items.
