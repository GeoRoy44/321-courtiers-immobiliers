# 321 Courtiers Immobiliers

Annuaire éditorial indépendant pour aider les internautes à trouver un courtier en prêt immobilier près de chez eux.

## Stack

- Astro 5 en génération statique
- CSS natif
- TypeScript
- GitHub
- Cloudflare Pages
- `@astrojs/sitemap`

## Lancer le site en local

```bash
npm install
npm run dev
```

Le site est disponible sur `http://localhost:4321`.

## Vérifier et construire

```bash
npm run check
npm run build
```

Le dossier statique généré est `dist/`.

## Déployer sur Cloudflare Pages

1. Dans Cloudflare, ouvrez **Workers & Pages** puis **Create application**.
2. Choisissez **Pages** puis connectez le dépôt `GeoRoy44/321-courtiers-immobiliers`.
3. Configurez les valeurs suivantes :
   - Production branch : `main`
   - Build command : `npm run build`
   - Build output directory : `dist`
   - Node.js : `20` ou plus récent
4. Lancez le déploiement.
5. Dans **Custom domains**, ajoutez votre domaine. Une fois le domaine connu, remplacez `https://example.com` dans `astro.config.mjs` par son URL canonique, puis poussez ce changement.

Un Worker Cloudflare n'est pas nécessaire pour la V1 : le site est entièrement statique. Un Worker devient utile plus tard pour recevoir un formulaire, géocoder une adresse, synchroniser une base de courtiers ou connecter un CRM.

## Ajouter des courtiers

Les données de démonstration sont dans `src/data/courtiers.ts`. Ajoutez les fiches importées depuis votre base en gardant les champs : nom, ville, département, régions, site, spécialités, description et date de vérification. Ne publiez que des informations publiques ou autorisées, et indiquez la date de vérification sur les pages de ville.
