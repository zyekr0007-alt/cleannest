// Exact legacy paths only. Remaining Wix service slugs still need their own
// index evidence before they are added here.
export const origin = 'https://cleannest.in';
export const redirects = {
  '/index.html': '/',
  '/about': '/about.html',
  '/services': '/services.html',
  '/book-online': '/quote.html',
  '/blank': '/privacy.html',
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
  '/blank-2': '/terms.html',
  '/blank-3': '/refund.html',
  '/full-house-deep-cleaning.html': '/full-house-cleaning.html',
  '/kitchen-deep-cleaning.html': '/kitchen-cleaning.html',
  '/bathroom-deep-cleaning.html': '/bathroom-cleaning.html',
  '/sofa-dry-cleaning.html': '/sofa-cleaning.html',
  '/blog/deep-cleaning-cost-jalandhar-2026.html': '/pricing.html',
  '/blog/how-to-choose-right-cleaning-service-jalandhar.html': '/blog/urban-company-deep-cleaning-review-honest.html',
  '/blog/moving-out-cleaning-jalandhar-tenants.html': '/full-house-cleaning.html',
  '/blog/what-professional-deep-clean-includes.html': '/full-house-cleaning.html',
  // Index-evidenced 2026-09-14: a site: query still returns each of these four
  // while they answer 404 live, so they were dropping whatever the old pages had
  // earned. Two are Wix /service-page/ slugs, which is the evidence the note
  // above was waiting for; the other two are the old booking page and a retired
  // guide. Targets are the nearest current page, not a blanket fallback.
  '/service-page/kitchen-deep-clean': '/kitchen-cleaning.html',
  '/service-page/room-deep-clean': '/full-house-cleaning.html',
  '/book.html': '/quote.html',
  '/blog/best-cleaning-products-healthy-home.html': '/blog/ultimate-deep-cleaning-checklist.html',
};

export function redirectTarget(input) {
  const url = new URL(input);
  if (!['cleannest.in', 'www.cleannest.in'].includes(url.hostname)) return null;
  const destination = redirects[url.pathname];
  if (!destination && url.hostname === 'cleannest.in' && url.protocol === 'https:') return null;
  return origin + (destination || url.pathname) + url.search;
}
