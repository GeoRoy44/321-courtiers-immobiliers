import type { APIRoute } from 'astro';
import { SITE, retiredChunks, escapeXml } from '../lib/retired';

const TODAY = new Date().toISOString().slice(0, 10);

export const GET: APIRoute = () => {
  const entries = retiredChunks
    .map((_, i) => `  <sitemap><loc>${escapeXml(`${SITE}/sitemap-410-${i + 1}.xml`)}</loc><lastmod>${TODAY}</lastmod></sitemap>`)
    .join('\n');
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</sitemapindex>\n`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
