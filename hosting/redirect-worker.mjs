// Edge entry point for the active Cloudflare routes on both CleanNest hosts.
// Pages is the origin; the worker keeps legacy redirects without blocking
// automatic Pages deployments, and handles website enquiries so a visitor never
// has to leave the site to send one.
import {redirectTarget} from '../site/redirects.mjs';

const pagesOrigin = 'https://cleannest.pages.dev';

function pagesRequest(request) {
  const target = new URL(request.url);
  target.protocol = 'https:';
  target.hostname = new URL(pagesOrigin).hostname;
  // Pages serves generated .html files through its clean extensionless route.
  // Keep the public .html URL and canonical metadata while avoiding a client
  // redirect away from the site's established URLs.
  if (target.pathname === '/index.html') target.pathname = '/';
  else if (target.pathname.endsWith('.html')) target.pathname = target.pathname.slice(0, -5);
  return new Request(target, request);
}

// --- Website enquiry endpoint -------------------------------------------------

const MAX_BODY_BYTES = 16384;
const LIMITS = {name: 80, phone: 20, when: 40, notes: 1500};
const MAX_SERVICES = 20;
const MAX_SERVICE_LENGTH = 80;
// The itemised receipt the visitor was shown: one line per priced row, plus the
// total and the names of anything the package already covered.
const MAX_SCOPE_LINES = 20;
const MAX_SCOPE_LENGTH = 160;
const MAX_ESTIMATE_LENGTH = 40;
const MAX_INCLUDED = 12;
// Keeps the subject line short: a name is clamped to 80 chars, far too much to
// echo into a mail header.
const SUBJECT_NAME_LIMIT = 40;

// Keep line breaks (the enquiry body is prose) but drop other control characters.
const stripControls = value => String(value ?? "")
  .replace(/\r\n?/g, "\n")
  .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
const clean = (value, max) => stripControls(value).trim().slice(0, max);
// Anything interpolated into a single-line field must not carry line breaks.
const headerSafe = (value, max) => clean(value, max).replace(/\s+/g, ' ').trim();
// The Telegram message is sent with parse_mode HTML, so customer text must be
// escaped or it could inject markup (and a stray < would make Telegram reject it).
const escapeHtml = value => String(value ?? '')
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

// Shown as plain text in contiguous E.164 form (+919812345678), which is what
// Telegram's own phone-number detection turns into a tappable "call" action.
// Deliberately unspaced: grouping digits with spaces stops the clients recognising
// it as a phone number, so it renders as inert text. An explicit <a href="tel:...">
// is accepted by the API but does not dial either.
const formatPhoneDisplay = value => {
  const digits = String(value ?? '').replace(/\D/g, '');
  return digits ? '+' + digits : '';
};

// Enquiries are local, so the stamp is rendered in IST rather than the edge's UTC —
// otherwise every notification would read five and a half hours early.
const BUSINESS_TIME_ZONE = 'Asia/Kolkata';
const ordinal = day =>
  (day % 10 === 1 && day !== 11) ? 'st'
    : (day % 10 === 2 && day !== 12) ? 'nd'
      : (day % 10 === 3 && day !== 13) ? 'rd' : 'th';

export function formatStamp(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: BUSINESS_TIME_ZONE,
    day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit', hour12: true,
  }).formatToParts(date);
  const part = type => parts.find(p => p.type === type)?.value || '';
  const day = Number(part('day'));
  const period = part('dayPeriod').toLowerCase();
  return `${day}${ordinal(day)} ${part('month')}, ${part('hour')}:${part('minute')} ${period}`;
}

const jsonResponse = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: {'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store'},
});

