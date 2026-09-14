// Shared client for both website enquiry forms (quote wizard and contact page).
// Deliberately dependency-free: the endpoint and Turnstile sitekey arrive as
// data attributes, so nothing here needs a build-time substitution.

const TURNSTILE_SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
// Generous on purpose: in managed mode Turnstile may show a real visitor an
// interactive challenge, and cutting them off mid-solve would fail a submission
// that was about to succeed. A hung widget still resolves via the timeout.
const TURNSTILE_TIMEOUT = 45000;

const FAILURE_MESSAGES = {
  not_configured: 'Online sending is not set up yet.',
  captcha_failed: 'We could not verify that you are human.',
  send_failed: 'Our server could not send your request just now.',
  payload_too_large: 'That request was too long.',
  name_required: 'Please enter your name.',
  phone_invalid: 'Please check your mobile number.',
  method_not_allowed: 'Sending is not available here.',
  invalid_json: 'That request could not be read.',
  network: 'We could not reach our server. Check your connection and try again.',
};

// A server that answers with a non-JSON body (an HTML error page, a bare 405 from
// a plain static server) carries no error code, so the status is all we have.
const STATUS_MESSAGES = {
  404: 'Sending is not available here.',
  405: 'Sending is not available in this preview.',
  413: 'That request was too long.',
};

export const failureMessage = (code, status) => {
  if (code && FAILURE_MESSAGES[code]) return FAILURE_MESSAGES[code];
  if (status && STATUS_MESSAGES[status]) return STATUS_MESSAGES[status];
  if (status >= 500) return 'Our server could not take your request just now.';
  if (status >= 400) return 'We could not accept that request.';
  return 'Something went wrong sending your request.';
};

let turnstileScript;
const widgets = new WeakMap();
let pending;

function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (!turnstileScript) {
    turnstileScript = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = TURNSTILE_SCRIPT;
      script.async = true;
      script.defer = true;
      script.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(Error('turnstile missing')));
      script.onerror = () => reject(Error('turnstile blocked'));
      document.head.append(script);
    });
  }
  return turnstileScript;
}

// A container can only be rendered once, so the widget is cached per element and
// re-executed for each submission. Callbacks resolve whichever request is waiting.
function widgetFor(turnstile, sitekey, container) {
  if (widgets.has(container)) return widgets.get(container);
  const id = turnstile.render(container, {
    sitekey,
    execution: 'execute',
    callback: token => pending?.(token),
    'error-callback': () => pending?.(''),
    'expired-callback': () => pending?.(''),
  });
  widgets.set(container, id);
  return id;
}

/**
 * Mint a fresh token. Turnstile tokens are single-use and expire after 300
 * seconds, so this runs per submission rather than when the widget renders.
 * Resolves to '' whenever a token cannot be obtained — including a blocked
 * script or a hung widget — and the server then decides what to do with that.
 */
async function turnstileToken(sitekey, container) {
  if (!sitekey || !container) return '';
  let turnstile;
  try {
    turnstile = await loadTurnstile();
  } catch {
    return '';
  }
  return new Promise(resolve => {
    const settle = token => {
      clearTimeout(timer);
      pending = undefined;
      resolve(token || '');
    };
    const timer = setTimeout(() => settle(''), TURNSTILE_TIMEOUT);
    pending = settle;
    try {
      const id = widgetFor(turnstile, sitekey, container);
      turnstile.reset(id);
      turnstile.execute(id);
    } catch {
      settle('');
    }
  });
}

/**
 * POST an enquiry to the Worker. Resolves to {ok:true} or {ok:false, error}.
 * One retry is attempted after a rejected token, which is safe because the
 * server only sends mail once verification has succeeded.
 */
export async function submitEnquiry({endpoint, sitekey, container, payload, fetchImpl = fetch}) {
  const attempt = async () => {
    const response = await fetchImpl(endpoint, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({...payload, turnstileToken: await turnstileToken(sitekey, container)}),
    });
    let result = {};
    try {
      result = await response.json();
    } catch {
      // A non-JSON body (an HTML error page, say) is still a failure.
    }
    return {status: response.status, result};
  };

  try {
    let outcome = await attempt();
    if (outcome.status === 403 && outcome.result?.error === 'captcha_failed') outcome = await attempt();
    if (outcome.status === 200 && outcome.result?.ok) return {ok: true};
    return {ok: false, error: outcome.result?.error, status: outcome.status};
  } catch {
    return {ok: false, error: 'network'};
  }
}
