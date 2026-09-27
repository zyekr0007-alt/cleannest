// Exact legacy paths only. Remaining Wix service slugs still need their own
// index evidence before they are added here.
export const origin = 'https://cleannest.in';
export const redirects = {
  '/index.html': '/',
  '/book-online': '/quote',
  '/blank': '/privacy',
  // Wix emitted blank, blank-1, blank-2, blank-3 — the middle one was skipped
  // here. It showed up in Search Console on 2026-09-14 still earning an
  // impression while answering 404, and worse, www.cleannest.in/blank-1 was a
  // 301 to an apex URL that does not exist: redirectTarget sends an unmapped
  // www path to the same path on the apex, which is only correct when the apex
  // actually has that page. A 301 into a 404 reads to Google as a soft 404 and
  // drops slower than a plain 404, so the miss cost more than the dead page did.
  // The homepage is the target because a Wix placeholder has no content to
  // preserve and no honest nearest equivalent; /blank-1's neighbours map to
  // privacy/terms/refund, which are already taken by blank, blank-2 and blank-3.
  '/blank-1': '/',
  '/blank-2': '/terms',
  '/blank-3': '/refund',
  '/full-house-deep-cleaning.html': '/full-house-cleaning',
  '/kitchen-deep-cleaning.html': '/kitchen-cleaning',
  '/bathroom-deep-cleaning.html': '/bathroom-cleaning',
  '/sofa-dry-cleaning.html': '/sofa-cleaning',
  '/blog/deep-cleaning-cost-jalandhar-2026.html': '/pricing',
  '/blog/how-to-choose-right-cleaning-service-jalandhar.html': '/blog/urban-company-deep-cleaning-review-honest',
  '/blog/moving-out-cleaning-jalandhar-tenants.html': '/full-house-cleaning',
  '/blog/what-professional-deep-clean-includes.html': '/full-house-cleaning',
  // Index-evidenced 2026-09-14: a site: query still returns each of these four
  // while they answer 404 live, so they were dropping whatever the old pages had
  // earned. Two are Wix /service-page/ slugs, which is the evidence the note
  // above was waiting for; the other two are the old booking page and a retired
  // guide. Targets are the nearest current page, not a blanket fallback.
  '/service-page/kitchen-deep-clean': '/kitchen-cleaning',
  '/service-page/room-deep-clean': '/full-house-cleaning',
  '/book.html': '/quote',
  '/blog/best-cleaning-products-healthy-home.html': '/blog/ultimate-deep-cleaning-checklist',
};

// Meta fetches this exact literal URL and reads the token inside it — it must
// keep serving at its real .html path, never redirect, or domain verification
// breaks. Exported so build.mjs and scripts/check.mjs share the one name
// rather than each retyping the filename.
export const PROTECTED_HTML = '/pxawfl5xxh0yig08fro10644ikkd84.html';

// Every generated page is still a real foo.html file on disk (Cloudflare Pages
// resolves /foo to it automatically), but foo.html is no longer the canonical,
// public URL — /foo is. A request for the old .html path (an existing bookmark,
// backlink or search result) gets a single 301 to the clean equivalent instead
// of being served directly.
function cleanHtmlPath(pathname) {
  if (pathname === PROTECTED_HTML) return null;
  if (pathname === '/index.html') return '/';
  if (pathname.endsWith('/index.html')) return pathname.slice(0, -'index.html'.length);
  if (pathname.endsWith('.html')) return pathname.slice(0, -'.html'.length);
  return null;
}

export function redirectTarget(input) {
  const url = new URL(input);
  if (!['cleannest.in', 'www.cleannest.in'].includes(url.hostname)) return null;
  const destination = redirects[url.pathname] || cleanHtmlPath(url.pathname);
  if (!destination && url.hostname === 'cleannest.in' && url.protocol === 'https:') return null;
  return origin + (destination || url.pathname) + url.search;
}
