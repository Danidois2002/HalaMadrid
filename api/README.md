# API ¡Hala Madrid!

API REST du site de supporters : équipes, actualités, boutique et commandes, avec un espace admin protégé.

**Node.js · Express 5 · PostgreSQL · JWT · Zod · tests automatisés**

## Ce qu'elle fait

- **Données en base PostgreSQL** : équipes (staff, onze type), joueurs, actualités, produits, commandes.
- **Connexion sécurisée** : mots de passe hachés avec bcrypt, jeton JWT valable 2 h envoyé dans l'en-tête `Authorization`.
- **Deux rôles** :
  - `admin` : compte privé, tous les droits ;
  - `demo` : compte public pour tester le site. Ses ajouts disparaissent au bout de 24 h, il ne peut supprimer que ce qu'il a créé et il est limité à 20 ajouts actifs.
- **Commandes recalculées par le serveur** : le navigateur envoie seulement les produits, tailles, flocages et quantités. Les prix, le flocage (+15 €) et la livraison (offerte dès 100 €) sont calculés côté serveur. La commande et ses lignes sont enregistrées dans une seule transaction.
- **Protections** :
  - validation de chaque entrée (Zod), avec la liste des champs en erreur ;
  - requêtes SQL paramétrées ;
  - en-têtes de sécurité (Helmet) ;
  - CORS limité aux sites autorisés ;
  - limite de tentatives de connexion et de commandes par adresse IP ;
  - corps des requêtes limité à 20 Ko.

## Routes

| Méthode | Route | Accès | Rôle |
|---|---|---|---|
| GET | `/api/health` | public | état du serveur et de la base |
| GET | `/api/teams` · `/api/teams/:id` | public | équipes avec staff, onze type et effectif |
| GET | `/api/news` | public | actualités, de la plus récente à la plus ancienne |
| GET | `/api/products` | public | produits de la boutique |
| POST | `/api/orders` | public | passer une commande (prix calculés par le serveur) |
| POST | `/api/auth/login` | public | connexion, renvoie un jeton |
| GET | `/api/auth/me` | connecté | compte connecté |
| POST | `/api/news` | connecté | publier une actualité |
| DELETE | `/api/news/:id` | connecté | supprimer une actualité |
| POST | `/api/teams/:id/players` | connecté | ajouter un joueur |
| DELETE | `/api/players/:id` | connecté | retirer un joueur |
| GET | `/api/orders` | connecté | dernières commandes et montant total |

Les erreurs ont toujours la même forme : `{ "error": "message", "details": [{ "field": "title", "message": "…" }] }`.

## Lancer en local

```bash
cd api
npm install
npm run dev
```

L'API démarre sur `http://localhost:3000`. Sans configuration, elle utilise **PGlite**, un vrai PostgreSQL compilé en WebAssembly qui tourne dans Node : il n'y a rien à installer. Pour garder les données entre deux lancements, copiez `.env.example` en `.env`. Au premier démarrage, la base est remplie avec `db/seed-data.json`.

Le site React (`npm run dev` à la racine du dépôt) utilise automatiquement l'API locale quand il est ouvert sur `localhost`.

## Tests

```bash
npm test
```

Les 22 tests tournent sur une vraie base PostgreSQL en mémoire, recréée à chaque lancement. Ils couvrent :

- la lecture des données ;
- la connexion ;
- les droits admin et démo, et l'expiration des ajouts du compte démo ;
- le calcul des commandes ;
- les erreurs de validation ;
- la limite de tentatives de connexion ;
- le rechargement des données de départ quand leur version change.

Ils sont aussi lancés par GitHub Actions à chaque modification du dossier `api/`.

## Déploiement (gratuit)

1. **Base de données sur [Neon](https://neon.tech)** : créer un projet (région Frankfurt), puis copier l'URL de connexion (`postgresql://…?sslmode=require`).
2. **API sur [Render](https://render.com)** : New → Blueprint, choisir ce dépôt. `render.yaml` configure le service. À la création, renseigner :
   - `DATABASE_URL` : l'URL Neon ;
   - `ADMIN_PASSWORD` : le mot de passe du compte admin privé.

   `JWT_SECRET` est généré automatiquement.
3. Au premier démarrage, l'API crée les tables et remplit la base. Ensuite, à chaque changement de `DATA_VERSION` dans `src/data.js` (puis `node scripts/export-seed.js`), elle recharge le contenu du club : équipes, effectifs, actualités et produits. Les ajouts faits depuis l'espace admin sont conservés.
4. Mettre l'adresse de l'API (`https://….onrender.com`) dans `src/lib/api.js`, puis pousser sur GitHub.

Sur l'offre gratuite de Render, l'API se met en veille après 15 minutes sans visite : le premier appel peut prendre jusqu'à une minute. Le site s'affiche tout de suite avec les données de `src/data.js`, puis passe sur celles de l'API quand elle répond.

## Structure

```
api/
├── src/
│   ├── server.js        # démarrage : base, préparation, écoute HTTP
│   ├── app.js           # Express : sécurité, routes, erreurs
│   ├── config.js        # variables d'environnement
│   ├── db.js            # PostgreSQL (pg) ou PGlite, même interface
│   ├── setup.js         # schéma, données de départ, comptes
│   ├── auth.js          # bcrypt, JWT, règles de droits
│   ├── errors.js        # erreurs HTTP et validation Zod
│   └── routes/          # auth, contenus (équipes, actualités, produits), commandes
├── db/
│   ├── schema.sql       # tables, contraintes et index
│   └── seed-data.json   # données de départ versionnées (générées depuis src/data.js)
├── scripts/export-seed.js
└── test/api.test.js
```
