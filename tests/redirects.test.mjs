import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {redirects, redirectTarget} from '../site/redirects.mjs';
import worker from '../hosting/redirect-worker.mjs';

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
      assert.ok(fs.existsSync(target === '/' ? 'index.html' : target.slice(1)));
    }
  }
});
test('unknown paths retain their intent; unrelated hosts are untouched', () => {
  assert.equal(redirectTarget('https://cleannest.in/blank-1'), null);
  assert.equal(redirectTarget('https://cleannest.in/service-page/unknown'), null);
  assert.equal(redirectTarget('https://www.cleannest.in/services.html?q=1'), 'https://cleannest.in/services.html?q=1');
  assert.equal(redirectTarget('https://example.com/index.html'), null);
});
