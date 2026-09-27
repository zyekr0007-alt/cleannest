import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {redirects, redirectTarget, PROTECTED_HTML} from '../site/redirects.mjs';
import worker from '../hosting/redirect-worker.mjs';

// Every page is still a real foo.html file on disk; a redirect target of /foo
// must resolve to that file, not to a literal extensionless one.
const fileFor = target => target === '/' ? 'index.html' : target.slice(1) + '.html';

test('legacy paths and host normalization use one redirect and preserve queries', async () => {
  for (const [path, target] of Object.entries(redirects)) {
    for (const host of ['cleannest.in', 'www.cleannest.in']) {
      const url = `https://${host}${path}?utm_source=legacy&service=kitchen`;
      const expected = `https://cleannest.in${target}?utm_source=legacy&service=kitchen`;
      assert.equal(redirectTarget(url), expected);
      const response = await worker.fetch(new Request(url));
      assert.equal(response.status, 301);
      assert.equal(response.headers.get('location'), expected);
      assert.equal(redirectTarget(expected), null, 'no canonical loop');
      assert.ok(fs.existsSync(fileFor(target)), fileFor(target));
    }
  }
});
test('unknown paths retain their intent; unrelated hosts are untouched', () => {
  // This fixture used to be /blank-1, which was itself an unmapped Wix legacy
  // path: the test was asserting that a real redirect gap behaved like a
  // deliberately unknown path, so it passed while www.cleannest.in/blank-1 was
  // 301ing into a 404. Any fixture here must be a path that cannot become a
  // legacy redirect, or it will quietly excuse the next gap the same way.
  assert.equal(redirectTarget('https://cleannest.in/no-such-page-xyz'), null);
  assert.equal(redirectTarget('https://cleannest.in/service-page/unknown'), null);
  assert.equal(redirectTarget('https://www.cleannest.in/services?q=1'), 'https://cleannest.in/services?q=1');
  assert.equal(redirectTarget('https://example.com/index.html'), null);
});
test('a real page requested with its old .html URL gets one redirect to the clean URL', () => {
  for (const [path, target] of [
    ['/sofa-cleaning.html', '/sofa-cleaning'],
    ['/pricing.html', '/pricing'],
    ['/blog/ultimate-deep-cleaning-checklist.html', '/blog/ultimate-deep-cleaning-checklist'],
  ]) {
    assert.equal(redirectTarget('https://cleannest.in' + path), 'https://cleannest.in' + target);
    assert.ok(fs.existsSync(fileFor(target)), fileFor(target));
    assert.equal(redirectTarget('https://cleannest.in' + target), null, 'the clean URL itself must not redirect');
  }
});
test('www plus an old .html URL collapses to a single redirect, not a chain', () => {
  assert.equal(redirectTarget('https://www.cleannest.in/sofa-cleaning.html'), 'https://cleannest.in/sofa-cleaning');
});
test('the Meta domain-verification file is never redirected off its literal .html URL', () => {
  assert.equal(redirectTarget('https://cleannest.in' + PROTECTED_HTML), null);
  assert.equal(redirectTarget('https://www.cleannest.in' + PROTECTED_HTML), 'https://cleannest.in' + PROTECTED_HTML);
});
