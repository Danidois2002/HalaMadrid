/* Prépare la base au démarrage : schéma, données de départ (si la base est vide) et comptes */
import { readFileSync } from 'node:fs';
import bcrypt from 'bcryptjs';

const schema = readFileSync(new URL('../db/schema.sql', import.meta.url), 'utf8');
export const seedData = JSON.parse(readFileSync(new URL('../db/seed-data.json', import.meta.url), 'utf8'));

// Compte démo public, affiché sur le site pour que les visiteurs puissent tester l'espace admin
export const DEMO_ACCOUNT = { username: 'demo', password: 'halamadrid' };

async function seed(db) {
  await db.tx(async (t) => {
    for (const team of seedData.teams) {
      await t.query(
        `INSERT INTO teams (id, name, short, season, feminine, photo, intro, staff, lineup, sort)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [team.id, team.name, team.short, team.season, team.feminine, team.photo, team.intro,
          JSON.stringify(team.staff), JSON.stringify(team.lineup), team.sort],
      );
      for (const [i, p] of team.players.entries()) {
        await t.query(
          'INSERT INTO players (id, team_id, name, short, pos, photo, sort) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [p.id, team.id, p.name, p.short ?? null, p.pos, p.photo ?? null, i],
        );
      }
    }
    // Les actualités gardent l'ordre du site : la première est la plus récente
    for (const [i, n] of seedData.news.entries()) {
      await t.query(
        `INSERT INTO news (id, title, cat, img, published_at) VALUES ($1, $2, $3, $4, now() - make_interval(days => $5))`,
        [n.id, n.title, n.cat, n.img ?? '', i + 1],
      );
    }
    for (const [i, p] of seedData.products.entries()) {
      await t.query(
        'INSERT INTO products (id, type, name, tag, price_cents, description, kit, sort) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [p.id, p.type, p.name, p.tag ?? '', Math.round(p.price * 100), p.desc ?? '', p.kit ? JSON.stringify(p.kit) : null, i],
      );
    }
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

export async function setupDatabase(db, config) {
  await db.exec(schema);
  const { rows } = await db.query('SELECT count(*)::int AS n FROM teams');
  if (rows[0].n === 0) await seed(db);
  await upsertUser(db, DEMO_ACCOUNT.username, DEMO_ACCOUNT.password, 'demo');
  if (config.adminPassword) await upsertUser(db, config.adminUsername, config.adminPassword, 'admin');
}
