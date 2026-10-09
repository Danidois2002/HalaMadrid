/* Commandes de la boutique : le serveur recalcule tous les prix, il ne fait jamais confiance au navigateur */
import { randomInt } from 'node:crypto';
import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { z } from 'zod';
import { requireAuth } from '../auth.js';
import { HttpError, parse } from '../errors.js';
import { seedData } from '../setup.js';

const FLOCAGE_CENTS = seedData.flocagePrice * 100;
const SHIPPING_CENTS = 690;
const FREE_SHIPPING_FROM_CENTS = 10000;

const flocage = z.object({
  name: z.string().trim().toUpperCase().regex(/^[\p{L}\p{M}0-9 .'-]{1,12}$/u, 'Nom de flocage invalide (12 caractères maximum).'),
  // "10" (champ libre) ou 10 (joueur choisi) : les deux sont acceptés
  number: z.preprocess((v) => (typeof v === 'string' && /^\d{1,2}$/.test(v) ? Number(v) : v), z.number().int().min(0).max(99)),
});
const orderBody = z.object({
  items: z.array(z.object({
    productId: z.string().min(1).max(40),
    size: z.enum(seedData.sizes).nullish(),
    flocage: flocage.nullish(),
    qty: z.number().int().min(1).max(10),
  })).min(1).max(20),
});

const cents = (n) => n / 100;

async function uniqueReference(t) {
  for (;;) {
    const reference = `RM-${randomInt(100000, 1000000)}`;
    const { rows } = await t.query('SELECT 1 FROM orders WHERE reference = $1', [reference]);
    if (!rows[0]) return reference;
  }
}

export function orderRoutes(db, config) {
  const router = Router();
  const limiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: config.orderLimit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: 'Trop de commandes depuis cette connexion, réessayez plus tard.' },
  });

  router.post('/', limiter, async (req, res) => {
    const { items } = parse(orderBody, req.body);
    const ids = [...new Set(items.map((i) => i.productId))];
    const { rows } = await db.query('SELECT id, type, name, price_cents FROM products WHERE id = ANY($1)', [ids]);
    const products = new Map(rows.map((r) => [r.id, r]));

    const lines = items.map((item) => {
      const product = products.get(item.productId);
      if (!product) throw new HttpError(400, `Produit inconnu : ${item.productId}.`);
      if (product.type === 'jersey' && !item.size) throw new HttpError(400, `Choisissez une taille pour « ${product.name} ».`);
      if (product.type !== 'jersey' && (item.size || item.flocage)) throw new HttpError(400, `« ${product.name} » n'a ni taille ni flocage.`);
      const unit = product.price_cents + (item.flocage ? FLOCAGE_CENTS : 0);
      return { product, size: item.size ?? null, flocage: item.flocage ?? null, qty: item.qty, unit };
    });
    const subtotal = lines.reduce((sum, l) => sum + l.unit * l.qty, 0);
    const shipping = subtotal >= FREE_SHIPPING_FROM_CENTS ? 0 : SHIPPING_CENTS;

    // Commande et lignes enregistrées ensemble : jamais de commande à moitié écrite
    const order = await db.tx(async (t) => {
      const reference = await uniqueReference(t);
      const { rows: [created] } = await t.query(
        'INSERT INTO orders (reference, subtotal_cents, shipping_cents, total_cents) VALUES ($1, $2, $3, $4) RETURNING id, reference, created_at',
        [reference, subtotal, shipping, subtotal + shipping],
      );
      for (const l of lines) {
        await t.query(
          `INSERT INTO order_items (order_id, product_id, size, flocage_name, flocage_number, qty, unit_price_cents)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [created.id, l.product.id, l.size, l.flocage?.name ?? null, l.flocage?.number ?? null, l.qty, l.unit],
        );
      }
      return created;
    });

    res.status(201).json({
      reference: order.reference,
      createdAt: order.created_at,
      subtotal: cents(subtotal),
      shipping: cents(shipping),
      total: cents(subtotal + shipping),
      items: lines.map((l) => ({
        productId: l.product.id, name: l.product.name, size: l.size, flocage: l.flocage, qty: l.qty, unitPrice: cents(l.unit),
      })),
    });
  });

  // Dernières commandes et chiffres clés, pour l'espace admin
  router.get('/', requireAuth(db, config), async (_req, res) => {
    const { rows } = await db.query(`
      SELECT o.reference, o.total_cents, o.created_at,
             coalesce(json_agg(json_build_object(
               'name', p.name, 'size', i.size, 'flocageName', i.flocage_name, 'flocageNumber', i.flocage_number, 'qty', i.qty
             ) ORDER BY i.id) FILTER (WHERE i.id IS NOT NULL), '[]') AS items
      FROM orders o
      LEFT JOIN order_items i ON i.order_id = o.id
      LEFT JOIN products p ON p.id = i.product_id
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT 20`);
    const { rows: [stats] } = await db.query(
      'SELECT count(*)::int AS count, coalesce(sum(total_cents), 0)::int AS revenue_cents FROM orders',
    );
    res.json({
      stats: { count: stats.count, revenue: cents(stats.revenue_cents) },
      orders: rows.map((r) => ({ reference: r.reference, total: cents(r.total_cents), createdAt: r.created_at, items: r.items })),
    });
  });

  return router;
}
