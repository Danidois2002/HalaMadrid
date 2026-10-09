/* Exporte les données du site (js/data.js) vers db/seed-data.json, utilisé pour remplir une base vide.
   usage : node scripts/export-seed.js */
import { readFileSync, writeFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../../js/data.js', import.meta.url), 'utf8');
// data.js est un script navigateur (des const globales) : on l'exécute à part et on récupère ses valeurs
const data = runInNewContext(`${source}\n;({ TEAMS, NEWS, NEWS_CATEGORIES, PRODUCTS, SIZES, FLOCAGE_PRICE })`);

const seed = {
  teams: Object.entries(data.TEAMS).map(([id, t], i) => ({
    id, name: t.name, short: t.short, season: t.season, feminine: t.feminine, photo: t.photo, intro: t.intro,
    staff: t.staff, lineup: t.lineup, sort: i, players: t.players,
  })),
  newsCategories: data.NEWS_CATEGORIES,
  news: data.NEWS,
  products: data.PRODUCTS,
  sizes: data.SIZES,
  flocagePrice: data.FLOCAGE_PRICE,
};
writeFileSync(new URL('../db/seed-data.json', import.meta.url), `${JSON.stringify(seed, null, 2)}\n`);
console.log(`seed-data.json : ${seed.teams.length} équipes, ${seed.news.length} actualités, ${seed.products.length} produits`);
