const SECURITY_HEADERS = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data:",
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

export default {
  async fetch(request, env) {
    const redirect = canonicalHttpsResponse(request);
    if (redirect) return withSecurityHeaders(redirect);

    const response = await env.ASSETS.fetch(request);

    // Keep every page and asset that really exists in the current Astro build.
    // Convert only unknown legacy/spam URLs from the generated 404 to 410 Gone.
    if (response.status !== 404) {
      return withSecurityHeaders(response);
    }

    return withSecurityHeaders(goneResponse(request.method));
  },
};
