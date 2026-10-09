import { useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FLOCAGE_PLAYERS, FLOCAGE_PRICE, SIZES } from '../data.js';
import { ProductCard, Reveal } from '../components/ui.jsx';
import { Jersey, ProductVisual } from '../components/Visuals.jsx';
import { euro } from '../lib/format.js';
import { useSite } from '../state/SiteContext.jsx';
import NotFound from './NotFound.jsx';

export default function Product() {
  const { productId } = useParams();
  const { products, findProduct, addToCart, toast, openCart } = useSite();
  const product = findProduct(productId);
  const [size, setSize] = useState('');
  const [mode, setMode] = useState('none'); // sans flocage, joueur ou personnalisé
  const [player, setPlayer] = useState(0);
  const [customName, setCustomName] = useState('');
  const [customNumber, setCustomNumber] = useState('');
  const [qty, setQty] = useState(1);
  const [view, setView] = useState('front');
  const [error, setError] = useState('');
  const firstSize = useRef(null);
  if (!product) return <NotFound />;

  const jersey = product.type === 'jersey';
  let flocage = null;
  if (jersey && mode === 'player') flocage = { ...FLOCAGE_PLAYERS[player] };
  if (jersey && mode === 'custom') {
    flocage = { name: customName.trim().toUpperCase(), number: customNumber === '' ? '' : String(Math.max(0, Math.min(99, Number(customNumber)))) };
  }
  const hasFlocage = Boolean(flocage && (flocage.name || flocage.number));
  const unit = product.price + (hasFlocage ? FLOCAGE_PRICE : 0);

  const submit = (e) => {
    e.preventDefault();
    if (jersey && !size) {
      setError('Choisissez une taille.');
      firstSize.current.focus();
      return;
    }
    if (mode === 'custom' && (!flocage.name || flocage.number === '')) {
      setError('Indiquez un nom et un numéro pour le flocage.');
      return;
    }
    addToCart({ productId: product.id, size: jersey ? size : null, flocage: hasFlocage ? flocage : null, qty });
    setError('');
    toast(`${product.name} ajouté au panier`);
    openCart();
  };

  return (
    <>
      <section className="section product-page">
        <div className="container">
          <Link className="link-arrow back-link" to="/boutique">← Retour à la boutique</Link>
          <div className="product-grid">
            <Reveal className="product-visual">
              <div className="stage" style={{ '--kit': jersey ? product.kit.body : '#13254a' }}>
                <div className={`flip${view === 'back' ? ' is-back' : ''}`} id="flip">
                  <div className="flip-face flip-front"><ProductVisual product={product} view="front" /></div>
                  {jersey && (
                    <div className="flip-face flip-back" id="back-face">
                      <Jersey kit={product.kit} view="back" name={flocage ? flocage.name : ''} number={flocage ? String(flocage.number) : ''} />
                    </div>
                  )}
                </div>
              </div>
              {jersey && (
                <div className="view-toggle" role="group" aria-label="Vue du maillot">
                  <button type="button" aria-pressed={view === 'front'} onClick={() => setView('front')}>Face</button>
                  <button type="button" aria-pressed={view === 'back'} onClick={() => setView('back')}>Dos</button>
                </div>
              )}
            </Reveal>

            <Reveal as="form" className="product-form" id="product-form" noValidate onSubmit={submit}>
              <span className="product-tag">{product.tag}</span>
              <h1>{product.name}</h1>
              <p className="product-desc">{product.desc}</p>
              <p className="price price-lg" id="live-price">{euro.format(unit * qty)}</p>

              {jersey && (
                <>
                  <fieldset className="opt">
                    <legend>Taille <span className="opt-hint" id="size-hint" /></legend>
                    <div className="size-grid">
                      {SIZES.map((s, i) => (
                        <label className="size" key={s}>
                          <input ref={i === 0 ? firstSize : undefined} type="radio" name="size" value={s} checked={size === s} onChange={() => { setSize(s); setError(''); }} />
                          <span>{s}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <fieldset className="opt">
                    <legend>Flocage <span className="opt-hint">+ {euro.format(FLOCAGE_PRICE)}</span></legend>
                    <div className="seg" role="radiogroup">
                      {[['none', 'Sans'], ['player', 'Joueur'], ['custom', 'Personnalisé']].map(([value, label]) => (
                        <label key={value}>
                          <input type="radio" name="flocage" value={value} checked={mode === value} onChange={() => { setMode(value); setView(value === 'none' ? 'front' : 'back'); }} />
                          <span>{label}</span>
                        </label>
                      ))}
                    </div>
                    <div className="flocage-panel" hidden={mode !== 'player'}>
                      <select name="player" aria-label="Choisir un joueur" value={player} onChange={(e) => { setPlayer(Number(e.target.value)); setView('back'); }}>
                        {FLOCAGE_PLAYERS.map((p, i) => <option key={p.name} value={i}>{p.number} · {p.name}</option>)}
                      </select>
                    </div>
                    <div className="flocage-panel flocage-custom" hidden={mode !== 'custom'}>
                      <label>Nom<input type="text" name="customName" maxLength="12" placeholder="TON NOM" autoComplete="off" value={customName} onChange={(e) => { setCustomName(e.target.value); setView('back'); }} /></label>
                      <label>Numéro<input type="number" name="customNumber" min="0" max="99" placeholder="10" value={customNumber} onChange={(e) => { setCustomNumber(e.target.value); setView('back'); }} /></label>
                    </div>
                  </fieldset>
                </>
              )}

              <div className="buy-row">
                <div className="qty" role="group" aria-label="Quantité">
                  <button type="button" aria-label="Diminuer la quantité" onClick={() => setQty((n) => Math.max(1, n - 1))}>−</button>
                  <output id="qty">{qty}</output>
                  <button type="button" aria-label="Augmenter la quantité" onClick={() => setQty((n) => Math.min(10, n + 1))}>+</button>
                </div>
                <button className="btn btn-gold btn-block" type="submit">Ajouter au panier</button>
              </div>
              <p className="form-error" id="product-error" role="alert">{error}</p>
              <ul className="perks">
                <li>Livraison offerte dès {euro.format(100)}</li>
                <li>Flocage officiel, police du club</li>
                <li>Retour gratuit sous 30 jours</li>
              </ul>
            </Reveal>
          </div>
        </div>
      </section>
      <section className="section section-tight">
        <div className="container">
          <div className="section-head"><div><p className="kicker">Vous aimerez aussi</p><h2>Complète ta tenue</h2></div></div>
          <div className="products-grid">{products.filter((p) => p.id !== product.id).slice(0, 3).map((p) => <ProductCard key={p.id} product={p} />)}</div>
        </div>
      </section>
    </>
  );
}
