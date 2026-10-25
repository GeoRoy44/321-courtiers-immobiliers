export type Broker = { name: string; href?: string };
export type CityBrokers = { name: string; slug: string; department: string; brokers: Broker[] };

export const cityBrokers: CityBrokers[] = [
  {
    name: 'Metz',
    slug: 'metz',
    department: 'Moselle (57)',
    brokers: [
      { name: 'CAFPI Metz' },
      { name: 'Meilleurtaux Metz' },
      { name: 'Immoprêt Metz – Ars-Laquenexy' },
      { name: 'Finance Conseil Metz' },
    ],
  },
  {
    name: 'Lyon',
    slug: 'lyon',
    department: 'Rhône (69)',
    brokers: [
      { name: 'CAFPI Lyon 6' },
      { name: 'La Centrale de Financement Lyon République' },
      { name: 'La Centrale de Financement Lyon Lafayette' },
      { name: 'Artémis Courtage Lyon' },
      { name: 'Crédit Expert by Artémis Courtage' },
      { name: 'CAP Crédit Groupe Artémis Courtage' },
      { name: 'Vousfinancer Lyon Vaise' },
      { name: 'Empruntis Lyon Presqu’île' },
      { name: 'In&Fi Crédits Lyon 6' },
      { name: 'Meilleurtaux Lyon Monplaisir' },
      { name: 'Meilleurtaux Lyon Saxe' },
      { name: 'Meilleurtaux Lyon Charpennes' },
      { name: 'Avisofi Lyon' },
      { name: 'ATHEKA' },
    ],
  },
  {
    name: 'Nantes',
    slug: 'nantes',
    department: 'Loire-Atlantique (44)',
    brokers: [
      { name: 'Courtier en prêt immo à Nantes', href: 'https://courtier-pret-immo44.fr/' },
      { name: 'CAFPI Nantes' },
      { name: 'La Centrale de Financement Nantes' },
      { name: 'Artémis Courtage Nantes Sud' },
      { name: 'Prelys Courtage Nantes' },
      { name: 'Obontaux Nantes' },
    ],
  },
  {
    name: 'Rouen',
    slug: 'rouen',
    department: 'Seine-Maritime (76)',
    brokers: [
      { name: 'CAFPI Rouen' },
      { name: 'Immoprêt Rouen – Cathédrale' },
      { name: 'Empruntis Rouen' },
      { name: 'La Centrale de Financement Rouen' },
      { name: 'Ymanci Rouen' },
      { name: 'Easy Finance Rouen' },
      { name: 'Artémis Courtage Rouen' },
    ],
  },
  {
    name: 'Caen',
    slug: 'caen',
    department: 'Calvados (14)',
    brokers: [
      { name: 'CAFPI Caen' },
      { name: 'Immoprêt Caen' },
      { name: 'Vousfinancer Caen' },
      { name: 'Finance Conseil Caen' },
    ],
  },
  {
    name: 'Nîmes',
    slug: 'nimes',
    department: 'Gard (30)',
    brokers: [
      { name: 'CAFPI Nîmes Costières' },
      { name: 'Meilleurtaux Nîmes' },
      { name: 'PMG Courtage' },
      { name: 'Crédits O’Carré' },
    ],
  },
];
