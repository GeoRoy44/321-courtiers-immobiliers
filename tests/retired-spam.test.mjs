import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import worker from '../worker/index.mjs';

const REQUIRED_SECURITY_HEADERS = [
  'Strict-Transport-Security',
  'Content-Security-Policy',
  'X-Frame-Options',
  'X-Content-Type-Options',
  'Referrer-Policy',
  'Permissions-Policy',
];

const assertSecurityHeaders = (response, label) => {
  for (const header of REQUIRED_SECURITY_HEADERS) {
    assert.ok(response.headers.get(header), `${label}: missing ${header}`);
  }
};

const makeCtx = () => {
  const tasks = [];
  return { waitUntil: (p) => tasks.push(p), flush: () => Promise.all(tasks) };
};

const makeDb = ({ failWith = null, rows = [] } = {}) => {
  const calls = [];
  const db = {
    calls,
    prepare(sql) {
      const stmt = {
        sql,
        params: [],
        bind(...params) { stmt.params = params; return stmt; },
        async run() {
          calls.push({ sql, params: stmt.params });
          if (failWith) throw new Error(failWith);
          return { success: true };
        },
        async all() {
          calls.push({ sql, params: stmt.params });
          if (failWith) throw new Error(failWith);
          return { results: rows };
        },
      };
      return stmt;
    },
  };
  return db;
};

const fetchWithStatus = async (path, upstreamStatus, method = 'GET', extra = {}) => {
  const request = new Request(`https://321courtierimmobilier.fr${path}`, { method, headers: extra.headers });
  const upstream = new Response(method === 'HEAD' ? null : 'Upstream response', {
    status: upstreamStatus,
    headers: { 'Content-Type': 'text/plain' },
  });
  const ctx = makeCtx();
  const env = {
    ASSETS: {
      async fetch(input) {
        assert.equal(input, request);
        return upstream;
      },
    },
    ...extra.env,
  };
  const response = await worker.fetch(request, env, ctx);
  await ctx.flush();
  return { response, upstream, env };
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
    }, makeCtx());
    assert.equal(response.status, 308);
    assert.equal(
      response.headers.get('Location'),
      `https://321courtierimmobilier.fr${path}`,
    );
    assertSecurityHeaders(response, `redirect ${path}`);
  }
});

test('all real HTTPS site pages and required assets keep their upstream status and body', async () => {
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
    '/urls-supprimees/',
    '/courtier-pret-immobilier-nantes/',
    '/robots.txt',
    '/sitemap-index.xml',
    '/sitemap-410.xml',
    '/favicon.svg',
    '/_astro/article.ABC123.css',
  ];

  for (const path of livePaths) {
    for (const method of ['GET', 'HEAD']) {
      const { response } = await fetchWithStatus(path, 200, method);
      assert.equal(response.status, 200, `${method} ${path}`);
      assert.equal(response.headers.get('Content-Type'), 'text/plain', `${method} ${path}`);
      const body = await response.text();
      assert.equal(body, method === 'HEAD' ? '' : 'Upstream response', `${method} ${path}`);
      assertSecurityHeaders(response, `${method} ${path}`);
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
      assert.equal(response.headers.get('X-Content-Type-Options'), 'nosniff');
      assertSecurityHeaders(response, `${method} ${path}`);
      const body = await response.text();
      assert.equal(method === 'HEAD' ? body === '' : body.includes('410 Gone'), true);
    }
  }
});

test('non-404 HTTPS upstream statuses are never rewritten', async () => {
  for (const status of [301, 403, 405, 500]) {
    const { response } = await fetchWithStatus('/technical-case', status);
    assert.equal(response.status, status);
    assertSecurityHeaders(response, `status ${status}`);
  }
});

