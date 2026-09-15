# Redirect deployment

Current production: Cloudflare Pages project `cleannest`, connected to the
GitHub `main` branch, with `cleannest.pages.dev` as the origin. The active
Cloudflare Worker routes both public CleanNest hosts so legacy paths can keep
their 301 redirects while normal requests reach the current Pages deployment.

## Deploying

Publish the site by pushing to `main`. Cloudflare Pages builds it with
`npm run build`, and both public hosts follow automatically, because the Worker
proxies to the Pages origin rather than serving files of its own.

The Worker itself deploys from the repository root with `npx wrangler deploy`.

**Never deploy this Worker with an `--assets` flag.** `wrangler.jsonc` declares
no assets binding, and the Worker's whole job is to forward to
`cleannest.pages.dev`. Uploading a local build as Worker assets shadows the
Pages origin: `cleannest.in` then serves that frozen snapshot and stops tracking
`main`, while `cleannest.pages.dev` keeps updating — the two hosts diverge
silently, and a cache purge exposes the stale one rather than fixing it. That
happened on 13 September 2026 and served a day-old build from the public host.

`redirect-worker.mjs` is a prepared edge entry point using the exact mappings in
`site/redirects.mjs`. It combines host and path normalization into one 301 and
preserves query strings. Unmatched paths pass through; it does not send unknown
pages to the homepage. Tests cover the mapping independently of a provider.

## Endpoints the Worker serves

Two API paths are handled before the redirect table, because `redirectTarget`
returns a target for every path on the `www` host and a 301 would make the
browser follow a POST as a GET and silently drop the body.

| Path | Purpose | Auth |
| --- | --- | --- |
| `POST /api/inquiry` | Website enquiry → the owner's Telegram | Cloudflare Turnstile token |
| `GET /api/whatsapp` | Meta webhook verification handshake | `WHATSAPP_VERIFY_TOKEN` |
| `POST /api/whatsapp` | Inbound WhatsApp message → greeting | `X-Hub-Signature-256` HMAC |

### WhatsApp

The business number stays on the WhatsApp Business app **and** joins the Cloud
API at the same time (Meta calls this Coexistence), so customer chats already
appear in the owner's app without any of this code. What the endpoint adds is the
greeting he cannot send while he is under a sink: the first message from a number
is answered once, and repeats within 24 hours are ignored. The owner then picks
the conversation up by hand from the app.

Three behaviours are load-bearing and each has a test:

- **Every delivery is signature-checked.** The reply goes to whatever number the
  payload names, so without the HMAC check this endpoint is a public "make
  CleanNest WhatsApp anyone" button. An unsigned body is a 401.
- **The owner is never answered.** Coexistence mirrors the owner's own replies
  back as `smb_message_echoes`, a different field from `messages`, so reading only
  `messages` cannot greet him. Two tests pin this.
- **A failed send returns 200 anyway.** Meta retries any other status, and a
  retry would greet the customer twice. The 24-hour marker is only written after
  a send succeeds, so a failure stays retryable rather than being silently spent.

The greeting copy lives in `AUTO_REPLY` / `MEDIA_REPLY` in `redirect-worker.mjs`.
It is written in the site's voice — a small local team answering personally — and
says nothing about being automatic. It is customer-facing text sent under the
owner's name: get his approval before changing the wording.

Storage note: the once-per-24-hours marker uses the Workers Cache API rather than
KV, so the Worker needs no binding and no extra Cloudflare resource. It is
per-data-centre and evictable, so the guarantee is best-effort — a miss costs one
duplicate greeting, which is why that trade is acceptable.

### Setting up the WhatsApp side

The account work is done once, in Meta's own tools; the Worker only needs the
four secrets listed in `wrangler.jsonc`. In outline: create a Meta Business
Portfolio, confirm the number is on the **WhatsApp Business app** (Coexistence
requires the Business app, not consumer WhatsApp), connect the existing number via
Embedded Signup with Coexistence selected, then point the webhook at
`https://cleannest.in/api/whatsapp` with the verify token you set, and subscribe
to the `messages` field.

**A payment method must be on file with Meta by 30 September 2026.** Meta begins
charging for service messages on 1 October 2026, and stops delivering them for
accounts with no payment method. This is a hard external deadline and it is the
reason the setup cannot be deferred.

Cloudflare configuration is defined in `wrangler.jsonc`. It deploys the worker
to both apex and `www` routes while forwarding unmatched requests to the Pages
origin. Verify `/`, every mapping (with a query string), and both hosts using
HTTP headers after nameserver activation. The destination must return 200 with
a self-canonical URL.

The search-visible `/service-page/room-deep-clean` path is mapped to the closest
current service, `/full-house-cleaning.html`. The other exact legacy paths in
the Phase 1 recovery table are covered and query strings are retained.

Held mapping: `/blank-1` has no current accessibility-page equivalent. Leave it
unmapped until the owner supplies an equivalent page or confirms the intended
policy. Do not send it, or unknown `/service-page/...` paths, to the homepage.

Caching: current Pages HTML/assets advertise a 600-second cache. Configure
compression and immutable caching only for content-hashed assets at the chosen
edge; keep HTML revalidated. Do not mark mutable asset filenames immutable.

Gzip was confirmed on the current live CSS response. The new local preview
uses gzip to make lab transfer measurements more representative; this does not
change production cache headers. See GitHub's [static hosting description](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)
and [custom-domain redirect behavior](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/about-custom-domains-and-github-pages).
