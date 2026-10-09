/* =========================================================
   Habillage commun : en-tête, barre admin, pied de page, panier, fenêtre modale, notification
   ========================================================= */
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { euro } from '../lib/format.js';
import { shippingFor, useSite } from '../state/SiteContext.jsx';
import { OrderDone } from './Forms.jsx';
import { ProductVisual } from './Visuals.jsx';

const NAV = [
  ['/', 'accueil', 'Accueil'],
  ['/equipes/masculine', 'equipes', 'Équipes'],
  ['/actualites', 'actualites', 'Actualités'],
  ['/boutique', 'boutique', 'Boutique'],
  ['/contact', 'contact', 'Contact'],
];

export function Header({ section, menuOpen, setMenuOpen }) {
  const { isAdmin, isDemo, cart, cartBump, openCart } = useSite();
  const [scrolled, setScrolled] = useState(false);
  const count = cart.reduce((n, i) => n + i.qty, 0);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { setScrolled(window.scrollY > 10); ticking = false; });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`topbar${scrolled ? ' scrolled' : ''}`} id="topbar">
      <Link className="brand" to="/" aria-label="Accueil">
        <span className="crest-badge"><img src="img/crest.webp" alt="" width="300" height="403" /></span>
        <span className="brand-text">Real Madrid <small>Site de supporters</small></span>
      </Link>
      <nav className={`nav${menuOpen ? ' open' : ''}`} id="nav" aria-label="Navigation principale">
        {NAV.map(([to, key, label]) => (
          <Link key={key} to={to} aria-current={section === key ? 'page' : undefined}>{label}</Link>
        ))}
      </nav>
      <div className="topbar-actions">
        <Link className={`icon-btn account${isAdmin ? ' is-admin' : ''}`} to="/connexion" id="account-link">
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="2" d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0" /></svg>
          <span id="account-label">{isAdmin ? (isDemo ? 'Démo' : 'Admin') : 'Connexion'}</span>
        </Link>
        <button className="icon-btn cart-btn" type="button" id="cart-open" aria-label="Ouvrir le panier" onClick={openCart}>
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" d="M5 7h14l-1.2 12.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8zM9 7V6a3 3 0 0 1 6 0v1" /></svg>
          {/* La clé change à chaque ajout : le compteur est recréé et rejoue son petit rebond */}
          <span key={cartBump} className={`cart-count${cartBump ? ' bump' : ''}`} id="cart-count" hidden={count === 0}>{count}</span>
        </button>
        <button
          className="icon-btn menu-btn" type="button" id="menu-toggle" aria-controls="nav" aria-label="Ouvrir le menu"
          aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}
        ><span /><span /></button>
      </div>
    </header>
  );
}

export function AdminBar() {
  const { isAdmin, isDemo, logout } = useSite();
  return (
    <div className="admin-bar" id="admin-bar" hidden={!isAdmin}>
      <span id="admin-bar-text">
        {isDemo
          ? <><b>Compte démo</b> : vos ajouts restent visibles 24 h.</>
          : <><b>Mode admin</b> : vous pouvez publier des actualités et modifier les effectifs.</>}
      </span>
      <button type="button" className="link-btn" onClick={logout}>Se déconnecter</button>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <span className="crest-badge crest-lg"><img src="img/crest.webp" alt="" width="300" height="403" loading="lazy" /></span>
          <p className="footer-motto">¡Hala Madrid<br />y nada más!</p>
        </div>
        <div>
          <h2>Le club</h2>
          <Link to="/equipes/masculine">Équipe masculine</Link>
          <Link to="/equipes/feminine">Équipe féminine</Link>
          <Link to="/equipes/academie">Académie</Link>
        </div>
        <div>
          <h2>Explorer</h2>
          <Link to="/actualites">Actualités</Link>
          <Link to="/boutique">Boutique</Link>
          <Link to="/contact">Contact</Link>
        </div>
        <p className="disclaimer">Projet étudiant non officiel réalisé par Danial Bitar, sans lien avec le Real Madrid C.F. Les noms, logos et photos appartiennent à leurs propriétaires respectifs. La boutique est une démonstration : aucun paiement n'est demandé.</p>
      </div>
    </footer>
  );
}

