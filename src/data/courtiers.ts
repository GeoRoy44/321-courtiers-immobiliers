export type Courtier = {
  name: string;
  slug: string;
  city: string;
  department: string;
  region: string;
  specialties: string[];
  description: string;
  website?: string;
  verifiedAt: string;
};

export const courtiers: Courtier[] = [];

export const cities = [
  { name: 'Nantes', slug: 'courtier-pret-immobilier-nantes', department: 'Loire-Atlantique', status: 'À venir' },
  { name: 'Rezé', slug: 'courtier-pret-immobilier-reze', department: 'Loire-Atlantique', status: 'Guide local disponible' },
  { name: 'Vertou', slug: 'courtier-pret-immobilier-vertou', department: 'Loire-Atlantique', status: 'Guide local disponible' },
  { name: 'Bouguenais', slug: 'courtier-pret-immobilier-bouguenais', department: 'Loire-Atlantique', status: 'Guide local disponible' },
  { name: 'Les Sorinières', slug: 'courtier-pret-immobilier-les-sorinieres', department: 'Loire-Atlantique', status: 'Guide local disponible' },
  { name: 'La Haye-Fouassière', slug: 'courtier-pret-immobilier-la-haye-fouassiere', department: 'Loire-Atlantique', status: 'Guide local disponible' },
  { name: 'Rennes', slug: 'courtier-pret-immobilier-rennes', department: 'Ille-et-Vilaine', status: 'À venir' },
  { name: 'Reims', slug: 'courtier-pret-immobilier-reims', department: 'Marne', status: 'À venir' },
];
