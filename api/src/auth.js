/* Authentification : mot de passe vérifié avec bcrypt, puis jeton JWT envoyé dans l'en-tête Authorization */
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { HttpError } from './errors.js';

const TOKEN_TTL = '2h';
// Hash factice : on fait toujours un bcrypt.compare, même si l'utilisateur n'existe pas,
// pour ne pas révéler par le temps de réponse quels noms d'utilisateur existent
const DUMMY_HASH = bcrypt.hashSync('mot-de-passe-factice', 10);

export async function login(db, config, username, password) {
  const { rows } = await db.query('SELECT id, username, role, password_hash FROM users WHERE username = $1', [username]);
  const user = rows[0];
  const ok = await bcrypt.compare(password, user ? user.password_hash : DUMMY_HASH);
  if (!user || !ok) throw new HttpError(401, "Nom d'utilisateur ou mot de passe incorrect.");
  const token = jwt.sign({ sub: String(user.id), role: user.role }, config.jwtSecret, { expiresIn: TOKEN_TTL, algorithm: 'HS256' });
  return { token, user: { id: user.id, username: user.username, role: user.role } };
}

/* Middleware : exige un jeton valide et recharge l'utilisateur (un compte supprimé perd l'accès tout de suite) */
export function requireAuth(db, config) {
  return async (req, _res, next) => {
    const [scheme, token] = (req.get('authorization') || '').split(' ');
    if (scheme !== 'Bearer' || !token) throw new HttpError(401, 'Connexion requise.');
    let payload;
    try {
      payload = jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] });
    } catch {
      throw new HttpError(401, 'Session expirée, reconnectez-vous.');
    }
    const { rows } = await db.query('SELECT id, username, role FROM users WHERE id = $1', [Number(payload.sub)]);
    if (!rows[0]) throw new HttpError(401, 'Compte introuvable.');
    req.user = rows[0];
    next();
  };
}

/* Règle de droits : l'admin peut tout supprimer, le compte démo seulement ce qu'il a créé */
export function assertCanDelete(user, row) {
  if (user.role === 'admin') return;
  if (row.created_by !== user.id) throw new HttpError(403, 'Le compte démo ne peut supprimer que ses propres ajouts.');
}
