/* =========================================================
   État partagé du site : données (API ou data.js), connexion, admin, panier,
   notifications et fenêtre modale
   ========================================================= */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { NEWS, PRODUCTS, TEAMS, FLOCAGE_PRICE } from '../data.js';
import { api, hooks, token } from '../lib/api.js';
import { store } from '../lib/format.js';

const SiteContext = createContext(null);
export const useSite = () => useContext(SiteContext);

/* Identifiants de démonstration affichés sur la page de connexion */
export const demoLogin = api.enabled ? { username: 'demo', password: 'halamadrid' } : { username: 'admin', password: 'admin123' };

const cartKey = (item) => [item.productId, item.size, item.flocage ? `${item.flocage.name}#${item.flocage.number}` : ''].join('|');
export const shippingFor = (sub) => (sub === 0 || sub >= 100 ? 0 : 6.9);

export function SiteProvider({ children }) {
  /* ---------- Données : celles de data.js tout de suite, puis celles de l'API quand elle répond ---------- */
  const [data, setData] = useState({ online: false, teams: TEAMS, news: NEWS, products: PRODUCTS });
  const [user, setUser] = useState(null);
  const [localAdmin, setLocalAdmin] = useState(() => { try { return sessionStorage.getItem('rm-admin') === '1'; } catch { return false; } });
  // Mode sans serveur : les modifications admin restent dans le navigateur
  const [newsEdits, setNewsEdits] = useState(() => store.get('rm-news', { added: [], removed: [] }));
  const [rosterEdits, setRosterEdits] = useState(() => store.get('rm-roster', {}));
  const [cart, setCart] = useState(() => store.get('rm-cart', []));
  const [cartOpen, setCartOpen] = useState(false);
  const [cartBump, setCartBump] = useState(0);
  const [toastState, setToastState] = useState({ text: '', show: false });
  const [modal, setModal] = useState(null);
  const toastTimer = useRef(null);

  useEffect(() => store.set('rm-cart', cart), [cart]);
  useEffect(() => store.set('rm-news', newsEdits), [newsEdits]);
  useEffect(() => store.set('rm-roster', rosterEdits), [rosterEdits]);

  const toast = useCallback((text) => {
    setToastState({ text, show: true });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastState((t) => ({ ...t, show: false })), 2600);
  }, []);
  const openModal = useCallback((content) => setModal(content), []);
  const closeModal = useCallback(() => setModal(null), []);

  /* ---------- Droits ---------- */
  const isAdmin = api.enabled ? Boolean(user) : localAdmin;
  const isDemo = api.enabled && user?.role === 'demo';
  /* Le compte démo ne peut retirer que ses propres ajouts ; l'admin (et le mode sans serveur) peut tout retirer */
  const canDelete = useCallback(
    (item) => isAdmin && (!api.enabled || user.role === 'admin' || item.createdBy === user.id),
    [isAdmin, user],
  );

  /* ---------- Lecture des données ---------- */
  const findProduct = useCallback((id) => data.products.find((p) => p.id === id), [data.products]);
  const teamPlayers = useCallback((teamId) => {
    const team = data.teams[teamId];
    if (data.online) return team.players;
    const edits = rosterEdits[teamId] || { added: [], removed: [] };
    return [...team.players.filter((p) => !edits.removed.includes(p.id)), ...edits.added];
  }, [data, rosterEdits]);
  const allNews = useMemo(
    () => (data.online ? data.news : [...newsEdits.added, ...NEWS.filter((n) => !newsEdits.removed.includes(n.id))]),
    [data, newsEdits],
  );

  /* ---------- API ---------- */
  const loadRemote = useCallback(async () => {
    if (!api.enabled) return;
    try {
      const [teams, news, products] = await Promise.all([
        api.get('/api/teams', { quiet: true }), api.get('/api/news', { quiet: true }), api.get('/api/products', { quiet: true }),
      ]);
      if (token.get()) setUser((await api.get('/api/auth/me', { quiet: true }).catch(() => ({ user: null }))).user);
      setData({ online: true, teams: Object.fromEntries(teams.map((t) => [t.id, t])), news, products });
    } catch {
      // serveur injoignable : le site continue avec les données de data.js
    }
  }, []);

  useEffect(() => {
    hooks.onSlow = () => toast('Le serveur se réveille (hébergement gratuit), encore quelques secondes…');
    hooks.onUnauthorized = () => {
      token.clear();
      setUser(null);
      toast('Session expirée, reconnectez-vous.');
    };
    loadRemote();
  }, [loadRemote, toast]);

  const refreshNews = async () => {
    const news = await api.get('/api/news');
    setData((d) => ({ ...d, news }));
  };
  const refreshTeam = async (teamId) => {
    const team = await api.get(`/api/teams/${encodeURIComponent(teamId)}`);
    setData((d) => ({ ...d, teams: { ...d.teams, [teamId]: team } }));
  };

  /* ---------- Connexion ---------- */
  const login = async (username, password) => {
    if (api.enabled) {
      const res = await api.post('/api/auth/login', { username, password });
      token.set(res.token);
      setUser(res.user);
      if (!data.online) await loadRemote();
      return;
    }
    if (username !== 'admin' || password !== 'admin123') throw new Error("Nom d'utilisateur ou mot de passe incorrect.");
    try { sessionStorage.setItem('rm-admin', '1'); } catch { /* ignore */ }
    setLocalAdmin(true);
  };
  const logout = () => {
    token.clear();
    setUser(null);
    try { sessionStorage.removeItem('rm-admin'); } catch { /* ignore */ }
    setLocalAdmin(false);
    toast('Vous êtes déconnecté');
  };

  /* ---------- Actions admin : API si disponible, sinon stockage local ---------- */
  const addNews = async ({ title, cat, img }) => {
    if (api.enabled) {
      await api.post('/api/news', { title, cat, img });
      await refreshNews();
      return;
    }
    setNewsEdits((e) => ({ ...e, added: [{ id: `admin-${Date.now()}`, title, cat, img }, ...e.added] }));
  };
  const removeNews = async (id) => {
    try {
      if (api.enabled) {
        await api.del(`/api/news/${encodeURIComponent(id)}`);
        await refreshNews();
      } else {
        setNewsEdits((e) => (e.added.some((n) => n.id === id)
          ? { ...e, added: e.added.filter((n) => n.id !== id) }
          : { ...e, removed: [...e.removed, id] }));
      }
      toast('Actualité supprimée');
    } catch (err) {
      toast(err.message);
    }
  };
  const addPlayer = async (teamId, { name, pos }) => {
    if (api.enabled) {
      await api.post(`/api/teams/${encodeURIComponent(teamId)}/players`, { name, pos });
      await refreshTeam(teamId);
      return;
    }
    setRosterEdits((all) => {
      const edits = all[teamId] || { added: [], removed: [] };
      return { ...all, [teamId]: { ...edits, added: [...edits.added, { id: `admin-${Date.now()}`, name, pos }] } };
    });
  };
  const removePlayer = async (teamId, id) => {
    try {
      if (api.enabled) {
        await api.del(`/api/players/${encodeURIComponent(id)}`);
        await refreshTeam(teamId);
      } else {
        setRosterEdits((all) => {
          const edits = all[teamId] || { added: [], removed: [] };
          const next = edits.added.some((p) => p.id === id)
            ? { ...edits, added: edits.added.filter((p) => p.id !== id) }
            : { ...edits, removed: [...edits.removed, id] };
          return { ...all, [teamId]: next };
        });
      }
      toast('Membre retiré de l’effectif');
    } catch (err) {
      toast(err.message);
    }
  };

  /* ---------- Panier ---------- */
  const unitPrice = (item) => findProduct(item.productId).price + (item.flocage ? FLOCAGE_PRICE : 0);
  const subtotal = cart.reduce((sum, i) => sum + unitPrice(i) * i.qty, 0);
  const addToCart = (item) => {
    setCart((current) => {
      const key = cartKey(item);
      const existing = current.find((i) => cartKey(i) === key);
      if (existing) return current.map((i) => (i === existing ? { ...i, qty: Math.min(10, i.qty + item.qty) } : i));
      return [...current, item];
    });
    setCartBump((n) => n + 1); // petit rebond du compteur
  };
  const changeQty = (index, delta) => setCart((c) => c.map((item, i) => (i === index ? { ...item, qty: Math.max(1, Math.min(10, item.qty + delta)) } : item)));
  const removeFromCart = (index) => setCart((c) => c.filter((_, i) => i !== index));

  /* Commande : enregistrée par l'API (prix recalculés côté serveur), simulée sans serveur */
  const checkout = async () => {
    let order;
    if (api.enabled) {
      order = await api.post('/api/orders', {
        items: cart.map((i) => ({ productId: i.productId, size: i.size, flocage: i.flocage, qty: i.qty })),
      });
    } else {
      order = {
        reference: `RM-${Math.floor(100000 + Math.random() * 900000)}`,
        total: subtotal + shippingFor(subtotal),
        items: cart.map((i) => ({ name: findProduct(i.productId).name, qty: i.qty, flocage: i.flocage })),
      };
    }
    setCart([]);
    setCartOpen(false);
    return order;
  };

  const value = {
    ...data, user, isAdmin, isDemo, canDelete, findProduct, teamPlayers, allNews,
    login, logout, addNews, removeNews, addPlayer, removePlayer,
    cart, cartOpen, cartBump, subtotal, unitPrice, addToCart, changeQty, removeFromCart, checkout,
    openCart: () => setCartOpen(true), closeCart: () => setCartOpen(false),
    toast, toastState, modal, openModal, closeModal,
  };
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}
