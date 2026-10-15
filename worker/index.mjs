import { retiredPaths } from './retired-paths.mjs';

export default {
  async fetch(request, env) {
    const pathname = new URL(request.url).pathname.replace(/\/+$/, '');

    if (retiredPaths.has(pathname)) {
      return new Response(
        request.method === 'HEAD'
          ? null
          : '410 Gone\nCette ancienne page a été supprimée définitivement.\n',
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
    }

    // Preserve static assets, current pages and the existing genuine 404 fallback.
    return env.ASSETS.fetch(request);
  },
};
