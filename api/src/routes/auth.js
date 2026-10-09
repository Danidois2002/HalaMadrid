import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { z } from 'zod';
import { login, requireAuth } from '../auth.js';
import { parse } from '../errors.js';

const credentials = z.object({
  username: z.string().trim().min(1).max(40),
  password: z.string().min(1).max(200),
});

export function authRoutes(db, config) {
  const router = Router();
  // Freine les essais de mots de passe en série : N échecs par IP toutes les 15 minutes (les connexions réussies ne comptent pas)
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: config.loginLimit,
    skipSuccessfulRequests: true,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: 'Trop de tentatives de connexion, réessayez dans quelques minutes.' },
  });

  router.post('/login', limiter, async (req, res) => {
    const { username, password } = parse(credentials, req.body);
    res.json(await login(db, config, username, password));
  });

  router.get('/me', requireAuth(db, config), (req, res) => res.json({ user: req.user }));

  return router;
}