test('410 hits from search bots are recorded in D1, browsers are ignored', async () => {
  const bot = makeDb();
  await fetchWithStatus('/spam-bot/', 404, 'GET', {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' },
    env: { RETIRED_DB: bot },
  });
  assert.equal(bot.calls.length, 1);
  assert.match(bot.calls[0].sql, /INSERT INTO retired_hits/);
  assert.equal(bot.calls[0].params[0], '/spam-bot/');

  const browser = makeDb();
  await fetchWithStatus('/spam-browser/', 404, 'GET', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh) Safari/605.1.15' },
    env: { RETIRED_DB: browser },
  });
  assert.equal(browser.calls.length, 0);
});

test('a missing table is created on the fly, and D1 failures never break the 410', async () => {
  let created = false;
  const db = makeDb();
  const original = db.prepare.bind(db);
  db.prepare = (sql) => {
    const stmt = original(sql);
    if (/INSERT INTO/.test(sql) && !created) {
      stmt.run = async () => { created = true; throw new Error('D1_ERROR: no such table: retired_hits'); };
    }
    return stmt;
  };
  const { response } = await fetchWithStatus('/spam-first/', 404, 'GET', {
    headers: { 'User-Agent': 'bingbot/2.0' },
    env: { RETIRED_DB: db },
  });
  assert.equal(response.status, 410);
  assert.ok(db.calls.some((c) => /CREATE TABLE IF NOT EXISTS retired_hits/.test(c.sql)));

  const broken = makeDb({ failWith: 'D1_ERROR: daily write limit exceeded' });
  const result = await fetchWithStatus('/spam-quota/', 404, 'GET', {
    headers: { 'User-Agent': 'Googlebot' },
    env: { RETIRED_DB: broken },
  });
  assert.equal(result.response.status, 410);
});

test('export route requires the secret key and returns one path per line', async () => {
  const rows = [
    { path: '/a-spam', hits: 3, first_seen: '2026-10-27T00:00:00Z', last_seen: '2026-10-28T00:00:00Z', ua: 'Googlebot' },
    { path: '/b-spam', hits: 1, first_seen: '2026-10-27T00:00:00Z', last_seen: '2026-10-27T00:00:00Z', ua: 'bingbot' },
  ];
  const env = { ASSETS: { fetch() { throw new Error('export must not reach assets'); } }, RETIRED_DB: makeDb({ rows }), RETIRED_EXPORT_KEY: 's3cret' };

  const denied = await worker.fetch(new Request('https://321courtierimmobilier.fr/api/retired-export'), env, makeCtx());
  assert.equal(denied.status, 401);
  assert.equal(denied.headers.get('X-Robots-Tag'), 'noindex');

  const wrong = await worker.fetch(new Request('https://321courtierimmobilier.fr/api/retired-export?key=nope'), env, makeCtx());
  assert.equal(wrong.status, 401);

  const ok = await worker.fetch(new Request('https://321courtierimmobilier.fr/api/retired-export?key=s3cret'), env, makeCtx());
  assert.equal(ok.status, 200);
  assert.equal(ok.headers.get('X-Retired-Count'), '2');
  assert.equal(await ok.text(), '/a-spam\n/b-spam\n');
  assertSecurityHeaders(ok, 'export');

  const csv = await worker.fetch(new Request('https://321courtierimmobilier.fr/api/retired-export?key=s3cret&format=csv'), env, makeCtx());
  assert.match(csv.headers.get('Content-Type'), /text\/csv/);
  assert.match(await csv.text(), /^path,hits,first_seen,last_seen,ua\n"\/a-spam","3"/);
});

test('Cloudflare runs the Worker before static assets and binds the D1 collector', () => {
  const config = JSON.parse(readFileSync('wrangler.jsonc', 'utf8'));
  assert.equal(config.main, './worker/index.mjs');
  assert.equal(config.assets.binding, 'ASSETS');
  assert.equal(config.assets.not_found_handling, '404-page');
  assert.equal(config.assets.run_worker_first, true);
  assert.ok(existsSync(config.main));
  assert.equal(config.d1_databases[0].binding, 'RETIRED_DB');
  assert.equal(config.d1_databases[0].database_name, 'retired-hits');
});
