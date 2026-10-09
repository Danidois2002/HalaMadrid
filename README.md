<div align="center">

# ⚽ ¡Hala Madrid!

**Site de supporters du Real Madrid : les équipes, les actualités et une boutique avec un configurateur de maillot.**

Projet étudiant entièrement repensé : une seule page en HTML, CSS et JavaScript natifs, sans framework.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Aucune dépendance](https://img.shields.io/badge/d%C3%A9pendances-0-brightgreen?style=flat-square)

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
| 🧺 **Panier** | Tiroir latéral, quantités, livraison offerte dès 100 €, commande simulée |
| 🔐 **Espace admin** | Publier ou supprimer des actualités, ajouter ou retirer des joueurs |

> [!TIP]
> Pour tester l'espace admin : page **Connexion**, identifiant `admin`, mot de passe `admin123` (identifiants de démonstration).

## 🛠️ Côté technique

- **Navigation par écrans** dans une seule page (`#/equipes/feminine`, `#/boutique/domicile`…)
- **Maillots 100 % SVG** générés en JavaScript : silhouette, motifs, couleurs et flocage changent selon le produit et les choix de l'utilisateur
- **Données sauvegardées dans le navigateur** (`localStorage`) : panier, actualités et effectifs modifiés par l'admin
- **Accessibilité** : navigation au clavier, `<dialog>` natif, `aria-current` et `aria-pressed`, réglage « réduire les animations » respecté
- **Images en WebP** : les 47 visuels pèsent environ 360 Ko au total

## 🚀 Lancer en local

Aucune installation : ouvrez `index.html`, ou servez le dossier avec un serveur local (WAMP, `npx serve`, Live Server…).

## 📁 Structure

```
HalaMadrid/
├── index.html          # l'enveloppe : en-tête, panier, pied de page
├── css/styles.css      # le design
├── js/data.js          # effectifs, actualités, produits, palmarès
├── js/app.js           # navigation, pages, maillots SVG, panier, admin
├── img/                # écusson, joueurs, staff, actualités, équipes (WebP)
└── docs/preview.webp   # capture utilisée dans ce README
```

## ⚠️ Mentions

Projet étudiant **non officiel**, sans lien avec le Real Madrid C.F. Les noms, logos et photos appartiennent à leurs propriétaires respectifs. Les effectifs sont ceux de la saison 2023-24. La boutique est une démonstration : aucun paiement n'est demandé et aucune commande n'est réellement passée.

---

<div align="center">

Réalisé par **Danial Bitar** · [GitHub](https://github.com/Danidois2002) · [LinkedIn](https://www.linkedin.com/in/daniel-bitar-992ab3258)

</div>
