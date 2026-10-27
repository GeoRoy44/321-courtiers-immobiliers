import type { APIRoute, GetStaticPaths } from 'astro';
import { RETIRED_LASTMOD, retiredChunks, escapeXml } from '../lib/retired';

export const getStaticPaths: GetStaticPaths = () =>
  retiredChunks.map((_, i) => ({ params: { page: String(i + 1) } }));

export const GET: APIRoute = ({ params }) => {
  const index = Number(params.page) - 1;
  const urls = retiredChunks[index] ?? [];
  const entries = urls
    .map((u) => `  <url><loc>${escapeXml(u)}</loc><lastmod>${RETIRED_LASTMOD}</lastmod></url>`)
    .join('\n');
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
