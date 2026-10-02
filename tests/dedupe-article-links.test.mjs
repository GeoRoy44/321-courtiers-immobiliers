import test from 'node:test';
import assert from 'node:assert/strict';
import { dedupeExternalLinks } from '../scripts/dedupe-article-links.mjs';

test('retains first source and removes repeated parenthetical citations cleanly', () => {
  const input = 'Texte. ([A](https://example.org/a) ; [B](https://example.org/b))\n\nAutre. ([A](https://example.org/a))\n\nRéférences ([B](https://example.org/b))\n';
  const result = dedupeExternalLinks(input);
  assert.equal(result.removed, 2);
  assert.equal(result.uniqueExternalLinks, 2);
  assert.ok(result.markdown.includes('Autre.'));
  assert.ok(!result.markdown.includes('Références'));
  assert.ok(!result.markdown.includes('()'));
});

test('keeps a new source from mixed citation groups and preserves inline wording', () => {
  const result = dedupeExternalLinks('[A](https://example.org/a)\n\nConsultez [la page](https://example.org/a). ([A](https://example.org/a) ; [B](https://example.org/b))');
  assert.equal(result.removed, 2);
  assert.ok(result.markdown.includes('Consultez la page. ([B](https://example.org/b))'));
});

test('does not deduplicate internal links or distinct source pages', () => {
  const input = '[Interne](https://321courtierimmobilier.fr/blog/) [Interne](https://321courtierimmobilier.fr/blog/) [A](https://example.org/a) [B](https://example.org/b)';
  assert.equal(dedupeExternalLinks(input).markdown, input);
});

test('preserves code blocks and images, and is idempotent', () => {
  const code = '```md\n[A](https://example.org/a) [A](https://example.org/a)\n```';
  const input = `${code}\n\n![Image](https://example.org/a)\n\n[A](https://example.org/a) [A](https://example.org/a)`;
  const result = dedupeExternalLinks(input);
  assert.equal(result.removed, 1);
  assert.ok(result.markdown.includes(code));
  assert.ok(result.markdown.includes('![Image](https://example.org/a)'));
  assert.equal(dedupeExternalLinks(result.markdown).removed, 0);
  assert.equal(dedupeExternalLinks(result.markdown).markdown, result.markdown);
});