// wa.me needs full international digits. Indian visitors type 10-digit local numbers.
export function normalisePhone(value) {
  const digits = String(value ?? '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 10) return '91' + digits;
  if (digits.length === 11 && digits.startsWith('0')) return '91' + digits.slice(1);
  return digits;
}

export async function verifyTurnstile(token, ip, secret, fetchImpl = fetch) {
  if (!secret) return {ok: false, reason: 'not_configured'};
  if (!token) return {ok: false, reason: 'missing_token'};
  const body = new FormData();
  body.append('secret', secret);
  body.append('response', token);
  if (ip) body.append('remoteip', ip);
  try {
    const response = await fetchImpl('https://challenges.cloudflare.com/turnstile/v0/siteverify', {method: 'POST', body});
    const outcome = await response.json();
    if (outcome?.success) return {ok: true};
    const codes = Array.isArray(outcome?.['error-codes']) ? outcome['error-codes'].join(',') : '';
    return {ok: false, reason: codes || 'rejected'};
  } catch {
    return {ok: false, reason: 'unreachable'};
  }
}

// Telegram Bot API. The enquiry goes straight to the owner's phone with no message
// templates, no sender verification, no per-message fee and no DNS records, which is
// why it replaces the email transport entirely.
const TELEGRAM_API = 'https://api.telegram.org';
// Telegram rejects a message text longer than this.
const TELEGRAM_MAX_TEXT = 4096;

export async function sendEnquiryTelegram(env, {text, replyMarkup}, fetchImpl = fetch) {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return {ok: false, reason: 'not_configured'};

  let response;
  try {
    response = await fetchImpl(TELEGRAM_API + '/bot' + env.TELEGRAM_BOT_TOKEN + '/sendMessage', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        // chat_id comes from configuration only, never the request body, so this
        // public endpoint cannot be turned into a way to message arbitrary chats.
        chat_id: env.TELEGRAM_CHAT_ID,
        text: text.slice(0, TELEGRAM_MAX_TEXT),
        // HTML lets the phone number be a tappable tel: link. Every interpolated
        // value is escaped by the caller, so customer text cannot inject markup.
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        ...(replyMarkup ? {reply_markup: replyMarkup} : {}),
      }),
    });
  } catch (error) {
    return {ok: false, reason: 'unreachable: ' + (error?.message || 'unknown')};
  }

  const payload = await response.json().catch(() => null);
  if (response.ok && payload?.ok) return {ok: true};
  return {ok: false, reason: payload?.description || 'http_' + response.status};
}

