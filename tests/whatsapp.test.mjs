import test from 'node:test';
import assert from 'node:assert/strict';
import worker, {
  handleWhatsApp, webhookChallenge, verifyWebhookSignature, inboundMessages,
  replyFor, safeEqual, AUTO_REPLY, MEDIA_REPLY,
} from '../hosting/redirect-worker.mjs';

const APP_SECRET = 'test-app-secret';
const VERIFY_TOKEN = 'test-verify-token';
const OWN_NUMBER = '917610000654';
const CUSTOMER = '919812345678';

// Signs a body exactly the way Meta does, so the tests exercise the real check
// rather than a stub of it.
async function sign(body, secret = APP_SECRET) {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret), {name: 'HMAC', hash: 'SHA-256'}, false, ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body));
  return 'sha256=' + [...new Uint8Array(signature)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

const message = ({from = CUSTOMER, type = 'text', body = 'Need a deep clean'} = {}) => ({
  object: 'whatsapp_business_account',
  entry: [{
    id: 'WABA_ID',
    changes: [{
      field: 'messages',
      value: {
        messaging_product: 'whatsapp',
        metadata: {display_phone_number: OWN_NUMBER, phone_number_id: '1234567890'},
        contacts: [{profile: {name: 'Ravi'}, wa_id: from}],
        messages: [{
          from, id: 'wamid.TEST', timestamp: '1700000000', type,
          ...(type === 'text' ? {text: {body}} : {image: {id: 'media-1', mime_type: 'image/jpeg'}}),
        }],
      },
    }],
  }],
});

// The owner's own reply, echoed back by Coexistence under its own field.
const echo = () => ({
  object: 'whatsapp_business_account',
  entry: [{id: 'WABA_ID', changes: [{field: 'smb_message_echoes', value: {
    messaging_product: 'whatsapp',
    metadata: {display_phone_number: OWN_NUMBER, phone_number_id: '1234567890'},
    message_echoes: [{from: OWN_NUMBER, id: 'wamid.ECHO', type: 'text', text: {body: 'On my way'}}],
  }}]}],
});

const statuses = () => ({
  object: 'whatsapp_business_account',
  entry: [{id: 'WABA_ID', changes: [{field: 'messages', value: {
    messaging_product: 'whatsapp',
    metadata: {display_phone_number: OWN_NUMBER, phone_number_id: '1234567890'},
    statuses: [{id: 'wamid.TEST', status: 'delivered', recipient_id: CUSTOMER}],
  }}]}],
});

const memoryStore = () => {
  const seen = new Set();
  return {seen, has: async key => seen.has(key), set: async key => void seen.add(key)};
};

function whatsappEnv(overrides = {}) {
  const calls = {messages: []};
  const env = {
    WHATSAPP_TOKEN: 'EAAG-test-token',
    WHATSAPP_PHONE_NUMBER_ID: '1234567890',
    WHATSAPP_APP_SECRET: APP_SECRET,
    WHATSAPP_VERIFY_TOKEN: VERIFY_TOKEN,
    WHATSAPP_DISPLAY_NUMBER: OWN_NUMBER,
    ...overrides,
  };
  const fetchImpl = async (url, init) => {
    const href = String(url);
    if (href.includes('graph.facebook.com')) {
      calls.messages.push({href, body: JSON.parse(init.body), auth: init.headers.Authorization});
      return new Response(JSON.stringify({messaging_product: 'whatsapp', messages: [{id: 'wamid.OUT'}]}), {status: 200});
    }
    throw new Error('unexpected fetch: ' + href);
  };
  return {env, calls, fetchImpl};
}

const deliver = (payload, {signature, method = 'POST'} = {}) => new Request('https://cleannest.in/api/whatsapp', {
  method,
  headers: signature ? {'X-Hub-Signature-256': signature} : {},
  body: method === 'POST' ? payload : undefined,
});

const send = async (payload, {env, calls, fetchImpl} = whatsappEnv(), options = {}) => {
  const body = JSON.stringify(payload);
  return handleWhatsApp(deliver(body, {signature: await sign(body), ...options}), env, {
    fetchImpl, store: memoryStore(),
  });
};

// --- handshake ----------------------------------------------------------------

test('webhook handshake echoes the challenge for the configured token', async () => {
  const {env, fetchImpl} = whatsappEnv();
  const url = new URL(`https://cleannest.in/api/whatsapp?hub.mode=subscribe&hub.verify_token=${VERIFY_TOKEN}&hub.challenge=abc123`);
  const response = await handleWhatsApp(new Request(url), env, {fetchImpl});
  assert.equal(response.status, 200);
  assert.equal(await response.text(), 'abc123');
});

test('webhook handshake refuses a wrong or missing token', () => {
  const good = new URL('https://cleannest.in/api/whatsapp?hub.mode=subscribe&hub.verify_token=wrong&hub.challenge=abc');
  assert.equal(webhookChallenge(good, VERIFY_TOKEN), null);
  const absent = new URL('https://cleannest.in/api/whatsapp?hub.mode=subscribe&hub.challenge=abc');
  assert.equal(webhookChallenge(absent, VERIFY_TOKEN), null);
  const wrongMode = new URL(`https://cleannest.in/api/whatsapp?hub.mode=unsubscribe&hub.verify_token=${VERIFY_TOKEN}&hub.challenge=abc`);
  assert.equal(webhookChallenge(wrongMode, VERIFY_TOKEN), null);
  // An unset verify token must never let a subscription through.
  assert.equal(webhookChallenge(good, undefined), null);
});

test('an empty challenge is echoed, not read as a rejection', async () => {
  const {env, fetchImpl} = whatsappEnv();
  const url = new URL(`https://cleannest.in/api/whatsapp?hub.mode=subscribe&hub.verify_token=${VERIFY_TOKEN}&hub.challenge=`);
  const response = await handleWhatsApp(new Request(url), env, {fetchImpl});
  assert.equal(response.status, 200);
  assert.equal(await response.text(), '');
});

test('GET with a bad token is 403, not a 200 with a body', async () => {
  const {env, fetchImpl} = whatsappEnv();
  const url = new URL('https://cleannest.in/api/whatsapp?hub.mode=subscribe&hub.verify_token=nope&hub.challenge=abc');
  const response = await handleWhatsApp(new Request(url), env, {fetchImpl});
  assert.equal(response.status, 403);
});

// --- signature ----------------------------------------------------------------

test('an unsigned webhook body is rejected', async () => {
  const {env, fetchImpl} = whatsappEnv();
  const response = await handleWhatsApp(deliver(JSON.stringify(message())), env, {fetchImpl, store: memoryStore()});
  assert.equal(response.status, 401);
});

test('a body signed with the wrong secret is rejected', async () => {
  const body = JSON.stringify(message());
  const {env, calls, fetchImpl} = whatsappEnv();
  const response = await handleWhatsApp(deliver(body, {signature: await sign(body, 'not-the-secret')}), env, {
    fetchImpl, store: memoryStore(),
  });
  assert.equal(response.status, 401);
  assert.equal(calls.messages.length, 0, 'a forged payload must never reach the send path');
});

test('an unset app secret is reported as configuration, not as a bad signature', async () => {
  const {env, fetchImpl} = whatsappEnv({WHATSAPP_APP_SECRET: undefined});
  const response = await handleWhatsApp(deliver(JSON.stringify(message())), env, {fetchImpl, store: memoryStore()});
  assert.equal(response.status, 503);
});

test('the signature is checked over the exact bytes received', async () => {
  const body = JSON.stringify(message());
  assert.equal(await verifyWebhookSignature(body, await sign(body), APP_SECRET), null);
  // Same payload, one byte different: the check must not survive a re-encode.
  assert.equal(await verifyWebhookSignature(body + ' ', await sign(body), APP_SECRET), 'mismatch');
  assert.equal(await verifyWebhookSignature(body, 'sha256=deadbeef', APP_SECRET), 'mismatch');
  assert.equal(await verifyWebhookSignature(body, undefined, APP_SECRET), 'missing');
});

test('safeEqual compares without a length-free shortcut', () => {
  assert.equal(safeEqual('abc', 'abc'), true);
  assert.equal(safeEqual('abc', 'abd'), false);
  assert.equal(safeEqual('abc', 'abcd'), false);
  assert.equal(safeEqual('', ''), false);
  assert.equal(safeEqual(undefined, undefined), false);
});

// --- replies ------------------------------------------------------------------

test('a customer text message gets the greeting', async () => {
  const {env, calls, fetchImpl} = whatsappEnv();
  const response = await handleWhatsApp(
    deliver(JSON.stringify(message()), {signature: await sign(JSON.stringify(message()))}),
    env, {fetchImpl, store: memoryStore()},
  );
  assert.equal(response.status, 200);
  assert.equal(calls.messages.length, 1);
  assert.equal(calls.messages[0].body.to, CUSTOMER);
  assert.equal(calls.messages[0].body.text.body, AUTO_REPLY);
  assert.equal(calls.messages[0].body.type, 'text');
  assert.equal(calls.messages[0].auth, 'Bearer EAAG-test-token');
  assert.match(calls.messages[0].href, /graph\.facebook\.com\/v26\.0\/1234567890\/messages$/);
});

test('a second message from the same number is not greeted again', async () => {
  const {env, calls, fetchImpl} = whatsappEnv();
  const store = memoryStore();
  const body = JSON.stringify(message());
  for (let index = 0; index < 3; index += 1) {
    await handleWhatsApp(deliver(body, {signature: await sign(body)}), env, {fetchImpl, store});
  }
  assert.equal(calls.messages.length, 1, 'three messages in one window must produce one greeting');
  assert.equal(store.seen.size, 1);
});

test('a failed send does not burn the marker, so the next message retries', async () => {
  const {env} = whatsappEnv();
  const store = memoryStore();
  const body = JSON.stringify(message());
  const failing = async () => new Response(JSON.stringify({error: {message: 'rate limited'}}), {status: 429});

  const first = await handleWhatsApp(deliver(body, {signature: await sign(body)}), env, {fetchImpl: failing, store});
  assert.equal(first.status, 200, 'Meta must still see a 200 or it retries the whole delivery');
  assert.equal(store.seen.size, 0, 'the customer was never greeted, so the window must stay open');

  let sent = 0;
  const working = async () => {
    sent += 1;
    return new Response(JSON.stringify({messages: [{id: 'wamid.OUT'}]}), {status: 200});
  };
  await handleWhatsApp(deliver(body, {signature: await sign(body)}), env, {fetchImpl: working, store});
  assert.equal(sent, 1);
});

test('a media message gets the variant that asks for the missing detail', async () => {
  const harness = whatsappEnv();
  await send(message({type: 'image'}), harness);
  assert.equal(harness.calls.messages.length, 1);
  assert.equal(harness.calls.messages[0].body.text.body, MEDIA_REPLY);
});

test('replyFor picks by message type', () => {
  assert.equal(replyFor({text: 'hello', kind: 'text'}), AUTO_REPLY);
  assert.equal(replyFor({text: '', kind: 'image'}), MEDIA_REPLY);
  assert.equal(replyFor({text: '', kind: 'audio'}), MEDIA_REPLY);
});

// --- what must NOT be answered ------------------------------------------------

test('the owner is never answered by the bot', async () => {
  const harness = whatsappEnv();
  await send(echo(), harness);
  assert.equal(harness.calls.messages.length, 0, 'an echoed owner reply must not trigger a greeting');
});

test('delivery receipts are not messages', async () => {
  const harness = whatsappEnv();
  await send(statuses(), harness);
  assert.equal(harness.calls.messages.length, 0);
});

test('a message from the business number itself is ignored', () => {
  assert.deepEqual(inboundMessages(message({from: OWN_NUMBER}), OWN_NUMBER), []);
  assert.equal(inboundMessages(message(), OWN_NUMBER).length, 1);
});

test('a malformed payload is a 400, not a crash', async () => {
  const {env, fetchImpl} = whatsappEnv();
  const body = 'not json';
  const response = await handleWhatsApp(deliver(body, {signature: await sign(body)}), env, {fetchImpl, store: memoryStore()});
  assert.equal(response.status, 400);
});

test('an unexpected shape yields no recipients rather than throwing', () => {
  assert.deepEqual(inboundMessages({}, OWN_NUMBER), []);
  assert.deepEqual(inboundMessages(null, OWN_NUMBER), []);
  assert.deepEqual(inboundMessages({entry: [{changes: [{value: {}}]}]}, OWN_NUMBER), []);
});

// --- routing ------------------------------------------------------------------

test('the worker routes /api/whatsapp and needs no configuration to stay inert', async () => {
  const response = await worker.fetch(new Request('https://cleannest.in/api/whatsapp'), {});
  assert.equal(response.status, 403, 'an unconfigured deployment refuses subscriptions rather than accepting them');
});

test('PUT is rejected', async () => {
  const {env, fetchImpl} = whatsappEnv();
  const response = await handleWhatsApp(new Request('https://cleannest.in/api/whatsapp', {method: 'PUT'}), env, {fetchImpl});
  assert.equal(response.status, 405);
});
