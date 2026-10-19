import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import worker from '../worker/index.mjs';

const fetchWithStatus = async (path, upstreamStatus, method = 'GET') => {
  const request = new Request(`https://321courtierimmobilier.fr${path}`, { method });
  const upstream = new Response(method === 'HEAD' ? null : 'Upstream response', {
    status: upstreamStatus,
  });
  const response = await worker.fetch(request, {
    ASSETS: {
      async fetch(input) {
        assert.equal(input, request);
        return upstream;
      },
    },
  });
  return { response, upstream };
};

test('HTTP requests permanently redirect to the exact canonical HTTPS URL', async () => {
  for (const path of ['/', '/blog/', '/blog/pret-immobilier/?utm_source=test']) {
    const request = new Request(`http://321courtierimmobilier.fr${path}`);
    const response = await worker.fetch(request, {
      ASSETS: {
        fetch() {
          throw new Error('HTTP request reached assets');
        },
      },
    });
    assert.equal(response.status, 308);
    assert.equal(
      response.headers.get('Location'),
      `https://321courtierimmobilier.fr${path}`,
    );
  }
});

test('all real HTTPS site pages and required assets keep their upstream response', async () => {
  const livePaths = [
    '/',
    '/blog/',
    '/blog/comment-fonctionne-courtier-pret-immobilier/',
    '/blog/comment-trouver-un-courtier-immobilier/',
    '/blog/courtier-immobilier-c-est-quoi/',
    '/blog/courtier-ou-banque-pret-immobilier/',
    '/blog/pret-immobilier/',
    '/blog/role-courtier-pret-immobilier/',
    '/a-propos/',
    '/annuaire-courtiers-pret-immobilier/',
    '/trouver-mon-courtier/',
    '/mentions-legales/',
    '/politique-confidentialite/',
    '/plan-du-site/',
    '/courtier-pret-immobilier-nantes/',
    '/robots.txt',
    '/sitemap-index.xml',
    '/favicon.svg',
    '/_astro/article.ABC123.css',
  ];

  for (const path of livePaths) {
    for (const method of ['GET', 'HEAD']) {
      const { response, upstream } = await fetchWithStatus(path, 200, method);
      assert.equal(response, upstream, `${method} ${path}`);
      assert.equal(response.status, 200, `${method} ${path}`);
    }
  }
});

test('every missing legacy, spam or unknown HTTPS URL becomes 410', async () => {
  const missingPaths = [
    '/asianbookie5/',
    '/terapi-farmakologi-gagal-ginjal/',
    '/buku-mimpi-menangis/',
    '/url-absente-du-fichier/',
    '/category/spam-inconnue/',
    '/wp-content/uploads/ancienne-image.jpg',
    '/blog/faux-article/',
  ];

  for (const path of missingPaths) {
    for (const method of ['GET', 'HEAD']) {
      const { response } = await fetchWithStatus(path, 404, method);
      assert.equal(response.status, 410, `${method} ${path}`);
      assert.equal(response.headers.get('Location'), null);
      assert.equal(response.headers.get('X-Robots-Tag'), 'noindex');
      const body = await response.text();
      assert.equal(method === 'HEAD' ? body === '' : body.includes('410 Gone'), true);
    }
  }
});

test('non-404 HTTPS upstream statuses are never rewritten', async () => {
  for (const status of [301, 403, 405, 500]) {
    const { response, upstream } = await fetchWithStatus('/technical-case', status);
    assert.equal(response, upstream);
    assert.equal(response.status, status);
  }
});

test('Cloudflare runs the Worker before static assets', () => {
  const config = JSON.parse(readFileSync('wrangler.jsonc', 'utf8'));
  assert.equal(config.main, './worker/index.mjs');
  assert.equal(config.assets.binding, 'ASSETS');
  assert.equal(config.assets.not_found_handling, '404-page');
  assert.equal(config.assets.run_worker_first, true);
  assert.ok(existsSync(config.main));
});
