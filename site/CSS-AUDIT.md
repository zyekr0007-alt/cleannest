# Stylesheet refactor

The four published layers were parsed as CSS before consolidation. Selectors
were checked against every generated page, the active scripts and source templates.
109 distinct obsolete selectors were removed (old hero/footer/filter/quote
layouts plus the removed intro and decorative closing illustration).

Retained state selectors include menu aria-expanded/data-open/inert/hidden,
details[open], dialog/backdrop, quote data-step/aria-pressed/checked/disabled,
carousel current/dragging, map animation and reduced-motion rules. No automated
browser-coverage purge was used: a selector absent from the initial viewport
is not evidence that it is dead.

Tokens normalize image/card/feature/pill radii and control dimensions. Map SVG
labels retain their viewBox-scaled font sizes; the accessible city link list
is the primary reading/navigation interface. Other supporting type is 12px+,
with 10px uppercase eyebrows. Small inset radii and circles remain intentional.

Source: styles/base.css and styles/pages.css. CSSnano conservatively merges
safe duplicate declarations and rules, preserving cascade and media context.
Build output uses content-hashed filenames. The source files are formatted for
maintenance; npm run build minifies production. Original assets/site.css,
refinements.css, final.css and pages.css are retired after regression checks.

The previous layers used 38 !important declarations; production now uses 10.
The hidden utility and reduced-motion overrides remain intentional.
Homepage CSS is 59,821 bytes (12,878 gzip), versus 77,671 bytes (19,289 gzip)
across the old four requests. Dedicated pages using both new bundles total
69,374 bytes (14,985 gzip). The page bundle is loaded only where its components
are used.
