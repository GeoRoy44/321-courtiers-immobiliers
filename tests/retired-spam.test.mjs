import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import worker from '../worker/index.mjs';
import { activeBlogArticlePaths } from '../worker/active-blog-article-paths.mjs';

const fetchThroughAssets = async (path, method = 'GET') => {
  const request = new Request(`https://321courtierimmobilier.fr${path}`, { method });
  const upstream = new Response(method === 'HEAD' ? null : 'Article or asset', {
    status: 200,
  });
  const response = await worker.fetch(request, {
    ASSETS: {
      async fetch(input) {
        assert.equal(input, request);
        return upstream;
      },
    },
  });
  assert.equal(response, upstream);
};

const fetchGone = async (path, method = 'GET') => {
  const response = await worker.fetch(
    new Request(`https://321courtierimmobilier.fr${path}`, { method }),
    {
      ASSETS: {
        fetch() {
          throw new Error(`410 path reached assets: ${path}`);
        },
      },
    },
  );
  assert.equal(response.status, 410, `${method} ${path}`);
  assert.equal(response.headers.get('Location'), null);
  assert.equal(response.headers.get('X-Robots-Tag'), 'noindex');
  const body = await response.text();
  assert.equal(method === 'HEAD' ? body === '' : body.includes('410 Gone'), true);
};

test('only the six genuine broker blog articles pass through', async () => {
  assert.equal(activeBlogArticlePaths.size, 6);
  for (const path of activeBlogArticlePaths) {
    for (const suffix of ['', '/', '?utm_source=test', '/?utm_source=test']) {
      for (const method of ['GET', 'HEAD']) {
        await fetchThroughAssets(`${path}${suffix}`, method);
      }
    }
  }
});

test('all other public page URLs return 410', async () => {
  const gonePaths = [
    '/',
    '/blog/',
    '/a-propos/',
    '/annuaire-courtiers-pret-immobilier/',
    '/trouver-mon-courtier/',
    '/mentions-legales/',
    '/politique-confidentialite/',
    '/plan-du-site/',
    '/courtier-pret-immobilier-nantes/',
    '/robots.txt',
    '/sitemap-index.xml',
    '/unknown-page/',
    '/terapi-farmakologi-gagal-ginjal/',
    '/blog/faux-article/',
    '/blog/role-courtier-pret-immobilier-faux/',
  ];

  for (const path of gonePaths) {
    for (const method of ['GET', 'HEAD']) {
      await fetchGone(path, method);
    }
  }
});

test('article build assets remain available', async () => {
  await fetchThroughAssets('/_astro/article.ABC123.css');
  await fetchThroughAssets('/favicon.svg');
});

test('Cloudflare runs the Worker before static assets', () => {
  const config = JSON.parse(readFileSync('wrangler.jsonc', 'utf8'));
  assert.equal(config.main, './worker/index.mjs');
  assert.equal(config.assets.binding, 'ASSETS');
  assert.equal(config.assets.not_found_handling, '404-page');
  assert.equal(config.assets.run_worker_first, true);
  assert.ok(existsSync(config.main));
});
