import { activeBlogArticlePaths } from './active-blog-article-paths.mjs';

const normalizePathname = (pathname) => {
  const normalized = pathname.replace(/\/+$/, '');
  return normalized || '/';
};

const isRequiredArticleAsset = (pathname) =>
  pathname.startsWith('/_astro/') || pathname === '/favicon.svg';

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

export default {
  async fetch(request, env) {
    const pathname = normalizePathname(new URL(request.url).pathname);

    if (
      activeBlogArticlePaths.has(pathname) ||
      isRequiredArticleAsset(pathname)
    ) {
      return env.ASSETS.fetch(request);
    }

    return goneResponse(request.method);
  },
};
