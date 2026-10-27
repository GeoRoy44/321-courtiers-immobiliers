const SECURITY_HEADERS = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https://images.unsplash.com",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    'upgrade-insecure-requests',
  ].join('; '),
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
};

const BOT_UA = /googlebot|google-inspectiontool|bingbot|adsbot-google|duckduckbot|yandexbot|applebot/i;
const EXPORT_PATH = '/api/retired-export';
const MAX_PATH_LENGTH = 2048;

const withSecurityHeaders = (response) => {
  const secured = new Response(response.body, response);
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    secured.headers.set(name, value);
  }
  return secured;
};

const goneResponse = (method) =>
  new Response(
    method === 'HEAD'
      ? null
      : '410 Gone\nCette page a été supprimée définitivement.\n',
    {
      status: 410,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Robots-Tag': 'noindex',
        'Cache-Control': 'public, max-age=3600',
      },
    },
  );

const canonicalHttpsResponse = (request) => {
  const url = new URL(request.url);
  if (url.protocol === 'https:') return null;

  url.protocol = 'https:';
  return Response.redirect(url.toString(), 308);
};

const CREATE_TABLE_SQL = `CREATE TABLE IF NOT EXISTS retired_hits (
  path TEXT PRIMARY KEY,
  first_seen TEXT NOT NULL,
  last_seen TEXT NOT NULL,
  hits INTEGER NOT NULL DEFAULT 1,
  ua TEXT
)`;

const UPSERT_SQL = `INSERT INTO retired_hits (path, first_seen, last_seen, hits, ua)
VALUES (?1, ?2, ?2, 1, ?3)
ON CONFLICT(path) DO UPDATE SET last_seen = excluded.last_seen, hits = retired_hits.hits + 1, ua = excluded.ua`;

const recordRetiredHit = async (db, request) => {
  const url = new URL(request.url);
  const path = url.pathname.slice(0, MAX_PATH_LENGTH);
  const ua = (request.headers.get('User-Agent') || '').slice(0, 200);
  const now = new Date().toISOString();
  const upsert = () => db.prepare(UPSERT_SQL).bind(path, now, ua).run();
  try {
    await upsert();
  } catch (error) {
    if (!/no such table/i.test(String(error?.message || error))) throw error;
    await db.prepare(CREATE_TABLE_SQL).run();
    await upsert();
  }
};

const scheduleRetiredHit = (env, ctx, request) => {
  const db = env?.RETIRED_DB;
  if (!db) return;
  if (!BOT_UA.test(request.headers.get('User-Agent') || '')) return;
  const task = recordRetiredHit(db, request).catch(() => undefined);
  if (ctx && typeof ctx.waitUntil === 'function') ctx.waitUntil(task);
};

const exportResponse = async (request, env) => {
  const url = new URL(request.url);
  const expected = env?.RETIRED_EXPORT_KEY;
  const provided = url.searchParams.get('key') || '';
  const headers = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' };
  if (!expected || provided.length !== expected.length || provided !== expected) {
    return new Response('401 Unauthorized\n', { status: 401, headers: { ...headers, 'Content-Type': 'text/plain; charset=utf-8' } });
  }
  if (!env?.RETIRED_DB) {
    return new Response('503 RETIRED_DB binding missing\n', { status: 503, headers: { ...headers, 'Content-Type': 'text/plain; charset=utf-8' } });
  }
  let rows = [];
  try {
    const result = await env.RETIRED_DB.prepare('SELECT path, hits, first_seen, last_seen, ua FROM retired_hits ORDER BY path').all();
    rows = result?.results || [];
  } catch (error) {
    if (!/no such table/i.test(String(error?.message || error))) throw error;
  }
  if (url.searchParams.get('format') === 'csv') {
    const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const body = ['path,hits,first_seen,last_seen,ua', ...rows.map((r) => [r.path, r.hits, r.first_seen, r.last_seen, r.ua].map(escape).join(','))].join('\n') + '\n';
    return new Response(body, { headers: { ...headers, 'Content-Type': 'text/csv; charset=utf-8' } });
  }
  const body = rows.map((r) => r.path).join('\n') + (rows.length ? '\n' : '');
  return new Response(body, { headers: { ...headers, 'Content-Type': 'text/plain; charset=utf-8', 'X-Retired-Count': String(rows.length) } });
};

export default {
  async fetch(request, env, ctx) {
    const redirect = canonicalHttpsResponse(request);
    if (redirect) return withSecurityHeaders(redirect);

    const url = new URL(request.url);
    if (url.pathname === EXPORT_PATH && (request.method === 'GET' || request.method === 'HEAD')) {
      return withSecurityHeaders(await exportResponse(request, env));
    }

    const response = await env.ASSETS.fetch(request);

    // Keep every page and asset that really exists in the current Astro build.
    // Convert only unknown legacy/spam URLs from the generated 404 to 410 Gone.
    if (response.status !== 404) {
      return withSecurityHeaders(response);
    }

    scheduleRetiredHit(env, ctx, request);
    return withSecurityHeaders(goneResponse(request.method));
  },
};
