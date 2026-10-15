# Retrait ciblé des anciennes URL

Le 15 octobre 2026, sept chemins complets ont été relevés dans la capture fournie par le propriétaire. Ils renvoient désormais une réponse HTTP `410 Gone` via `worker/index.mjs`. La liste exacte est maintenue dans `worker/retired-paths.mjs`.

Les versions avec ou sans slash final et avec paramètres de requête reçoivent le même statut. Les réponses HEAD ne contiennent pas de corps. Il n'y a ni redirection vers l'accueil ni règle globale transformant toutes les erreurs 404 en 410.

Les résultats « Asianbookie5 » et « Kingtop » de l'autre capture ont une adresse tronquée. Ils ne sont pas ajoutés par supposition : leurs URL complètes ou un export Search Console sont nécessaires.

## Déploiement et contrôles

Le site utilise Astro statique avec Cloudflare Workers Static Assets. `wrangler.jsonc` déclare le script Worker et le binding `ASSETS`. Les fichiers statiques existants restent prioritaires ; lorsqu'aucun fichier ne correspond, le Worker traite la liste ciblée et délègue toutes les autres requêtes à `ASSETS`, y compris les véritables 404.

```sh
npm test
npm run build
npm run test:built
npx wrangler deploy --dry-run
npx wrangler dev --local
```

Après déploiement, contrôler GET et HEAD sur chaque chemin, puis l'accueil, les trois pages de ville, les articles, robots.txt et les sitemaps. Le contrôle du site construit garantit l'absence des sept chemins dans les fichiers HTML et le sitemap, afin qu'aucun fichier statique ne masque leur réponse 410.

Ne pas bloquer ces chemins dans robots.txt : les robots doivent pouvoir constater la suppression. Google indique traiter les réponses 404 et 410 comme des contenus absents et retirer les URL de l'index au fil du temps, sans délai garanti : [documentation Google](https://developers.google.com/search/docs/crawling-indexing/http-network-errors).

Le routage utilisé est décrit dans la [documentation Cloudflare Workers](https://developers.cloudflare.com/workers/static-assets/routing/worker-script/).
