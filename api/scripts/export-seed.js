/* Exporte les données du site (src/data.js) vers db/seed-data.json : l'API les charge au premier démarrage,
   puis les recharge quand DATA_VERSION change.
   usage : node scripts/export-seed.js */
import { writeFileSync } from 'node:fs';

const data = await import('../../src/data.js');

const seed = {
  version: data.DATA_VERSION,
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
