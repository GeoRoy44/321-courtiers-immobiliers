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
        'X-Content-Type-Options': 'nosniff',
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
    if (redirect) return redirect;

    const response = await env.ASSETS.fetch(request);

    // Keep every page and asset that really exists in the current Astro build.
    // Convert only unknown legacy/spam URLs from the generated 404 to 410 Gone.
    if (response.status !== 404) {
      return response;
    }

    return goneResponse(request.method);
  },
};
