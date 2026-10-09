/* Tests de l'API sur une vraie base PostgreSQL (PGlite en mémoire, recréée pour chaque fichier de test) */
import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { loadConfig } from '../src/config.js';
import { connect } from '../src/db.js';
import { DEMO_ACCOUNT, seedData, setupDatabase } from '../src/setup.js';

const ADMIN = { username: 'admin', password: 'mot-de-passe-de-test' };
let db;
let api;

before(async () => {
  const config = loadConfig({ ADMIN_PASSWORD: ADMIN.password, LOGIN_LIMIT: '5' });
  db = await connect('pglite://memory');
  await setupDatabase(db, config);
  api = request(createApp({ db, config }));
});
after(() => db.close());

const tokenFor = async (account) => (await api.post('/api/auth/login').send(account).expect(200)).body.token;

describe('lecture publique', () => {
  test('santé', async () => {
    await api.get('/api/health').expect(200, { ok: true });
  });

  test('les 3 équipes avec effectif et onze type', async () => {
    const { body } = await api.get('/api/teams').expect(200);
    assert.deepEqual(body.map((t) => t.id), ['masculine', 'feminine', 'academie']);
    const men = body[0];
    assert.equal(men.players.length, 25);
    assert.deepEqual(men.lineup.ATT, ['diomande', 'mbappe', 'guler']);
    assert.equal(men.staff[1].name, 'José Mourinho');
  });

  test('équipe inconnue : 404', async () => {
    await api.get('/api/teams/barca').expect(404);
  });

  test('produits avec prix en euros', async () => {
    const { body } = await api.get('/api/products').expect(200);
    assert.equal(body.length, 6);
    assert.equal(body.find((p) => p.id === 'domicile').price, 90);
  });

  test('actualités de la plus récente à la plus ancienne', async () => {
    const { body } = await api.get('/api/news').expect(200);
    assert.equal(body[0].id, 'convocation-villarreal');
    assert.equal(body.at(-1).id, 'courtois-ballon-or');
  });
});

describe('connexion', () => {
  test('mauvais mot de passe : 401 sans dire si le compte existe', async () => {
    const wrong = await api.post('/api/auth/login').send({ username: 'admin', password: 'faux' }).expect(401);
    const unknown = await api.post('/api/auth/login').send({ username: 'personne', password: 'faux' }).expect(401);
    assert.equal(wrong.body.error, unknown.body.error);
  });

  test('le compte démo se connecte et /me le reconnaît', async () => {
    const token = await tokenFor(DEMO_ACCOUNT);
    const { body } = await api.get('/api/auth/me').set('Authorization', `Bearer ${token}`).expect(200);
    assert.equal(body.user.role, 'demo');
  });

  test('jeton invalide : 401', async () => {
    await api.get('/api/auth/me').set('Authorization', 'Bearer pas-un-jeton').expect(401);
  });
});

describe('droits admin et démo', () => {
  test('écrire sans être connecté : 401', async () => {
    await api.post('/api/news').send({ title: 'Test', cat: 'Équipe' }).expect(401);
  });

  test('données invalides : 400 avec le détail', async () => {
    const token = await tokenFor(DEMO_ACCOUNT);
    const { body } = await api.post('/api/news').set('Authorization', `Bearer ${token}`)
      .send({ title: 'x', cat: 'Inconnue', img: 'https://exemple.com/a.png' }).expect(400);
    assert.deepEqual(body.details.map((d) => d.field).sort(), ['cat', 'img', 'title']);
  });

  test('le compte démo publie, ne supprime pas le contenu du club, supprime le sien', async () => {
    const token = await tokenFor(DEMO_ACCOUNT);
    const auth = { Authorization: `Bearer ${token}` };
    const { body: created } = await api.post('/api/news').set(auth).send({ title: 'Victoire au Bernabéu', cat: 'Matchs' }).expect(201);
    const { body: news } = await api.get('/api/news');
    assert.equal(news[0].id, created.id);
    await api.delete('/api/news/convocation-villarreal').set(auth).expect(403);
    await api.delete(`/api/news/${created.id}`).set(auth).expect(204);
  });

  test("l'admin supprime n'importe quelle actualité", async () => {
    const token = await tokenFor(ADMIN);
    await api.delete('/api/news/courtois-ballon-or').set('Authorization', `Bearer ${token}`).expect(204);
    const { body } = await api.get('/api/news');
    assert.ok(!body.some((n) => n.id === 'courtois-ballon-or'));
  });

  test("ajout et retrait d'un joueur", async () => {
    const token = await tokenFor(DEMO_ACCOUNT);
    const auth = { Authorization: `Bearer ${token}` };
    const { body: player } = await api.post('/api/teams/academie/players').set(auth).send({ name: 'Nouveau Talent', pos: 'MID' }).expect(201);
    const { body: team } = await api.get('/api/teams/academie');
    assert.ok(team.players.some((p) => p.id === player.id));
    await api.delete('/api/players/valverde').set(auth).expect(403);
    await api.delete(`/api/players/${player.id}`).set(auth).expect(204);
  });

  test('les ajouts du compte démo expirés ne sont plus visibles', async () => {
    await db.query("INSERT INTO news (id, title, cat, expires_at) VALUES ('vieux', 'Ancienne démo', 'Équipe', now() - interval '1 minute')");
    const { body } = await api.get('/api/news');
    assert.ok(!body.some((n) => n.id === 'vieux'));
  });
});