export function CartDrawer() {
  const { cart, cartOpen, closeCart, findProduct, unitPrice, subtotal, changeQty, removeFromCart, checkout, toast, openModal } = useSite();
  const closeRef = useRef(null);
  const [sending, setSending] = useState(false);
  const ship = shippingFor(subtotal);

  useEffect(() => {
    document.body.classList.toggle('no-scroll', cartOpen);
    if (!cartOpen) return undefined;
    closeRef.current.focus();
    const onKey = (e) => { if (e.key === 'Escape') closeCart(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [cartOpen, closeCart]);

  const order = async () => {
    setSending(true);
    try {
      openModal(<OrderDone order={await checkout()} />);
    } catch (err) {
      toast(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <div className="drawer-backdrop" id="drawer-backdrop" hidden={!cartOpen} onClick={closeCart} />
      <aside className={`drawer${cartOpen ? ' open' : ''}`} id="cart" aria-labelledby="cart-title" aria-hidden={!cartOpen}>
        <header className="drawer-head">
          <h2 id="cart-title">Votre panier</h2>
          <button ref={closeRef} className="close-btn" type="button" aria-label="Fermer le panier" onClick={closeCart}>×</button>
        </header>
        <div className="drawer-body" id="cart-body">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <p>Votre panier est vide.</p>
              <Link className="btn btn-navy" to="/boutique" onClick={closeCart}>Découvrir la boutique</Link>
            </div>
          ) : (
            <ul className="cart-list">
              {cart.map((item, idx) => {
                const product = findProduct(item.productId);
                const details = [item.size && `Taille ${item.size}`, item.flocage && `Flocage ${item.flocage.name} ${item.flocage.number}`].filter(Boolean).join(' · ');
                const visual = item.flocage ? { view: 'back', name: item.flocage.name, number: String(item.flocage.number) } : {};
                return (
                  <li className="cart-item" key={`${item.productId}|${item.size}|${details}`}>
                    <div className="cart-thumb" style={{ '--kit': product.kit ? product.kit.body : '#13254a' }}><ProductVisual product={product} {...visual} /></div>
                    <div className="cart-info">
                      <strong>{product.name}</strong>
                      {details && <span>{details}</span>}
                      <div className="qty qty-sm" role="group" aria-label={`Quantité de ${product.name}`}>
                        <button type="button" aria-label="Diminuer" onClick={() => changeQty(idx, -1)}>−</button>
                        <output>{item.qty}</output>
                        <button type="button" aria-label="Augmenter" onClick={() => changeQty(idx, 1)}>+</button>
                      </div>
                    </div>
                    <div className="cart-side">
                      <b>{euro.format(unitPrice(item) * item.qty)}</b>
                      <button className="link-btn" type="button" onClick={() => removeFromCart(idx)}>Retirer</button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <footer className="drawer-foot" id="cart-foot">
          {cart.length > 0 && (
            <>
              <dl className="totals">
                <div><dt>Sous-total</dt><dd>{euro.format(subtotal)}</dd></div>
                <div><dt>Livraison</dt><dd>{ship ? euro.format(ship) : 'Offerte'}</dd></div>
                {ship > 0 && <p className="free-hint">Plus que {euro.format(100 - subtotal)} pour la livraison offerte.</p>}
                <div className="total"><dt>Total</dt><dd>{euro.format(subtotal + ship)}</dd></div>
              </dl>
              <button className="btn btn-gold btn-block" type="button" id="checkout" disabled={sending} onClick={order}>
                {sending ? 'Envoi de la commande…' : 'Commander'}
              </button>
              <p className="demo-note">Commande simulée : aucun paiement ne sera demandé.</p>
            </>
          )}
        </footer>
      </aside>
    </>
  );
}

/* Fenêtre générique (confirmation de commande, formulaires admin), basée sur <dialog> */
export function Modal() {
  const { modal, closeModal } = useSite();
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    if (modal && !dialog.open) dialog.showModal();
    if (!modal && dialog.open) dialog.close();
  }, [modal]);
  return (
    <dialog
      ref={ref} className="modal" id="modal" aria-labelledby="modal-title" onClose={closeModal}
      onClick={(e) => { if (e.target === ref.current || e.target.closest('[data-close-modal]')) closeModal(); }}
    >
      <button className="close-btn modal-close" type="button" data-close-modal aria-label="Fermer">×</button>
      <div id="modal-content">{modal}</div>
    </dialog>
  );
}

export function Toast() {
  const { toastState } = useSite();
  return <div className={`toast${toastState.show ? ' show' : ''}`} id="toast" role="status" aria-live="polite">{toastState.text}</div>;
}
