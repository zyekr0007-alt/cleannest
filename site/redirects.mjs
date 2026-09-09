// Exact legacy paths only. Unknown Wix service slugs need owner/index evidence.
export const origin = 'https://cleannest.in';
export const redirects = {
  '/index.html': '/',
  '/about': '/about.html',
  '/services': '/services.html',
  '/book-online': '/quote.html',
  '/blank': '/privacy.html',
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
};

export function redirectTarget(input) {
  const url = new URL(input);
  if (!['cleannest.in', 'www.cleannest.in'].includes(url.hostname)) return null;
  const destination = redirects[url.pathname];
  if (!destination && url.hostname === 'cleannest.in' && url.protocol === 'https:') return null;
  return origin + (destination || url.pathname) + url.search;
}
