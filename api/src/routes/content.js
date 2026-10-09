/* Équipes, joueurs, actualités et produits */
import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { assertCanDelete, requireAuth } from '../auth.js';
import { HttpError, parse } from '../errors.js';
import { seedData } from '../setup.js';

const DEMO_TTL_MS = 24 * 60 * 60 * 1000; // les ajouts du compte démo disparaissent au bout de 24 h
const DEMO_QUOTA = 20; // nombre maximum d'ajouts actifs pour le compte démo (anti-spam)
const VISIBLE = '(expires_at IS NULL OR expires_at > now())';

const toPlayer = (r) => ({ id: r.id, name: r.name, short: r.short ?? undefined, pos: r.pos, photo: r.photo ?? undefined, createdBy: r.created_by });
const toNews = (r) => ({ id: r.id, title: r.title, cat: r.cat, img: r.img, createdBy: r.created_by, publishedAt: r.published_at });
const toProduct = (r) => ({ id: r.id, type: r.type, name: r.name, tag: r.tag, price: r.price_cents / 100, desc: r.description, kit: r.kit ?? undefined });
const toTeam = (r, players) => ({
  id: r.id, name: r.name, short: r.short, season: r.season, feminine: r.feminine, photo: r.photo,
  intro: r.intro, staff: r.staff, lineup: r.lineup, players,
});

const newsBody = z.object({
  title: z.string().trim().min(3).max(80),
  cat: z.enum(seedData.newsCategories),
  // Seules les images déjà présentes sur le site sont acceptées
  img: z.union([z.literal(''), z.string().regex(/^img\/actus\/[a-z0-9-]+\.webp$/)]).default(''),
});
const playerBody = z.object({
  name: z.string().trim().min(2).max(40),
  pos: z.enum(['GK', 'DEF', 'MID', 'ATT']),
});

const expiresFor = (user) => (user.role === 'demo' ? new Date(Date.now() + DEMO_TTL_MS) : null);

async function purgeExpired(db) {
  await db.query('DELETE FROM news WHERE expires_at <= now()');
  await db.query('DELETE FROM players WHERE expires_at <= now()');
}

async function checkDemoQuota(db, user) {
  if (user.role !== 'demo') return;
  const { rows } = await db.query(
    `SELECT (SELECT count(*) FROM news WHERE created_by = $1 AND ${VISIBLE})
          + (SELECT count(*) FROM players WHERE created_by = $1 AND ${VISIBLE}) AS n`,
    [user.id],
  );
  if (Number(rows[0].n) >= DEMO_QUOTA) throw new HttpError(429, 'Limite du compte démo atteinte : supprimez un de vos ajouts.');
}

async function loadTeams(db, teamId) {
  const teams = await db.query(`SELECT * FROM teams ${teamId ? 'WHERE id = $1' : ''} ORDER BY sort`, teamId ? [teamId] : []);
  const players = await db.query(
    `SELECT * FROM players WHERE ${VISIBLE} ${teamId ? 'AND team_id = $1' : ''} ORDER BY sort, created_at`,
    teamId ? [teamId] : [],
  );
  return teams.rows.map((t) => toTeam(t, players.rows.filter((p) => p.team_id === t.id).map(toPlayer)));
}

export function contentRoutes(db, config) {
  const router = Router();
  const auth = requireAuth(db, config);

  router.get('/teams', async (_req, res) => res.json(await loadTeams(db)));

  router.get('/teams/:id', async (req, res) => {
    const [team] = await loadTeams(db, req.params.id);
    if (!team) throw new HttpError(404, 'Équipe introuvable.');
    res.json(team);
  });

  router.post('/teams/:id/players', auth, async (req, res) => {
    const body = parse(playerBody, req.body);
    const { rows: teams } = await db.query('SELECT id FROM teams WHERE id = $1', [req.params.id]);
    if (!teams[0]) throw new HttpError(404, 'Équipe introuvable.');
    await purgeExpired(db);
    await checkDemoQuota(db, req.user);
    const { rows } = await db.query(
      `INSERT INTO players (id, team_id, name, pos, sort, created_by, expires_at)
       VALUES ($1, $2, $3, $4, 1000, $5, $6) RETURNING *`,
      [`p-${randomUUID()}`, req.params.id, body.name, body.pos, req.user.id, expiresFor(req.user)],
    );
    res.status(201).json(toPlayer(rows[0]));
  });

  router.delete('/players/:id', auth, async (req, res) => {
    const { rows } = await db.query(`SELECT id, created_by FROM players WHERE id = $1 AND ${VISIBLE}`, [req.params.id]);
    if (!rows[0]) throw new HttpError(404, 'Joueur introuvable.');
    assertCanDelete(req.user, rows[0]);
    await db.query('DELETE FROM players WHERE id = $1', [req.params.id]);
    res.status(204).end();
  });

  router.get('/news', async (_req, res) => {
    const { rows } = await db.query(`SELECT * FROM news WHERE ${VISIBLE} ORDER BY published_at DESC`);
    res.json(rows.map(toNews));
  });

  router.post('/news', auth, async (req, res) => {
    const body = parse(newsBody, req.body);
    await purgeExpired(db);
    await checkDemoQuota(db, req.user);
    const { rows } = await db.query(
      'INSERT INTO news (id, title, cat, img, created_by, expires_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [`n-${randomUUID()}`, body.title, body.cat, body.img, req.user.id, expiresFor(req.user)],
    );
    res.status(201).json(toNews(rows[0]));
  });

  router.delete('/news/:id', auth, async (req, res) => {
    const { rows } = await db.query(`SELECT id, created_by FROM news WHERE id = $1 AND ${VISIBLE}`, [req.params.id]);
    if (!rows[0]) throw new HttpError(404, 'Actualité introuvable.');
    assertCanDelete(req.user, rows[0]);
    await db.query('DELETE FROM news WHERE id = $1', [req.params.id]);
    res.status(204).end();
  });

  router.get('/products', async (_req, res) => {
    const { rows } = await db.query('SELECT * FROM products ORDER BY sort');
    res.json(rows.map(toProduct));
  });

  return router;
}
