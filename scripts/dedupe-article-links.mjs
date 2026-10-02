import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const localHost = '321courtierimmobilier.fr';
const linkPattern = String.raw`\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)`;
const citationPattern = String.raw`\(${linkPattern}(?:\s*;\s*${linkPattern})*\)`;

function externalKey(href) {
  const url = new URL(href);
  if (url.hostname.replace(/^www\./, '') === localHost) return null;
  url.pathname = url.pathname.replace(/\/+$/, '') || '/';
  return url.href;
}

export function dedupeExternalLinks(markdown) {
  const seen = new Set();
  let removed = 0;
  function keepLink(href) {
    const key = externalKey(href);
    if (key === null) return true;
    if (seen.has(key)) {
      removed++;
      return false;
    }
    seen.add(key);
    return true;
  }
  const chunks = markdown.split(/(^```[\s\S]*?^```[^\n]*$|^~~~[\s\S]*?^~~~[^\n]*$)/gm);
  const output = chunks.map((chunk) => {
    if (/^(?:```|~~~)/.test(chunk)) return chunk;
    const tokenPattern = new RegExp(`${citationPattern}|(?<!!)${linkPattern}`, 'g');
    return chunk.replace(tokenPattern, (token) => {
      if (token.startsWith('(')) {
        const links = [...token.matchAll(new RegExp(linkPattern, 'g'))];
        const kept = links.filter((match) => keepLink(match[2]));
        return kept.length ? `(${kept.map((match) => match[0]).join(' ; ')})` : '';
      }
      const match = new RegExp(linkPattern).exec(token);
      return keepLink(match[2]) ? token : match[1];
    }).split('\n')
      .filter((line) => !/^\s*Références\s*[:.]?\s*$/.test(line))
      .map((line) => line.trimEnd())
      .join('\n')
      .replace(/\n{3,}/g, '\n\n');
  }).join('');
  return { markdown: output, removed, uniqueExternalLinks: seen.size };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const directory = resolve('src/pages/blog');
  let total = 0;
  for (const filename of readdirSync(directory).filter((name) => name.endsWith('.md'))) {
    const path = resolve(directory, filename);
    const original = readFileSync(path, 'utf8');
    const result = dedupeExternalLinks(original);
    if (result.markdown !== original) writeFileSync(path, result.markdown);
    total += result.removed;
    console.log(`${filename}: ${result.removed} répétitions supprimées, ${result.uniqueExternalLinks} liens externes conservés`);
  }
  console.log(`Total : ${total} liens externes répétés supprimés.`);
}