export async function handleInquiry(request, env, fetchImpl = fetch) {
  if (request.method !== 'POST') return jsonResponse({error: 'method_not_allowed'}, 405);

  const declaredLength = Number(request.headers.get('content-length') || 0);
  if (declaredLength > MAX_BODY_BYTES) return jsonResponse({error: 'payload_too_large'}, 413);

  let payload;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({error: 'invalid_json'}, 400);
  }
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return jsonResponse({error: 'invalid_json'}, 400);
  }

  const verdict = await verifyTurnstile(
    clean(payload.turnstileToken, 2048),
    request.headers.get('CF-Connecting-IP'),
    env.TURNSTILE_SECRET,
    fetchImpl,
  );
  if (!verdict.ok) {
    // not_configured is a deployment state, not an attack: say so distinctly.
    const status = verdict.reason === 'not_configured' ? 503 : 403;
    console.log('inquiry rejected: turnstile ' + verdict.reason);
    return jsonResponse({error: verdict.reason === 'not_configured' ? 'not_configured' : 'captcha_failed'}, status);
  }

  const name = clean(payload.name, LIMITS.name);
  const phone = clean(payload.phone, LIMITS.phone);
  const digits = phone.replace(/\D/g, '');
  if (!name) return jsonResponse({error: 'name_required'}, 400);
  if (digits.length < 10 || digits.length > 15) return jsonResponse({error: 'phone_invalid'}, 400);

  const when = clean(payload.when, LIMITS.when);
  const note = clean(payload.notes, LIMITS.notes);
  const services = Array.isArray(payload.services)
    ? payload.services.slice(0, MAX_SERVICES).map(service => headerSafe(service, MAX_SERVICE_LENGTH)).filter(Boolean)
    : [];
  const scope = Array.isArray(payload.scope)
    ? payload.scope.slice(0, MAX_SCOPE_LINES).map(line => headerSafe(line, MAX_SCOPE_LENGTH)).filter(Boolean)
    : [];
  const included = Array.isArray(payload.included)
    ? payload.included.slice(0, MAX_INCLUDED).map(name => headerSafe(name, MAX_SERVICE_LENGTH)).filter(Boolean)
    : [];
  const estimate = headerSafe(payload.estimate, MAX_ESTIMATE_LENGTH);
  // The quote flow sends the receipt; the contact form sends only a message, and
  // older clients send bare service names. Show whichever of those arrived.
  const scopeLines = scope.length ? scope : services;

  const waNumber = normalisePhone(phone);
  // Who, how to reach them, when they want it, what they chose and for how much.
  // City, locality and page source stay out: they add noise without changing what
  // the owner does next. Every value is HTML escaped because the message is sent
  // with parse_mode HTML.
  const lines = [
    '🔔 <b>New lead</b>',
    '',
    '👤 ' + escapeHtml(headerSafe(name, SUBJECT_NAME_LIMIT)),
    '📞 ' + escapeHtml(formatPhoneDisplay(waNumber) || phone),
  ];
  if (when) lines.push('🗓️ ' + escapeHtml(when));
  if (note) lines.push('📝 ' + escapeHtml(note));
  // The receipt the visitor saw, so the owner can quote from the same numbers.
  if (scopeLines.length || estimate || included.length) {
    lines.push('', '🧾 <b>' + (estimate ? 'Estimate ' + escapeHtml(estimate) : 'Selected services') + '</b>');
    if (scopeLines.length) lines.push(...scopeLines.map(line => '• ' + escapeHtml(line)));
    if (included.length) lines.push('➕ Included: ' + escapeHtml(included.join(', ')));
  }
  // Inline in the message body. An inline_keyboard button would be rendered by
  // Telegram BELOW the message, which is not where this belongs.
  if (waNumber) lines.push('', `💬 <a href="https://wa.me/${waNumber}">Message on WhatsApp</a>`);
  lines.push('', '🕒 ' + formatStamp());
  const text = lines.join('\n');

  const delivery = await sendEnquiryTelegram(env, {text}, fetchImpl);
  if (!delivery.ok) {
    console.log('inquiry not sent: ' + delivery.reason);
    return jsonResponse({error: delivery.reason === 'not_configured' ? 'not_configured' : 'send_failed'},
      delivery.reason === 'not_configured' ? 503 : 502);
  }

  return jsonResponse({ok: true});
}

// --- WhatsApp Business Cloud API ---------------------------------------------
//
// The business number is on the WhatsApp Business app AND on the Cloud API at the
// same time (Meta "Coexistence"), so every customer chat already appears in the
// owner's app without this code doing anything. What this endpoint adds is the
// reply he cannot send while he is under a sink: a greeting the moment a message
// arrives, so a lead that comes in at 11pm is answered rather than ignored until
// morning. The owner then picks the conversation up by hand from the app.

const GRAPH_API = 'https://graph.facebook.com';
// The newest version graph.facebook.com answers on — v27.0 replies "Unknown path
// components", so v26.0 is the current one. Pinned rather than floating: Meta
// retires versions on a schedule, and a silent move could change the payload
// shape this parser depends on. Bump deliberately, with the tests re-run.
const GRAPH_VERSION = 'v26.0';
// An inbound text message is a few hundred bytes. This only bounds a hostile body.
const MAX_WEBHOOK_BYTES = 65536;

// Compares two short strings without leaking their common prefix through timing.
// Used for the verify token and the request signature, both of which are secrets.
export function safeEqual(a, b) {
  const left = String(a ?? '');
  const right = String(b ?? '');
  if (left.length !== right.length || !left.length) return false;
  let diff = 0;
  for (let index = 0; index < left.length; index += 1) diff |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return diff === 0;
}

// The one-time handshake Meta performs when the webhook URL is saved. Returns the
// challenge to echo back, or null when the request is not a valid subscription —
// note the caller must distinguish null from '', since a challenge may legitimately
// be an empty string.
export function webhookChallenge(url, verifyToken) {
  if (url.searchParams.get('hub.mode') !== 'subscribe') return null;
  if (!verifyToken) return null;
  const token = url.searchParams.get('hub.verify_token');
  if (!token || !safeEqual(token, verifyToken)) return null;
  return url.searchParams.get('hub.challenge') ?? '';
}

