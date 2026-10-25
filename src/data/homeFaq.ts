export type FaqItem = { question: string; answer: string };
export type InstitutionalLink = { label: string; href: string; description: string };

export const homeFaq: FaqItem[] = [
  {
    question: 'Comment trouver un courtier en prêt immobilier près de chez moi ?',
    answer:
      'Commencez par votre ville : nos listes par ville (Nantes, Lyon, Metz, Rouen, Caen, Nîmes…) recensent des agences de courtage et des courtiers indépendants. Comparez ensuite deux ou trois professionnels sur leur accompagnement, leurs banques partenaires et leurs honoraires, puis prenez un premier rendez-vous en agence ou en visio pour une étude gratuite de votre capacité d’emprunt.',
  },
  {
    question: 'Combien coûte un courtier et quand paie-t-on les honoraires ?',
    answer:
      'Le courtier est rémunéré par une commission versée par la banque et, souvent, par des honoraires facturés au client et fixés dans le mandat de recherche de financement. La loi interdit tout versement avant le déblocage effectif des fonds : si votre prêt n’aboutit pas, vous ne devez rien. Demandez toujours le montant ou le mode de calcul des honoraires dès le premier échange.',
  },
  {
    question: 'Un courtier obtient-il vraiment de meilleures conditions qu’en allant directement à la banque ?',
    answer:
      'Un courtier met votre dossier en concurrence auprès de plusieurs établissements et connaît les critères de chaque banque sur le marché local. Il négocie le taux, mais aussi les frais de dossier, l’assurance emprunteur, les garanties et la souplesse du prêt (modulation, remboursement anticipé). Comparez toujours le TAEG et le coût total du crédit plutôt que le seul taux nominal.',
  },
  {
    question: 'Quels documents préparer pour le premier rendez-vous ?',
    answer:
      'Prévoyez une pièce d’identité, vos trois derniers bulletins de salaire (ou bilans si vous êtes indépendant), vos deux derniers avis d’imposition, trois mois de relevés de comptes, un justificatif de domicile, le détail de vos crédits en cours et de votre apport, ainsi que le compromis ou la description du bien si vous l’avez déjà trouvé. Un dossier complet accélère nettement l’accord de principe.',
  },
  {
    question: 'Un courtier peut-il m’aider pour un premier achat, un PTZ ou un petit apport ?',
    answer:
      'Oui. Pour un primo-accédant, le courtier calcule votre capacité d’emprunt, vérifie votre éligibilité au prêt à taux zéro (résidence principale, plafonds de ressources, zone du logement) et combine les prêts aidés avec le prêt principal. Avec un apport limité, il oriente le dossier vers les banques les plus ouvertes à votre profil (CDI, indépendant, investissement locatif…).',
  },
  {
    question: 'Comment vérifier la fiabilité d’un courtier ?',
    answer:
      'Un courtier en crédit doit être immatriculé à l’ORIAS en tant qu’intermédiaire en opérations de banque (IOBSP) : le numéro figure sur ses documents et se vérifie gratuitement sur le registre en ligne. Lisez aussi les avis récents, demandez un mandat écrit avant toute démarche et méfiez-vous de toute demande de frais d’avance.',
  },
  {
    question: 'Le courtier peut-il aussi négocier l’assurance emprunteur ou un rachat de crédit ?',
    answer:
      'La plupart des cabinets de courtage proposent une comparaison des assurances emprunteur, que vous pouvez changer à tout moment depuis la loi Lemoine, à garanties équivalentes. Beaucoup accompagnent aussi la renégociation ou le rachat d’un prêt existant et le regroupement de crédits : demandez une simulation du gain net après frais avant de vous engager.',
  },
];

export const institutionalLinks: InstitutionalLink[] = [
  {
    label: 'ORIAS – Registre des intermédiaires',
    href: 'https://www.orias.fr/',
    description: 'Vérifier l’immatriculation d’un courtier en crédit ou en assurance.',
  },
  {
    label: 'Service-Public – Obtenir un crédit immobilier',
    href: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F16123',
    description: 'Offre de prêt, délai de réflexion de 10 jours, validité de 30 jours.',
  },
  {
    label: 'Service-Public – Prêt à taux zéro (PTZ)',
    href: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F10871',
    description: 'Conditions d’éligibilité, plafonds de ressources et zones.',
  },
  {
    label: 'economie.gouv.fr – Changer d’assurance emprunteur',
    href: 'https://www.economie.gouv.fr/particuliers/emprunter-et-sassurer/achat-immobilier-pouvez-vous-changer-dassurance-emprunteur',
    description: 'Ce que permet la loi Lemoine et comment résilier.',
  },
  {
    label: 'ANIL / ADIL – Diagnostic de financement',
    href: 'https://www.anil.org/outils/outils-de-calcul/diagnostic-de-financement/',
    description: 'Conseil gratuit et neutre, calcul de budget avant d’emprunter.',
  },
];
