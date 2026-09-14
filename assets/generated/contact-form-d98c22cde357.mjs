import {submitEnquiry,failureMessage} from './enquiry-2fb83b53bf9f.mjs';

const form = document.querySelector('#contact-form');

if (form) {
  const status = document.querySelector('#contact-status');
  const button = form.querySelector('button[type="submit"]');
  let sending = false;

  const showError = message => {
    if (!status) return;
    status.innerHTML = '';
    const note = document.createElement('p');
    note.className = 'form-error';
    note.setAttribute('role', 'alert');
    note.textContent = message;
    status.append(note);
  };

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending || !form.reportValidity()) return;

    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const phone = String(data.get('phone') || '').trim();
    const message = String(data.get('message') || '').trim();
    const digits = phone.replace(/\D/g, '');

    if (!name) return showError('Please enter your name.');
    if (digits.length < 10 || digits.length > 15) return showError('Please enter a valid mobile number.');

    sending = true;
    button.disabled = true;
    button.textContent = 'Sending…';
    if (status) status.innerHTML = '';

    const outcome = await submitEnquiry({
      endpoint: form.dataset.endpoint,
      sitekey: form.dataset.turnstile || '',
      container: document.querySelector('#turnstile-slot'),
      // `notes` carries the visitor's own words, which is the whole point of this
      // form; the quote form uses the same field for its optional note.
      payload: {name, phone, notes: message, source: 'contact.html'},
    });

    sending = false;
    button.disabled = false;
    button.textContent = 'Send my message';

    if (outcome.ok) {
      form.hidden = true;
      if (status) {
        const note = document.createElement('p');
        note.className = 'sent-note';
        note.textContent = 'Thanks ' + name.split(' ')[0] + '. We’ll get back to you on ' + phone + '.';
        status.append(note);
      }
      return;
    }
    showError(failureMessage(outcome.error, outcome.status) + ' Please call or message us using the details on this page.');
  });
}
