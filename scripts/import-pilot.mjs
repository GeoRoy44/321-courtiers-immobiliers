import { readFileSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const input = process.argv[2];
if (!input) throw new Error('Usage: node scripts/import-pilot.mjs <pilot.jsonl>');
const rows = readFileSync(input, 'utf8').trim().split('\n').map(JSON.parse);
assert.equal(rows.length, 27);
const records = rows.map((row) => {
  assert.ok(['Nantes', 'Rennes', 'Reims'].includes(row.city));
  assert.ok(row.address && row.sources.length && row.checked_at);
  for (const source of row.sources) assert.equal(new URL(source).protocol, 'https:');
  return {
    name: row.name, slug: row.id, city: row.city,
    address: row.address, phone: row.phone, specialties: row.services,
    description: row.description, website: row.website, sources: row.sources,
    checkedAt: row.checked_at,
    note: row.phone ? row.notes : 'Le téléphone n’a pas pu être confirmé dans le contenu officiel consulté. Utilisez le site de l’agence pour la contacter.',
  };
});
assert.equal(new Set(records.map((row) => row.slug)).size, records.length);
writeFileSync('src/data/courtiers-pilot.json', JSON.stringify(records, null, 2) + '\n');
console.log(`Imported ${records.length} documentary-reviewed records; no ratings or ORIAS claims.`);
