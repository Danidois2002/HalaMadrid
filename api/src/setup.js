/* Prépare la base au démarrage : schéma, données de départ (si la base est vide) et comptes */
import { readFileSync } from 'node:fs';
import bcrypt from 'bcryptjs';

const schema = readFileSync(new URL('../db/schema.sql', import.meta.url), 'utf8');
export const seedData = JSON.parse(readFileSync(new URL('../db/seed-data.json', import.meta.url), 'utf8'));

// Compte démo public, affiché sur le site pour que les visiteurs puissent tester l'espace admin
export const DEMO_ACCOUNT = { username: 'demo', password: 'halamadrid' };

/* Charge (ou recharge) le contenu du club : équipes, effectifs, actualités et produits.
   Seul le contenu d'origine (created_by vide) est remplacé : les ajouts faits depuis l'espace admin sont gardés. */
async function loadSeed(db, seed) {
  await db.tx(async (t) => {
    await t.query('DELETE FROM players WHERE created_by IS NULL');
    await t.query('DELETE FROM news WHERE created_by IS NULL');
    for (const [sort, team] of seed.teams.entries()) {
      await t.query(
        `INSERT INTO teams (id, name, short, season, feminine, photo, intro, staff, lineup, sort)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, short = EXCLUDED.short, season = EXCLUDED.season,
           feminine = EXCLUDED.feminine, photo = EXCLUDED.photo, intro = EXCLUDED.intro, staff = EXCLUDED.staff,
           lineup = EXCLUDED.lineup, sort = EXCLUDED.sort`,
        [team.id, team.name, team.short, team.season, team.feminine, team.photo, team.intro,
          JSON.stringify(team.staff), JSON.stringify(team.lineup), sort],
      );
      for (const [i, p] of team.players.entries()) {
        await t.query(
          'INSERT INTO players (id, team_id, name, short, pos, photo, sort) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [p.id, team.id, p.name, p.short ?? null, p.pos, p.photo ?? null, i],
        );
      }
    }
    // Actualités datées ; à date égale, l'ordre du fichier est gardé (la première est la plus récente)
    for (const [i, n] of seed.news.entries()) {
      const publishedAt = new Date(`${n.date}T12:00:00Z`);
      publishedAt.setUTCMinutes(publishedAt.getUTCMinutes() - i);
      await t.query(
        'INSERT INTO news (id, title, cat, img, published_at) VALUES ($1, $2, $3, $4, $5)',
        [n.id, n.title, n.cat, n.img ?? '', publishedAt],
      );
    }
    // Produits mis à jour, jamais supprimés : d'anciennes commandes peuvent y faire référence
    for (const [i, p] of seed.products.entries()) {
      await t.query(
        `INSERT INTO products (id, type, name, tag, price_cents, description, kit, sort) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO UPDATE SET type = EXCLUDED.type, name = EXCLUDED.name, tag = EXCLUDED.tag,
           price_cents = EXCLUDED.price_cents, description = EXCLUDED.description, kit = EXCLUDED.kit, sort = EXCLUDED.sort`,
        [p.id, p.type, p.name, p.tag ?? '', Math.round(p.price * 100), p.desc ?? '', p.kit ? JSON.stringify(p.kit) : null, i],
      );
    }
    await t.query(
      `INSERT INTO meta (key, value) VALUES ('seed_version', $1)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      [seed.version],
    );
  });
}

async function upsertUser(db, username, password, role) {
  const hash = await bcrypt.hash(password, 10);
  await db.query(
    `INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3)
     ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role`,
    [username, hash, role],
  );
}

/* seed : paramètre pour les tests ; par défaut, db/seed-data.json */
export async function setupDatabase(db, config, seed = seedData) {
  await db.exec(schema);
  const { rows } = await db.query("SELECT value FROM meta WHERE key = 'seed_version'");
  if (rows[0]?.value !== seed.version) await loadSeed(db, seed);
  await upsertUser(db, DEMO_ACCOUNT.username, DEMO_ACCOUNT.password, 'demo');
  if (config.adminPassword) await upsertUser(db, config.adminUsername, config.adminPassword, 'admin');
}
