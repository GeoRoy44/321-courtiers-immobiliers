import pilot from './courtiers-pilot.json';

export type Courtier = {
  name: string;
  slug: string;
  city: string;
  address: string;
  phone: string | null;
  specialties: string[];
  description: string;
  website: string;
  sources: string[];
  checkedAt: string;
  note: string | null;
};

export const courtiers: Courtier[] = [...pilot].sort((a, b) => a.name.localeCompare(b.name, 'fr'));

export const cities = [
  {
    name: 'Nantes', slug: 'courtier-pret-immobilier-nantes', department: 'Loire-Atlantique',
    postcodes: ['44000', '44100', '44200', '44300'],
    intro: 'Comparez les agences de courtage recensées à Nantes, à partir de leurs adresses et des services qu’elles présentent sur leurs sites officiels. Les fiches distinguent les établissements d’un même réseau lorsque leurs adresses sont différentes.',
    advice: 'Pour choisir un interlocuteur à Nantes, commencez par l’adresse de l’agence et les modalités de rendez-vous. Préparez le budget de votre achat, les travaux éventuels et votre calendrier avant de comparer les propositions d’accompagnement.',
  },
  {
    name: 'Rennes', slug: 'courtier-pret-immobilier-rennes', department: 'Ille-et-Vilaine',
    postcodes: ['35000', '35200', '35700'],
    intro: 'Cette sélection rassemble les agences dont le site officiel indique une adresse dans Rennes. Les professionnels installés dans une commune voisine ne sont pas inclus simplement parce que leur nom commercial mentionne Rennes.',
    advice: 'À Rennes, vérifiez que l’adresse publiée correspond au lieu où vous serez reçu. Demandez ensuite qui suivra votre dossier, comment seront comparées les offres et quelles sont les conditions du mandat avant de transmettre vos pièces.',
  },
  {
    name: 'Reims', slug: 'courtier-pret-immobilier-reims', department: 'Marne',
    postcodes: ['51100'],
    intro: 'Retrouvez les agences de courtage disposant d’une adresse annoncée à Reims, avec leurs coordonnées disponibles et leurs services déclarés. Les établissements de la périphérie sont exclus de cette liste communale.',
    advice: 'Pour votre recherche à Reims, contactez l’agence qui correspond à votre projet et confirmez ses coordonnées avant de vous déplacer. Comparez le périmètre de l’accompagnement, les honoraires et le suivi proposé plutôt que le seul nom du réseau.',
  },
];

export type City = typeof cities[number];
export const forCity = (name: string) => courtiers.filter((courtier) => courtier.city === name);