// Meta signs every webhook body with the app secret. Without this check the
// endpoint is a public "make CleanNest WhatsApp anyone" button, because a reply is
// sent to whatever number the payload names. Returns null when the signature is
// good, otherwise a reason.
export async function verifyWebhookSignature(rawBody, header, appSecret, cryptoImpl = crypto) {
  if (!appSecret) return 'not_configured';
  const provided = String(header ?? '');
  if (!provided.startsWith('sha256=')) return 'missing';
  const key = await cryptoImpl.subtle.importKey(
    'raw', new TextEncoder().encode(appSecret), {name: 'HMAC', hash: 'SHA-256'}, false, ['sign'],
  );
  const signature = await cryptoImpl.subtle.sign('HMAC', key, new TextEncoder().encode(rawBody));
  const expected = [...new Uint8Array(signature)].map(byte => byte.toString(16).padStart(2, '0')).join('');
  return safeEqual(expected, provided.slice('sha256='.length)) ? null : 'mismatch';
}

export async function sendWhatsAppMessage(env, {to, text}, fetchImpl = fetch) {
  if (!env.WHATSAPP_TOKEN || !env.WHATSAPP_PHONE_NUMBER_ID) return {ok: false, reason: 'not_configured'};

  let response;
  try {
    response = await fetchImpl(`${GRAPH_API}/${GRAPH_VERSION}/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json', Authorization: 'Bearer ' + env.WHATSAPP_TOKEN},
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'text',
        // A greeting is a reply inside the 24-hour window the customer's own
        // message just opened, so it needs no pre-approved template.
        text: {preview_url: false, body: text},
      }),
    });
  } catch (error) {
    return {ok: false, reason: 'unreachable: ' + (error?.message || 'unknown')};
  }

  const payload = await response.json().catch(() => null);
  if (response.ok && !payload?.error) return {ok: true};
  return {ok: false, reason: payload?.error?.message || 'http_' + response.status};
}

// The reply a customer gets, written in the voice the rest of the site uses: a
// small local team answering personally. It says nothing about being automatic and
// nothing that the handover does not keep — a person does read the thread and does
// come back with a price, which is exactly what it promises.
export const AUTO_REPLY = [
  'Hi! Thanks for messaging CleanNest 🙏',
  'Tell me what needs cleaning and which area you’re in — I’ll come back with a price and the earliest date.',
  '',
  'Rates: cleannest.in/pricing.html',
  'In a hurry? Call 76100 00654.',
].join('\n');

// A photo or voice note arrives with no text to answer, so the greeting asks for
// the one thing that turns it into a quotable job.
export const MEDIA_REPLY = [
  'Hi! Thanks for messaging CleanNest 🙏',
  'I’ve got your attachment. Tell me which area you’re in and when you’d like it done, and I’ll come back with a price.',
  '',
  'Rates: cleannest.in/pricing.html',
  'In a hurry? Call 76100 00654.',
].join('\n');

export function replyFor({text, kind}) {
  return text || kind === 'text' ? AUTO_REPLY : MEDIA_REPLY;
}

// Pulls the customer messages out of a webhook delivery. Two things are filtered
// here and both matter:
//   • `value.statuses` carries delivery receipts, not messages.
//   • Coexistence mirrors the owner's OWN replies back as `smb_message_echoes`,
//     which arrives under a different field than `messages`, so reading only
//     `messages` cannot answer the owner. The explicit self-number guard below is
//     belt-and-braces in case that ever changes.
export function inboundMessages(payload, ownNumber) {
  const self = String(ownNumber ?? '').replace(/\D/g, '');
  const found = [];
  for (const entry of payload?.entry ?? []) {
    for (const change of entry?.changes ?? []) {
      const value = change?.value;
      if (!value || !Array.isArray(value.messages)) continue;
      for (const message of value.messages) {
        const waId = String(message?.from ?? '').replace(/\D/g, '');
        if (!waId || (self && waId === self)) continue;
        const text = message?.type === 'text' ? clean(message?.text?.body, 4096) : '';
        found.push({waId, text, kind: String(message?.type ?? 'unknown'), id: String(message?.id ?? '')});
      }
    }
  }
  return found;
}

// Meta retries any webhook delivery it does not see a prompt 200 for, and a
// customer who sends three messages in a row should not get three identical
// greetings. Workers expose the Cache API with no binding and no configuration
// cost, so it is the smallest thing that can remember "already greeted this
// number". It is per-data-centre and evictable, so the guarantee is best-effort —
// a miss costs one duplicate greeting, which is why that trade is acceptable.
const SESSION_TTL_SECONDS = 60 * 60 * 24;
const sessionKey = waId => `https://cleannest.invalid/whatsapp-greeted/${waId}`;

export function cacheSessionStore(cachesImpl) {
  return {
    async has(waId) {
      try {
        return Boolean(await cachesImpl.default.match(new Request(sessionKey(waId))));
      } catch {
        return false;
      }
    },
    async set(waId) {
      try {
        await cachesImpl.default.put(new Request(sessionKey(waId)), new Response('1', {
          headers: {'Cache-Control': 'max-age=' + SESSION_TTL_SECONDS},
        }));
      } catch {
        // Losing the marker only costs one extra greeting.
      }
    },
  };
}

export async function handleWhatsApp(request, env, {fetchImpl = fetch, store} = {}) {
  const url = new URL(request.url);

  if (request.method === 'GET') {
    const challenge = webhookChallenge(url, env.WHATSAPP_VERIFY_TOKEN);
    if (challenge === null) return new Response('forbidden', {status: 403});
    return new Response(challenge, {status: 200, headers: {'Content-Type': 'text/plain; charset=utf-8'}});
  }
  if (request.method !== 'POST') return jsonResponse({error: 'method_not_allowed'}, 405);

  const declaredLength = Number(request.headers.get('content-length') || 0);
  if (declaredLength > MAX_WEBHOOK_BYTES) return jsonResponse({error: 'payload_too_large'}, 413);

  // Read as text, not json: the signature covers the exact bytes Meta sent, and
  // re-serialising a parsed object would not reproduce them.
  const raw = await request.text();
  const signature = await verifyWebhookSignature(raw, request.headers.get('X-Hub-Signature-256'), env.WHATSAPP_APP_SECRET);
  if (signature === 'not_configured') return jsonResponse({error: 'not_configured'}, 503);
  if (signature) {
    console.log('whatsapp webhook rejected: ' + signature);
    return jsonResponse({error: 'bad_signature'}, 401);
  }

  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return jsonResponse({error: 'invalid_json'}, 400);
  }

  const sessions = store ?? cacheSessionStore(caches);
  const messages = inboundMessages(payload, env.WHATSAPP_DISPLAY_NUMBER);
  let greeted = 0;
  for (const message of messages) {
    // A failed send must not burn the marker, or a customer whose greeting errored
    // would be silently skipped for the next 24 hours.
    if (await sessions.has(message.waId)) continue;
    const delivery = await sendWhatsAppMessage(env, {to: message.waId, text: replyFor(message)}, fetchImpl);
    if (!delivery.ok) {
      console.log('whatsapp reply not sent: ' + delivery.reason);
      continue;
    }
    await sessions.set(message.waId);
    greeted += 1;
  }

  // Always 200 once the signature checks out, even when a send failed. Meta retries
  // anything else, and a retry storm would send the customer the greeting again.
  return jsonResponse({ok: true, greeted});
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Both must run BEFORE redirectTarget: on the www host it returns a target for
    // every path, and a 301 would make the browser follow a POST as a GET and
    // silently drop the body.
    if (url.pathname === '/api/inquiry') return handleInquiry(request, env);
    if (url.pathname === '/api/whatsapp') return handleWhatsApp(request, env);

    const target = redirectTarget(request.url);
    if (target) return Response.redirect(target, 301);
    return fetch(pagesRequest(request));
  },
};
