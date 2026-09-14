// Configuration for the website enquiry forms, which POST to the Worker's
// /api/inquiry endpoint (see hosting/redirect-worker.mjs).

export const inquiryEndpoint = '/api/inquiry';

// Public Turnstile sitekey, from Cloudflare dashboard > Turnstile. It ships in
// the HTML by design; its partner secret is a Worker secret
// (`npx wrangler secret put TURNSTILE_SECRET`) and is never committed here.
export const turnstileSiteKey = '0x4AAAAAAEzktKRvX4XIhF6E';

// Enquiries are delivered to Telegram. Both values are Worker secrets, never
// committed, and the destination chat is configuration only — it is never read
// from the request body, so the public endpoint cannot message arbitrary chats:
//   npx wrangler secret put TELEGRAM_BOT_TOKEN
//   npx wrangler secret put TELEGRAM_CHAT_ID
