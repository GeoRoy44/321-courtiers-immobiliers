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

export const courtiers: Courtier[] = [
  {
    name: 'Cabinet partenaire — fiche à compléter',
    slug: 'courtier-exemple-reze',
    city: 'Rezé',
    department: 'Loire-Atlantique',
    region: 'Pays de la Loire',
    specialties: ['Premier achat', 'Prêt immobilier', 'Rachat de crédit'],
    description: 'Exemple de présentation structurée pour une future fiche vérifiée : zone d’intervention, spécialités, coordonnées publiques et date de contrôle.',
    verifiedAt: 'À vérifier avant publication',
  },
  {
    name: 'Cabinet partenaire — fiche à compléter',
    slug: 'courtier-exemple-vertou',
    city: 'Vertou',
    department: 'Loire-Atlantique',
    region: 'Pays de la Loire',
    specialties: ['Maison ancienne', 'Prêt-relais', 'Investissement locatif'],
    description: 'Exemple de fiche annuaire. Les informations publiées doivent être sourcées, mises à jour et distinguées de tout partenariat commercial.',
    verifiedAt: 'À vérifier avant publication',
  },
  {
    name: 'Cabinet partenaire — fiche à compléter',
    slug: 'courtier-exemple-bouguenais',
    city: 'Bouguenais',
    department: 'Loire-Atlantique',
    region: 'Pays de la Loire',
    specialties: ['Primo-accédant', 'Neuf', 'Travaux'],
    description: 'Exemple de fiche pour l’annuaire local, à remplacer par une fiche professionnelle vérifiée avant indexation.',
    verifiedAt: 'À vérifier avant publication',
  },
];

export const cities = [
  { name: 'Nantes', slug: 'courtier-pret-immobilier-nantes', department: 'Loire-Atlantique', status: 'À compléter avec les fiches vérifiées' },
  { name: 'Rezé', slug: 'courtier-pret-immobilier-reze', department: 'Loire-Atlantique', status: 'Guide local disponible' },
  { name: 'Vertou', slug: 'courtier-pret-immobilier-vertou', department: 'Loire-Atlantique', status: 'Guide local disponible' },
  { name: 'Bouguenais', slug: 'courtier-pret-immobilier-bouguenais', department: 'Loire-Atlantique', status: 'Guide local disponible' },
  { name: 'Les Sorinières', slug: 'courtier-pret-immobilier-les-sorinieres', department: 'Loire-Atlantique', status: 'Guide local disponible' },
  { name: 'La Haye-Fouassière', slug: 'courtier-pret-immobilier-la-haye-fouassiere', department: 'Loire-Atlantique', status: 'Guide local disponible' },
  { name: 'Rennes', slug: 'courtier-pret-immobilier-rennes', department: 'Ille-et-Vilaine', status: 'À venir' },
  { name: 'Reims', slug: 'courtier-pret-immobilier-reims', department: 'Marne', status: 'À venir' },
];