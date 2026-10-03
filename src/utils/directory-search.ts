export function normalizeQuery(value: string): string {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('fr-FR').trim().replace(/\s+/g, ' ');
}

export function matchesDirectory(searchText: string, query: string): boolean {
  const content = normalizeQuery(searchText);
  return normalizeQuery(query).split(' ').filter(Boolean).every((word) => content.includes(word));
}
