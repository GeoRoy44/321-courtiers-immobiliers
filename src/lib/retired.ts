import raw from '../data/retired-urls.txt?raw';
import rawExtra from '../data/retired-urls-extra.txt?raw';

export const SITE = 'https://321courtierimmobilier.fr';
export const RETIRED_LASTMOD = '2026-10-15';
export const CHUNK_SIZE = 1000;

const LIVE_EXACT = new Set([
  '/',
  '/blog/',
  '/a-propos/',
  '/annuaire-courtiers-pret-immobilier/',
  '/trouver-mon-courtier/',
  '/mentions-legales/',
  '/politique-confidentialite/',
  '/plan-du-site/',
  '/urls-supprimees/',
]);

const isLivePath = (path: string): boolean => {
  const withSlash = path.endsWith('/') ? path : `${path}/`;
  return (
    LIVE_EXACT.has(withSlash) ||
    withSlash.startsWith('/blog/') ||
    withSlash.startsWith('/courtier-pret-immobilier-') ||
    path.endsWith('.xml') ||
    path === '/robots.txt'
  );
};

const normalise = (line: string): string | null => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return null;
  let path = trimmed;
  if (/^https?:\/\//i.test(path)) {
    try {
      path = new URL(path).pathname;
    } catch {
      return null;
    }
  }
  if (!path.startsWith('/')) path = `/${path}`;
  path = path.replace(/\/+$/, '') || '/';
  if (isLivePath(path)) return null;
  return path;
};

export const retiredPaths: string[] = [...new Set(
  `${raw}\n${rawExtra}`.split(/\r?\n/).map(normalise).filter((p): p is string => p !== null),
)].sort();

export const retiredUrls: string[] = retiredPaths.map((p) => `${SITE}${p}`);

export const retiredChunks: string[][] = Array.from(
  { length: Math.ceil(retiredUrls.length / CHUNK_SIZE) },
  (_, i) => retiredUrls.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE),
);

export const escapeXml = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
