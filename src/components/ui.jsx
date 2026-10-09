/* =========================================================
   Petits composants partagés
   ========================================================= */
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { dayFormat, euro, initials, reducedMotion } from '../lib/format.js';
import { useSite } from '../state/SiteContext.jsx';
import { ProductVisual } from './Visuals.jsx';

/* Un seul IntersectionObserver pour tous les blocs qui apparaissent au défilement */
const onVisible = new WeakMap();
let revealObserver;
function observe(el, callback) {
  revealObserver ??= new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      onVisible.get(entry.target)?.();
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });
  onVisible.set(el, callback);
  revealObserver.observe(el);
  return () => { revealObserver.unobserve(el); onVisible.delete(el); };
}

/* Bloc qui apparaît en glissant quand il entre à l'écran (classes .reveal / .in-view du CSS) */
export function Reveal({ as: Tag = 'div', className = '', children, ...props }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => observe(ref.current, () => setInView(true)), []);
  return <Tag ref={ref} className={`${className} reveal${inView ? ' in-view' : ''}`.trim()} {...props}>{children}</Tag>;
}

/* Nombre qui défile de 0 à sa valeur quand il devient visible */
export function CountUp({ value }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(value);
  useEffect(() => {
    const el = ref.current;
    let frame;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      if (reducedMotion) return;
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min((now - start) / 1300, 1);
        setShown(Math.round(value * (1 - (1 - t) ** 3)));
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, { threshold: 0.6 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(frame); };
  }, [value]);
  return <strong ref={ref}>{shown}</strong>;
}

export function Avatar({ person, className = '' }) {
  return person.photo
    ? <img className={`avatar ${className}`} src={person.photo} alt="" width="200" height="200" loading="lazy" />
    : <span className={`avatar avatar-initials ${className}`} aria-hidden="true">{initials(person.name)}</span>;
}

/* Groupe de filtres (boutons à bascule) */
export function Chips({ label, options, value, onChange }) {
  return (
    <div className="chips" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" className="chip" aria-pressed={value === o.value} onClick={() => onChange(o.value)}>
          {o.label}{o.count !== undefined && <> <span>{o.count}</span></>}
        </button>
      ))}
    </div>
  );
}

export function NewsCard({ item }) {
  const { canDelete, removeNews } = useSite();
  const date = item.date || item.publishedAt;
  return (
    <Reveal as="article" className="news-card">
      <div className="news-media">
        {item.img ? <img src={item.img} alt="" loading="lazy" /> : <span className="news-fallback"><img src="img/crest.webp" alt="" /></span>}
      </div>
      <div className="news-body">
        <div className="news-meta">
          <span className="pill">{item.cat}</span>
          {date && <time dateTime={date}>{dayFormat.format(new Date(date))}</time>}
        </div>
        <h3>{item.title}</h3>
      </div>
      {canDelete(item) && (
        <button className="admin-remove" type="button" aria-label={`Supprimer l'actualité ${item.title}`} onClick={() => removeNews(item.id)}>×</button>
      )}
    </Reveal>
  );
}

export function ProductCard({ product }) {
  return (
    <Reveal as={Link} className="product-card" to={`/boutique/${product.id}`} data-type={product.type}>
      <div className="product-stage" style={{ '--kit': product.kit ? product.kit.body : '#13254a' }}><ProductVisual product={product} /></div>
      <div className="product-info">
        <span className="product-tag">{product.tag}</span>
        <h3>{product.name}</h3>
        <p className="price">{euro.format(product.price)}</p>
      </div>
      <span className="product-cta">{product.type === 'jersey' ? 'Personnaliser' : 'Voir le produit'} <span aria-hidden="true">→</span></span>
    </Reveal>
  );
}
