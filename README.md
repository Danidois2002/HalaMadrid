<div align="center">

# ⚽ ¡Hala Madrid!

**Site de supporters du Real Madrid : les équipes, les actualités et une boutique avec un configurateur de maillot.**

Projet étudiant entièrement repensé : un front en HTML, CSS et JavaScript natifs, et une **API Node.js + PostgreSQL** pour les données, l'espace admin et les commandes.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-5FA04E?style=flat-square&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
[![Tests de l'API](https://github.com/Danidois2002/HalaMadrid/actions/workflows/api.yml/badge.svg)](https://github.com/Danidois2002/HalaMadrid/actions/workflows/api.yml)

<a href="https://danidois2002.github.io/HalaMadrid/"><img src="https://img.shields.io/badge/D%C3%A9mo-en%20ligne-d4a937?style=for-the-badge&logo=githubpages&logoColor=black" alt="Voir la démo en ligne" /></a>

🔗 **[danidois2002.github.io/HalaMadrid](https://danidois2002.github.io/HalaMadrid/)** · [Configurer un maillot](https://danidois2002.github.io/HalaMadrid/#/boutique/domicile)

<a href="https://danidois2002.github.io/HalaMadrid/"><img src="docs/preview.webp" alt="Page d'accueil : titre « ¡Hala Madrid! » et maillot domicile floqué Bellingham 5" width="900" /></a>

</div>

---

## ✨ Fonctionnalités

| | |
|---|---|
| 🏟️ **Accueil** | Palmarès animé, dernières actualités, les 3 équipes et un aperçu de la boutique |
| 👕 **Équipes** | Équipe masculine, féminine et académie : onze type en 4-3-3 sur un terrain, staff, effectif filtrable par poste et recherche par nom |
| 📰 **Actualités** | Filtres par catégorie (transferts, équipe, matchs, féminine, histoire) |
| 🛒 **Boutique** | 4 maillots dessinés en SVG avec leur propre col et motif, écharpe et ballon |
| 🎨 **Configurateur** | Taille, flocage d'un joueur ou personnalisé (nom + numéro) avec aperçu en direct, vue face et dos qui pivote en 3D |
| 🧺 **Panier** | Tiroir latéral, quantités, livraison offerte dès 100 €, commande enregistrée par l'API (prix recalculés par le serveur) |
| 🔐 **Espace admin** | Publier ou supprimer des actualités, ajouter ou retirer des joueurs, voir les dernières commandes |

> [!TIP]
> Pour tester l'espace admin : page **Connexion**, identifiant `demo`, mot de passe `halamadrid`. Ce compte public peut publier et modifier les effectifs : ses ajouts disparaissent au bout de 24 h et il ne peut supprimer que ce qu'il a ajouté.

## 🛠️ Côté technique

- **Navigation par écrans** dans une seule page (`#/equipes/feminine`, `#/boutique/domicile`…)
- **Maillots 100 % SVG** générés en JavaScript : silhouette, motifs, couleurs et flocage changent selon le produit et les choix de l'utilisateur
- **API REST** (Node.js, Express, PostgreSQL) : connexion par jeton JWT, rôles admin et démo, validation des données, commandes enregistrées en transaction, 22 tests automatisés. Détails dans [api/README.md](api/README.md)
- **Toujours affiché** : le site s'ouvre tout de suite avec les données de `js/data.js`, puis passe sur celles de l'API dès qu'elle répond. Sans serveur, il fonctionne seul (stockage du navigateur, compte `admin` / `admin123`)
- **Panier sauvegardé dans le navigateur** (`localStorage`)
- **Accessibilité** : navigation au clavier, `<dialog>` natif, `aria-current` et `aria-pressed`, réglage « réduire les animations » respecté
- **Images en WebP** : les 47 visuels pèsent environ 360 Ko au total

## 🚀 Lancer en local

**Le site** : servez le dossier avec un serveur local (WAMP, `npx serve`, Live Server…). Ouvert sur `localhost`, il utilise l'API locale si elle tourne.

**L'API** :

```bash
cd api
npm install
npm run dev
```

Rien d'autre à installer : en local, la base PostgreSQL tourne dans Node grâce à PGlite.

## 📁 Structure

```
HalaMadrid/
├── index.html          # l'enveloppe : en-tête, panier, pied de page
├── css/styles.css      # le design
├── js/data.js          # données de départ (aussi utilisées sans serveur)
├── js/config.js        # adresse de l'API
├── js/api.js           # client de l'API (requêtes, jeton de connexion)
├── js/app.js           # navigation, pages, maillots SVG, panier, admin
├── api/                # API Node.js + PostgreSQL (voir api/README.md)
├── render.yaml         # déploiement de l'API sur Render
├── img/                # écusson, joueurs, staff, actualités, équipes (WebP)
└── docs/preview.webp   # capture utilisée dans ce README
```

## ⚠️ Mentions

Projet étudiant **non officiel**, sans lien avec le Real Madrid C.F. Les noms, logos et photos appartiennent à leurs propriétaires respectifs. Les effectifs, le staff et les actualités sont ceux de la saison 2026-27 (d’après realmadrid.com, octobre 2026). La boutique est une démonstration : aucun paiement n'est demandé et aucune commande n'est livrée.

---

<div align="center">

Réalisé par **Danial Bitar** · [GitHub](https://github.com/Danidois2002) · [LinkedIn](https://www.linkedin.com/in/daniel-bitar-992ab3258)

</div>
