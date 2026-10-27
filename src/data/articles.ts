export type Article = {
  title: string;
  seoTitle: string;
  href: string;
  category: string;
  description: string;
  date: string;
};

export const articles: Article[] = [
  {
    title: 'Comment trouver un courtier immobilier : méthode pour vérifier et comparer les options',
    seoTitle: 'Trouver un courtier immobilier : méthode et vérifications',
    href: '/blog/comment-trouver-un-courtier-immobilier/',
    category: 'Choisir son courtier',
    description: 'Méthode claire pour trouver un courtier immobilier, vérifier son sérieux et comparer les options avant le premier échange.',
    date: '2026-10-02',
  },
  {
    title: 'Courtier immobilier : c’est quoi ? Définition et utilité',
    seoTitle: 'Courtier immobilier : définition, rôle et utilité',
    href: '/blog/courtier-immobilier-c-est-quoi/',
    category: 'Comprendre le courtage',
    description: 'Découvrez ce qu’est un courtier immobilier, son rôle dans le crédit et la différence avec l’agent immobilier.',
    date: '2026-10-02',
  },
  {
    title: 'Quel est le rôle d’un courtier en prêt immobilier ?',
    seoTitle: 'Rôle d’un courtier en prêt immobilier : missions et limites',
    href: '/blog/role-courtier-pret-immobilier/',
    category: 'Comprendre le courtage',
    description: 'Comprenez le rôle d’un courtier en prêt immobilier, ses missions, ses limites et ce qu’il apporte à votre dossier.',
    date: '2026-10-02',
  },
  {
    title: 'Comment fonctionne un courtier immobilier ? Le parcours expliqué',
    seoTitle: 'Comment fonctionne un courtier immobilier ? Les étapes',
    href: '/blog/comment-fonctionne-courtier-pret-immobilier/',
    category: 'Dossier de prêt',
    description: 'Découvrez le parcours d’un courtier immobilier : premier échange, dossier, comparaison des offres et suivi de la décision bancaire.',
    date: '2026-10-02',
  },
  {
    title: 'Courtier ou banque pour un prêt immobilier : comment choisir ?',
    seoTitle: 'Courtier ou banque pour un prêt immobilier : comment choisir',
    href: '/blog/courtier-ou-banque-pret-immobilier/',
    category: 'Comparer les options',
    description: 'Courtier ou banque pour un prêt immobilier : comparez démarches, accompagnement et offres pour choisir selon votre projet.',
    date: '2026-10-02',
  },
  {
    title: 'Prêt immobilier : préparer son dossier et comparer les offres',
    seoTitle: 'Prêt immobilier : préparer son dossier et comparer',
    href: '/blog/pret-immobilier/',
    category: 'Financement',
    description: 'Capacité d’emprunt, apport, TAEG, assurance, garanties et aides : les repères pour construire votre financement.',
    date: '2026-10-02',
  },
].sort((a, b) => b.date.localeCompare(a.date));

export const articleByHref = (href: string): Article | undefined =>
  articles.find((article) => article.href === href || article.href === `${href}/`);
