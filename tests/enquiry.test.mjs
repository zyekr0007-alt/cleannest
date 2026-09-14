import test from 'node:test';
import assert from 'node:assert/strict';
import worker, {handleInquiry, normalisePhone, verifyTurnstile, formatStamp} from '../hosting/redirect-worker.mjs';
import {redirectTarget} from '../site/redirects.mjs';

const CHAT_ID = '123456789';

const inquiryPayload = overrides => JSON.stringify({
  name: 'Ravi Kumar', phone: '98123 45678', when: 'Within 2 days',
  notes: 'Third floor, lift available', services: ['balcony-cleaning'],
  turnstileToken: 'test-token', source: 'quote.html', ...overrides,
});

// Every enquiry test needs stubbed Turnstile and Telegram calls, plus a recording
// Pages proxy so we can prove a POST body is never forwarded upstream.
function inquiryEnv({turnstile = {success: true}, telegramStatus = 200, telegramBody, send} = {}) {
  const calls = {messages: [], pagesFetchCount: 0};
  const env = {
    TURNSTILE_SECRET: 'test-secret',
    TELEGRAM_BOT_TOKEN: '123456:TEST-TOKEN',
    TELEGRAM_CHAT_ID: CHAT_ID,
  };
  const fetchImpl = async (url, init) => {
    const href = String(url);
    if (href.includes('challenges.cloudflare.com')) {
      return new Response(JSON.stringify(turnstile), {status: 200});
    }
    if (href.includes('api.telegram.org')) {
      const body = JSON.parse(init.body);
      calls.messages.push({href, body});
      if (send) return send(body, calls);
      return new Response(JSON.stringify(telegramBody ?? {ok: true, result: {message_id: 1}}), {status: telegramStatus});
    }
    throw new Error('unexpected fetch: ' + href);
  };
  return {env, calls, fetchImpl};
}

const sentText = calls => calls.messages[0].body.text;
const post = (url, body) => new Request(url, {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body,
});

