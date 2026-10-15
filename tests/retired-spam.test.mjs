import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import worker from '../worker/index.mjs';
import { retiredPaths } from '../worker/retired-paths.mjs';

test('all seven known spam paths return 410, with and without slash or query', async () => {
  assert.equal(retiredPaths.size, 7);
  for (const path of retiredPaths) {
    for (const suffix of ['', '/', '?utm_source=legacy', '/?utm_source=legacy']) {
      for (const method of ['GET', 'HEAD']) {
        const response = await worker.fetch(
          new Request(`https://321courtierimmobilier.fr${path}${suffix}`, { method }),
          { ASSETS: { fetch() { throw new Error('Retired path reached assets'); } } },
        );
        assert.equal(response.status, 410, `${method} ${path}${suffix}`);
        assert.equal(response.headers.get('Location'), null);
        assert.equal(response.headers.get('X-Robots-Tag'), 'noindex');
        const body = await response.text();
        assert.equal(method === 'HEAD' ? body === '' : body.includes('410 Gone'), true);
      }
    }
  }
});

test('active pages, assets, unrelated unknown paths and near matches pass through', async () => {
  for (const path of [
    '/', '/blog/', '/annuaire-courtiers-pret-immobilier/',
    '/courtier-pret-immobilier-nantes/', '/courtier-pret-immobilier-rennes/',
    '/courtier-pret-immobilier-reims/', '/robots.txt', '/sitemap-index.xml',
    '/favicon.svg', '/unknown-page/', '/guppy-betina-other/', '/blog/guppy-betina/',
  ]) {
    const request = new Request(`https://321courtierimmobilier.fr${path}`);
    const upstream = new Response('Unchanged asset response', {
      status: path === '/unknown-page/' ? 404 : 200,
    });
    const response = await worker.fetch(request, {
      ASSETS: { async fetch(input) { assert.equal(input, request); return upstream; } },
    });
    assert.equal(response, upstream);
  }
});

test('Cloudflare wires the Worker to assets without changing normal routing', () => {
  const config = JSON.parse(readFileSync('wrangler.jsonc', 'utf8'));
  assert.equal(config.main, './worker/index.mjs');
  assert.equal(config.assets.binding, 'ASSETS');
  assert.equal(config.assets.not_found_handling, '404-page');
  assert.equal(config.assets.run_worker_first, undefined);
  assert.ok(existsSync(config.main));
});
