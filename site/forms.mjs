// Configuration for the website enquiry forms, which POST to the Worker's
// /api/inquiry endpoint (see hosting/redirect-worker.mjs).

export const inquiryEndpoint = '/api/inquiry';

// Public Turnstile sitekey, from Cloudflare dashboard > Turnstile. It ships in
// the HTML by design; its partner secret is a Worker secret
// (`npx wrangler secret put TURNSTILE_SECRET`) and is never committed here.
export const turnstileSiteKey = '0x4AAAAAAEzktKRvX4XIhF6E';

// Both addresses are configuration ONLY. They are never read from the request
// body — that is what stops the public endpoint being used as an open mail relay.
export const enquiryTo = {email: 'admin@cleannest.in', name: 'CleanNest'};

// Must be an address verified with Mailjet (a confirmation link, no DNS records).
export const enquiryFrom = {email: 'admin@cleannest.in', name: 'CleanNest website'};