test('enquiry POSTs survive the www host instead of being redirected away', async () => {
  // Precondition that makes the worker's branch ordering load-bearing: on the www
  // host redirectTarget() returns a target for EVERY path, so a POST reaching the
  // redirect branch would be answered with a 301 and the browser would follow it
  // as a GET, silently discarding the enquiry body.
  assert.ok(
    redirectTarget('https://www.cleannest.in/api/inquiry'),
    'www host is still an unconditional redirect, so /api must be branched before it'
  );

  const originalFetch = globalThis.fetch;
  const sent = [];
  const pages = [];
  globalThis.fetch = async (url, init) => {
    const href = String(url);
    if (href.includes('challenges.cloudflare.com')) return new Response(JSON.stringify({success: true}), {status: 200});
    if (href.includes('api.telegram.org')) {
      sent.push(JSON.parse(init.body));
      return new Response(JSON.stringify({ok: true, result: {message_id: 1}}), {status: 200});
    }
    pages.push(href);
    return new Response('<h1>CleanNest</h1>', {status: 200});
  };
  try {
    for (const host of ['cleannest.in', 'www.cleannest.in']) {
      sent.length = 0;
      pages.length = 0;
      const {env} = inquiryEnv();
      const response = await worker.fetch(post(`https://${host}/api/inquiry`, inquiryPayload()), env);
      assert.equal(response.status, 200, host + ' POST must reach the endpoint');
      assert.equal(sent.length, 1, host + ' enquiry must be sent to Telegram');
      assert.equal(pages.length, 0, host + ' body must not be proxied to Pages');
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('the notification leads with "New lead" and makes the phone tappable', async () => {
  const {env, calls, fetchImpl} = inquiryEnv();
  const response = await handleInquiry(post('https://cleannest.in/api/inquiry', inquiryPayload()), env, fetchImpl);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {ok: true});
  assert.equal(response.headers.get('cache-control'), 'no-store');

  const [message] = calls.messages;
  assert.match(message.href, /^https:\/\/api\.telegram\.org\/bot123456:TEST-TOKEN\/sendMessage$/);
  assert.equal(message.body.chat_id, CHAT_ID, 'chat id is pinned by config, never the request');
  assert.equal(message.body.parse_mode, 'HTML', 'HTML is what makes the phone tappable');
  assert.equal(message.body.disable_web_page_preview, true);

  const lines = sentText(calls).split('\n');
  assert.deepEqual(lines.slice(0, 8), [
    '\u{1F514} <b>New lead</b>',
    '',
    '\u{1F464} Ravi Kumar',
    // Plain international form: Telegram's own detection makes it tappable to call.
    '\u{1F4DE} +919812345678',
    '\u{1F5D3}\u{FE0F} Within 2 days',
    '\u{1F4DD} Third floor, lift available',
    '',
    '\u{1F4AC} <a href="https://wa.me/919812345678">Message on WhatsApp</a>',
  ]);
  assert.equal(lines[8], '');
  assert.match(lines[9], /^\u{1F552} \d{1,2}(st|nd|rd|th) [A-Z][a-z]+, \d{1,2}:\d{2} (am|pm)$/u, 'stamp is the last line');
  // The WhatsApp link lives inside the message, not on a button below it.
  assert.equal(message.body.reply_markup, undefined);
  assert.doesNotMatch(sentText(calls), /tel:/, 'no tel: anchor - it does not dial in the clients');
});

test('customer text is HTML-escaped so it cannot inject markup', async () => {
  const {env, calls, fetchImpl} = inquiryEnv();
  await handleInquiry(post('https://cleannest.in/api/inquiry', inquiryPayload({
    name: '<b>bold</b> & <script>', when: '<i>x</i>', notes: 'a<b>c</b> & d',
  })), env, fetchImpl);
  const text = sentText(calls);
  assert.match(text, /\u{1F464} &lt;b&gt;bold&lt;\/b&gt; &amp; &lt;script&gt;/u);
  assert.match(text, /\u{1F5D3}\u{FE0F} &lt;i&gt;x&lt;\/i&gt;/u);
  assert.match(text, /\u{1F4DD} a&lt;b&gt;c&lt;\/b&gt; &amp; d/u);
  assert.doesNotMatch(text, /<script>|<b>bold/, 'no live markup from customer input');
});

test('the receipt, city, locality and page source are NOT repeated in the message', async () => {
  const {env, calls, fetchImpl} = inquiryEnv();
  await handleInquiry(post('https://cleannest.in/api/inquiry', inquiryPayload({
    city: 'Jalandhar', locality: 'Model Town',
    summary: 'Estimated price ₹9,500 – ₹11,900\n• Full home: 2 BHK — ₹9,500',
  })), env, fetchImpl);
  const text = sentText(calls);
  assert.doesNotMatch(text, /Jalandhar|Model Town/, 'location fields are dropped');
  assert.doesNotMatch(text, /9,500|Estimate|Estimated/, 'the estimate receipt is dropped');
  assert.doesNotMatch(text, /quote\.html|Sent from/, 'the page source is dropped');
});

test('a missing preferred date or note simply omits those lines', async () => {
  const {env, calls, fetchImpl} = inquiryEnv();
  // No services => the contact form's wording, which also exercises the other headline.
  await handleInquiry(post('https://cleannest.in/api/inquiry',
    inquiryPayload({when: '', notes: '', services: []})), env, fetchImpl);
  const lines = sentText(calls).split('\n');
  assert.deepEqual(lines.slice(0, 4), [
    '\u{1F514} <b>New lead</b>', '', '\u{1F464} Ravi Kumar', '\u{1F4DE} +919812345678',
  ]);
  assert.ok(!sentText(calls).includes('\u{1F5D3}'), 'no date line when none given');
  assert.ok(!sentText(calls).includes('\u{1F4DD}'), 'no note line when none given');
});

test('the Telegram chat is never taken from the request body', async () => {
  const {env, calls, fetchImpl} = inquiryEnv();
  await handleInquiry(post('https://cleannest.in/api/inquiry', inquiryPayload({
    chat_id: '999999', chatId: '999999', to: 'attacker', recipient: '999999',
  })), env, fetchImpl);
  assert.equal(calls.messages.length, 1);
  assert.equal(calls.messages[0].body.chat_id, CHAT_ID);
  assert.doesNotMatch(JSON.stringify(calls.messages[0].body.chat_id), /999999/);
});

test('the message is clamped to the Telegram 4096 character limit', async () => {
  const {env, calls, fetchImpl} = inquiryEnv();
  const response = await handleInquiry(post('https://cleannest.in/api/inquiry', inquiryPayload({
    name: 'A'.repeat(500), notes: 'B'.repeat(9000), when: 'C'.repeat(500),
    services: Array.from({length: 50}, (_, i) => 'service-' + i),
  })), env, fetchImpl);
  assert.equal(response.status, 200, 'over-long input is clamped, not rejected');
  const text = sentText(calls);
  assert.ok(text.length <= 4096, 'message must fit Telegram, got ' + text.length);
  assert.match(text, /^\u{1F4DE} \+919812345678$/mu, 'and still carry the essentials');
});

test('enquiry rejections are specific and never send', async () => {
  const cases = [
    ['GET is not allowed', new Request('https://cleannest.in/api/inquiry'), 405, 'method_not_allowed'],
    ['malformed json', post('https://cleannest.in/api/inquiry', '{not json'), 400, 'invalid_json'],
    ['missing name', post('https://cleannest.in/api/inquiry', inquiryPayload({name: '   '})), 400, 'name_required'],
    ['short phone', post('https://cleannest.in/api/inquiry', inquiryPayload({phone: '12345'})), 400, 'phone_invalid'],
    ['failed captcha', post('https://cleannest.in/api/inquiry', inquiryPayload()), 403, 'captcha_failed'],
  ];
  for (const [label, request, status, error] of cases) {
    const {env, calls, fetchImpl} = inquiryEnv({
      turnstile: label === 'failed captcha' ? {success: false, 'error-codes': ['invalid-input-response']} : {success: true},
    });
    const response = await handleInquiry(request, env, fetchImpl);
    assert.equal(response.status, status, label);
    assert.equal((await response.json()).error, error, label);
    assert.equal(calls.messages.length, 0, label + ' must not send');
  }
});

test('a name carrying newlines cannot forge extra message lines', async () => {
  const {env, calls, fetchImpl} = inquiryEnv();
  await handleInquiry(post('https://cleannest.in/api/inquiry', inquiryPayload({
    name: 'Ravi\nWhen: Immediately\nPhone: 999',
  })), env, fetchImpl);
  const lines = sentText(calls).split('\n');
  assert.equal(lines[0], '\u{1F514} <b>New lead</b>');
  assert.equal(lines[2], '\u{1F464} Ravi When: Immediately Phone: 999', 'the name collapses to one sanitised line');
  assert.equal(lines[3], '\u{1F4DE} +919812345678', 'the real phone line is intact');
  assert.equal(lines[4], '\u{1F5D3}\u{FE0F} Within 2 days', 'and the real preferred date is intact');
});

test('transport failures and unconfigured credentials are reported distinctly', async () => {
  // Telegram reports failure in the body with a 200/4xx, so the payload must be
  // inspected rather than trusting the status code alone.
  const apiError = inquiryEnv({telegramStatus: 200, telegramBody: {ok: false, description: 'chat not found'}});
  const rejected = await handleInquiry(post('https://cleannest.in/api/inquiry', inquiryPayload()), apiError.env, apiError.fetchImpl);
  assert.equal(rejected.status, 502, 'ok:false in a 200 response is still a failure');
  assert.equal((await rejected.json()).error, 'send_failed');

  const unauthorised = inquiryEnv({telegramStatus: 401, telegramBody: {ok: false, description: 'Unauthorized'}});
  const bad = await handleInquiry(post('https://cleannest.in/api/inquiry', inquiryPayload()), unauthorised.env, unauthorised.fetchImpl);
  assert.equal(bad.status, 502);

  const network = inquiryEnv({send: () => { throw new Error('socket closed'); }});
  const unreachable = await handleInquiry(post('https://cleannest.in/api/inquiry', inquiryPayload()), network.env, network.fetchImpl);
  assert.equal(unreachable.status, 502);

  const {env, fetchImpl} = inquiryEnv();
  delete env.TELEGRAM_BOT_TOKEN;
  const unconfigured = await handleInquiry(post('https://cleannest.in/api/inquiry', inquiryPayload()), env, fetchImpl);
  assert.equal(unconfigured.status, 503);
  assert.equal((await unconfigured.json()).error, 'not_configured');
});

test('turnstile verification distinguishes configuration from a bad token', async () => {
  assert.deepEqual(await verifyTurnstile('token', null, undefined), {ok: false, reason: 'not_configured'});
  assert.deepEqual(await verifyTurnstile('', null, 'secret'), {ok: false, reason: 'missing_token'});
  const unreachable = await verifyTurnstile('token', null, 'secret', async () => { throw new Error('offline'); });
  assert.equal(unreachable.reason, 'unreachable');
  const rejected = await verifyTurnstile('token', null, 'secret',
    async () => new Response(JSON.stringify({success: false, 'error-codes': ['timeout-or-duplicate']}), {status: 200}));
  assert.deepEqual(rejected, {ok: false, reason: 'timeout-or-duplicate'});
});

test('phone numbers are normalised to wa.me international form', () => {
  assert.equal(normalisePhone('98123 45678'), '919812345678');
  assert.equal(normalisePhone('+919812345678'), '919812345678');
  assert.equal(normalisePhone('098123 45678'), '919812345678');
  assert.equal(normalisePhone('(981) 234-5678'), '919812345678');
  assert.equal(normalisePhone('nonsense'), '');
});

test('the stamp is rendered in IST with an ordinal day', () => {
  // The edge runs in UTC, so without the timezone these would read 5h30m early.
  assert.equal(formatStamp(new Date('2026-11-01T10:15:00Z')), '1st November, 3:45 pm');
  assert.equal(formatStamp(new Date('2026-11-02T09:35:00Z')), '2nd November, 3:05 pm');
  assert.equal(formatStamp(new Date('2026-11-03T02:00:00Z')), '3rd November, 7:30 am');
  // 21:05 UTC is already the next day in IST.
  assert.equal(formatStamp(new Date('2026-11-02T21:05:00Z')), '3rd November, 2:35 am');
  // The teens are all "th" even though they end in 1, 2 and 3.
  assert.equal(formatStamp(new Date('2026-11-11T10:00:00Z')), '11th November, 3:30 pm');
  assert.equal(formatStamp(new Date('2026-11-12T10:00:00Z')), '12th November, 3:30 pm');
  assert.equal(formatStamp(new Date('2026-11-13T10:00:00Z')), '13th November, 3:30 pm');
  assert.equal(formatStamp(new Date('2026-11-21T10:00:00Z')), '21st November, 3:30 pm');
});
