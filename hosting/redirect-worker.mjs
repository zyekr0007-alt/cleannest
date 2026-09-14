// Edge entry point for the active Cloudflare routes on both CleanNest hosts.
// Pages is the origin; the worker keeps legacy redirects without blocking
// automatic Pages deployments, and handles website enquiries so a visitor never
// has to leave the site to send one.
import {redirectTarget} from '../site/redirects.mjs';
import {enquiryFrom, enquiryTo} from '../site/forms.mjs';

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
const LIMITS = {name: 80, phone: 20, city: 80, locality: 250, notes: 1500, summary: 4000};
const MAX_SERVICES = 20;
const MAX_SERVICE_LENGTH = 80;
// Keeps the subject line short: a name is clamped to 80 chars, far too much to
// echo into a mail header.
const SUBJECT_NAME_LIMIT = 40;

// Keep line breaks (the enquiry body is prose) but drop other control characters.
const stripControls = value => String(value ?? "")
  .replace(/\r\n?/g, "\n")
  .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
const clean = (value, max) => stripControls(value).trim().slice(0, max);
// Anything interpolated into a mail header must not carry line breaks.
const headerSafe = (value, max) => clean(value, max).replace(/\s+/g, ' ').trim();

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

// Mailjet's transactional API. Chosen over Brevo because Brevo gates new accounts
// behind a discretionary manual approval before they can send at all, and stamps
// "Sent with Brevo" on free-plan email; Mailjet verifies a sender by confirmation
// link with no DNS records and no approval queue.
const MAILJET_ENDPOINT = 'https://api.mailjet.com/v3.1/send';

// Mailjet wants {Email, Name}; site/forms.mjs stays provider-neutral with
// {email, name} so swapping providers does not mean editing configuration.
const mailjetAddress = address => ({Email: address.email, Name: address.name});

export async function sendEnquiryEmail(env, {subject, text}, fetchImpl = fetch) {
  if (!env.MAILJET_API_KEY || !env.MAILJET_API_SECRET) return {ok: false, reason: 'not_configured'};

  let response;
  try {
    response = await fetchImpl(MAILJET_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + btoa(env.MAILJET_API_KEY + ':' + env.MAILJET_API_SECRET),
      },
      body: JSON.stringify({
        Messages: [{
          From: mailjetAddress(enquiryFrom),
          // Recipient comes from configuration only, never the request body. That
          // is what keeps this public endpoint from being an open mail relay.
          To: [mailjetAddress(enquiryTo)],
          Subject: subject,
          TextPart: text,
        }],
      }),
    });
  } catch (error) {
    return {ok: false, reason: 'unreachable: ' + (error?.message || 'unknown')};
  }

  // Mailjet reports per-message failures inside a 200 response, so the body has to
  // be inspected rather than trusting the status code alone.
  const payload = await response.json().catch(() => null);
  const failed = payload?.Messages?.find(message => message?.Status === 'error');
  if (response.ok && !failed) return {ok: true};

  const reason = failed?.Errors?.[0]?.ErrorCode          // per-message failure
    || payload?.ErrorCode                                 // malformed request (flat shape)
    || 'http_' + response.status;
  return {ok: false, reason: reason + ' ' + response.status};
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

  const city = clean(payload.city, LIMITS.city);
  const locality = clean(payload.locality, LIMITS.locality);
  const notes = clean(payload.notes, LIMITS.notes);
  const summary = clean(payload.summary, LIMITS.summary);
  const source = headerSafe(payload.source, 40) || 'website';
  const services = Array.isArray(payload.services)
    ? payload.services.slice(0, MAX_SERVICES).map(service => headerSafe(service, MAX_SERVICE_LENGTH)).filter(Boolean)
    : [];

  const waNumber = normalisePhone(phone);
  // Optional lines are `null` so that only they drop out — an empty string here is
  // a deliberate blank line separating the summary from the details block.
  const body = [
    summary || 'No service summary was provided.',
    '',
    '---',
    'Name: ' + name,
    'Phone: ' + phone,
    city ? 'City: ' + city : null,
    locality ? 'Locality: ' + locality : null,
    notes ? 'Notes: ' + notes : null,
    'Sent from: ' + source,
    '',
    waNumber ? 'Reply on WhatsApp: https://wa.me/' + waNumber : null,
    'Call: tel:+' + digits,
  ].filter(line => line !== null).join('\n');

  const firstName = headerSafe(name, SUBJECT_NAME_LIMIT).split(' ')[0] || 'website visitor';
  const subject = (services.length ? 'Quote request' : 'Website enquiry') + ' — ' + firstName;

  const delivery = await sendEnquiryEmail(env, {subject, text: body}, fetchImpl);
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