describe('commandes', () => {
  test('le serveur calcule le total (flocage + livraison offerte dès 100 €)', async () => {
    const { body } = await api.post('/api/orders').send({
      items: [
        { productId: 'domicile', size: 'M', flocage: { name: 'bellingham', number: 5 }, qty: 1, price: 1 },
        { productId: 'echarpe', qty: 2 },
      ],
    }).expect(201);
    assert.match(body.reference, /^RM-\d{6}$/);
    assert.equal(body.subtotal, 90 + 15 + 2 * 25);
    assert.equal(body.shipping, 0);
    assert.equal(body.items[0].flocage.name, 'BELLINGHAM');
  });

  test('livraison payante sous 100 €', async () => {
    const { body } = await api.post('/api/orders').send({ items: [{ productId: 'ballon', qty: 1 }] }).expect(201);
    assert.equal(body.total, 30 + 6.9);
  });

  test('maillot sans taille, produit inconnu ou panier vide : 400', async () => {
    await api.post('/api/orders').send({ items: [{ productId: 'domicile', qty: 1 }] }).expect(400);
    await api.post('/api/orders').send({ items: [{ productId: 'inconnu', qty: 1 }] }).expect(400);
    await api.post('/api/orders').send({ items: [] }).expect(400);
    await api.post('/api/orders').send({ items: [{ productId: 'echarpe', size: 'M', qty: 1 }] }).expect(400);
  });

  test("les commandes sont visibles dans l'espace admin, pas en public", async () => {
    await api.get('/api/orders').expect(401);
    const token = await tokenFor(DEMO_ACCOUNT);
    const { body } = await api.get('/api/orders').set('Authorization', `Bearer ${token}`).expect(200);
    assert.equal(body.stats.count, 2);
    assert.equal(body.orders[0].items[0].name, 'Ballon d’entraînement');
  });
});

describe('mise à jour des données de départ', () => {
  test('même version : rien n’est rechargé (une suppression admin reste faite)', async () => {
    await setupDatabase(db, loadConfig({}));
    const { body } = await api.get('/api/news');
    assert.ok(!body.some((n) => n.id === 'courtois-ballon-or'));
  });

  test('nouvelle version : le contenu du club est remplacé, les ajouts admin sont gardés', async () => {
    const token = await tokenFor(ADMIN);
    const { body: added } = await api.post('/api/news').set('Authorization', `Bearer ${token}`)
      .send({ title: 'Annonce ajoutée par l’admin', cat: 'Équipe' }).expect(201);
    const next = {
      ...seedData,
      version: 'test-2',
      news: [{ id: 'nouvelle', title: 'Nouvelle saison', cat: 'Matchs', date: '2027-08-01', img: '' }],
      teams: seedData.teams.map((t) => (t.id === 'masculine' ? { ...t, season: 'Effectif 2027-28' } : t)),
    };
    await setupDatabase(db, loadConfig({}), next);
    const { body: news } = await api.get('/api/news');
    assert.deepEqual(news.map((n) => n.id).sort(), [added.id, 'nouvelle'].sort());
    const { body: men } = await api.get('/api/teams/masculine');
    assert.equal(men.season, 'Effectif 2027-28');
    // les commandes passées restent valides : les produits ne sont jamais supprimés
    const { body: orders } = await api.get('/api/orders').set('Authorization', `Bearer ${token}`).expect(200);
    assert.equal(orders.stats.count, 2);
  });
});

describe('protections', () => {
  test('JSON invalide : 400', async () => {
    await api.post('/api/orders').set('Content-Type', 'application/json').send('{pas du json').expect(400);
  });

  test('trop de tentatives de connexion : 429', async () => {
    let last;
    for (let i = 0; i < 6; i += 1) last = await api.post('/api/auth/login').send({ username: 'x', password: 'y' });
    assert.equal(last.status, 429);
  });
});
