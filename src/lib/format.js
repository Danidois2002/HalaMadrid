/* Formats et petites aides partagées */
import { POSITIONS } from '../data.js';

export const euro = new Intl.NumberFormat('fr-BE', { style: 'currency', currency: 'EUR' });
export const dateFormat = new Intl.DateTimeFormat('fr-BE', { dateStyle: 'short', timeStyle: 'short' });
export const dayFormat = new Intl.DateTimeFormat('fr-BE', { day: 'numeric', month: 'long', year: 'numeric' });

export const initials = (name) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
/* Nom affiché sur le terrain : surnom s'il existe, sinon le nom de famille */
export const shortName = (p) => p.short || p.name.split(' ').slice(1).join(' ') || p.name;
export const posLabel = (pos, feminine) => (feminine ? POSITIONS[pos].labelF : POSITIONS[pos].label);

export const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Stockage local (jamais envoyé nulle part) */
export const store = {
  get(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } },
  set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* navigation privée */ } },
};
