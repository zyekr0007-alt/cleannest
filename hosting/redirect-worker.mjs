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

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Must run BEFORE redirectTarget: on the www host it returns a target for
    // every path, and a 301 would make the browser follow a POST as a GET and
    // silently drop the enquiry body.
    if (url.pathname === '/api/inquiry') return handleInquiry(request, env);

    const target = redirectTarget(request.url);
    if (target) return Response.redirect(target, 301);
    return fetch(pagesRequest(request));
  },
};
