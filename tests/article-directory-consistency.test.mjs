import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const article = readFileSync('src/pages/blog/comment-trouver-un-courtier-immobilier.md', 'utf8');
const records = JSON.parse(readFileSync('src/data/courtiers-pilot.json', 'utf8'));
const citiesSource = readFileSync('src/data/courtiers.ts', 'utf8');
const cityRoute = readFileSync('src/pages/[cityDirectory].astro', 'utf8');
const citySlugs = [...citiesSource.matchAll(/slug:\s*'(courtier-pret-immobilier-[^']+)'/g)].map((match) => match[1]);

test('guide matches the documented directory without claiming a new agency check', () => {
  assert.ok(article.includes(`${records.length} agences documentées`));
  assert.match(article, /sans appel, sans visite et sans contrôle du registre ORIAS/);
  assert.match(article, /Cette mise à jour ne constitue pas un nouveau contrôle des agences/);
  assert.match(article, /date: "2026-10-02"/);
  assert.doesNotMatch(article, /ne référence pas encore|état de publication de l’annuaire|guides locaux disponibles/);
});

test('local links and agency counts match the documentary dataset', () => {
  for (const [city, slug] of [['Nantes', 'nantes'], ['Rennes', 'rennes'], ['Reims', 'reims']]) {
    const count = records.filter((record) => record.city === city).length;
    assert.ok(article.includes(`[${count} agences recensées à ${city}](/courtier-pret-immobilier-${slug}/)`));
    assert.ok(citySlugs.includes(`courtier-pret-immobilier-${slug}`));
  }
  assert.ok(records.every((record) => record.checkedAt === '2026-10-02'));
  assert.match(cityRoute, /export function getStaticPaths/);
  assert.match(cityRoute, /cities\.map\(\(city\) => \(\{ params: \{ cityDirectory: city\.slug \}/);
});

test('internal links resolve to existing pages', () => {
  for (const [, href] of article.matchAll(/\]\((\/[^)]+)\)/g)) {
    const path = href.replace(/\/$/, '');
    assert.ok([
      `src/pages${path}.astro`,
      `src/pages${path}.md`,
      `src/pages${path}/index.astro`,
    ].some(existsSync) || citySlugs.includes(path.slice(1)), `Missing article link target: ${href}`);
  }
});

test('guide retains useful anchors, sources, comparison grid and no inline CSS', () => {
  assert.match(article, /id="criteres-comparaison"/);
  assert.match(article, /id="questions-premier-echange"/);
  assert.match(article, /https:\/\/www\.orias\.fr\//);
  assert.match(article, /https:\/\/www\.inc-conso\.fr\//);
  assert.match(article, /https:\/\/www\.abe-infoservice\.fr\//);
  assert.match(article, /\| Point à comparer \| Question à poser \| Élément à conserver \|/);
  assert.match(article, /vérification ORIAS datée/);
  assert.doesNotMatch(article, /style\s*=/i);
});
