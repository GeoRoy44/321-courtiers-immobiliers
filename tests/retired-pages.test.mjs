import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const retired = ['reze', 'vertou', 'bouguenais', 'les-sorinieres', 'la-haye-fouassiere'];
function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? files(path) : [path];
  });
}

test('retired city pages, local data and links are absent from site source', () => {
  for (const path of files('src')) {
    const content = readFileSync(path, 'utf8');
    for (const city of retired) {
      assert.ok(!path.includes(`courtier-pret-immobilier-${city}`), path);
      assert.ok(!content.includes(`courtier-pret-immobilier-${city}`), path);
    }
    assert.ok(!path.endsWith('local-content.ts'), path);
    assert.ok(!path.endsWith('CityPage.astro'), path);
  }
});

test('Cloudflare uses a real, non-indexable 404 instead of an SPA fallback', () => {
  const config = JSON.parse(readFileSync('wrangler.jsonc', 'utf8'));
  assert.equal(config.assets.not_found_handling, '404-page');
  assert.match(readFileSync('src/pages/404.astro', 'utf8'), /noindex/);
});
