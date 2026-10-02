import test from 'node:test';
import assert from 'node:assert/strict';
import { buildArticleToc } from '../src/utils/article-toc.ts';

test('extracts H2 and H3, including HTML headings and entities', () => {
  const result = buildArticleToc('<h1>Titre</h1><h2 id="déjà-là">Crédit &amp; <strong>assurance</strong></h2><h3 id="questions-premier-echange">Questions</h3><h4>Détail</h4>');
  assert.deepEqual(result.headings, [
    { id: 'déjà-là', text: 'Crédit & assurance', depth: 2 },
    { id: 'questions-premier-echange', text: 'Questions', depth: 3 },
  ]);
  assert.equal(result.sections[0].children[0].id, 'questions-premier-echange');
});

test('keeps existing anchors and allocates unique deterministic missing IDs', () => {
  const result = buildArticleToc('<div id="pret"></div><h2>Prêt</h2><h2>Prêt</h2><h2 id="stable">Autre</h2><h3 id="stable">Autre</h3>');
  assert.deepEqual(result.headings.map((heading) => heading.id), ['pret-2', 'pret-3', 'stable', 'autre']);
  assert.equal(buildArticleToc(result.html).html, result.html);
});

test('handles empty articles, empty headings and an H3 before any H2', () => {
  assert.equal(buildArticleToc('<p>Introduction</p>').sections.length, 0);
  const result = buildArticleToc('<h2> </h2><h3>Question isolée ?</h3><h2>Suite</h2>');
  assert.equal(result.sections.length, 2);
  assert.equal(result.sections[0].id, 'question-isolee');
});

test('preserves text, links, table structure and code blocks', () => {
  const html = '<p>Un <a href="/blog/">guide</a>.</p><h2 id="tableau">Comparaison</h2><table><tbody><tr><td>Banque</td></tr></tbody></table><pre><code>&lt;h2&gt;Code&lt;/h2&gt;</code></pre>';
  const result = buildArticleToc(html);
  assert.equal(result.html, html);
  assert.equal(result.headings.length, 1);
});
