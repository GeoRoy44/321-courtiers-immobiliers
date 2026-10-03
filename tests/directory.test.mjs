import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { normalizeQuery, matchesDirectory } from '../src/utils/directory-search.ts';

const records = JSON.parse(readFileSync('src/data/courtiers-pilot.json', 'utf8'));
test('pilot has 27 real source-backed records split across only the three authorised cities', () => {
  assert.equal(records.length, 27);
  assert.deepEqual(Object.fromEntries(['Nantes','Rennes','Reims'].map((city) => [city, records.filter((row) => row.city === city).length])), {Nantes:9,Rennes:8,Reims:10});
  assert.equal(new Set(records.map((row) => row.slug)).size,27);
  assert.equal(new Set(records.map((row) => row.address)).size,27);
  for (const row of records) {
    assert.ok(row.sources.includes(row.website));
    for (const url of row.sources) assert.equal(new URL(url).protocol,'https:');
    assert.equal(row.checkedAt,'2026-10-02');
    assert.ok(row.address.includes(row.city));
    assert.ok(row.specialties.length > 0);
    assert.ok(!('rating' in row) && !('reviewCount' in row) && !('orias' in row));
  }
});
test('missing phone numbers stay null and all other numbers have valid French syntax', () => {
  assert.deepEqual(records.filter((row) => row.phone === null).map((row) => row.name).sort(), ['Crédits et Conseils Reims','Finance Conseil Rennes']);
  for (const row of records.filter((row) => row.phone)) assert.match(row.phone, /^0[1-9]( \d{2}){4}$/);
});
test('agency aliases are not duplicated while distinct branches remain', () => {
  assert.equal(records.filter((row) => row.address.includes('Paul Bellamy')).length, 1);
  assert.equal(records.filter((row) => row.name.startsWith('Empruntis Nantes')).length, 2);
});
test('directory search is accent/case insensitive, literal and supports multiple words', () => {
  assert.equal(normalizeQuery('  CRÉDIT  Immobilier '), 'credit immobilier');
  assert.ok(matchesDirectory('Crédits et Conseils Reims', 'credits reims'));
  assert.ok(matchesDirectory('APG Courtage Nantes', 'apg'));
  assert.ok(!matchesDirectory('CAFPI Rennes', '<script>'));
  assert.ok(!matchesDirectory('CAFPI Rennes', 'nantes'));
  assert.ok(matchesDirectory('CAFPI Rennes', ''));
});
