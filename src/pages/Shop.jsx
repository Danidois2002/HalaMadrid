import { useState } from 'react';
import { Chips, ProductCard } from '../components/ui.jsx';
import { useSite } from '../state/SiteContext.jsx';

export default function Shop() {
  const { products } = useSite();
  const [type, setType] = useState('all');
  const shown = products.filter((p) => type === 'all' || (type === 'jersey' ? p.type === 'jersey' : p.type !== 'jersey'));
  return (
    <>
      <section className="page-hero page-hero-compact">
        <div className="container">
          <p className="kicker">Boutique</p>
          <h1>La boutique des supporters</h1>
          <p className="page-lead">Maillots floqués à ton nom ou à celui de ton joueur préféré, écharpe de tribune et ballon.</p>
          <p className="demo-note">Boutique de démonstration : le panier fonctionne, mais aucun paiement n'est demandé.</p>
        </div>
      </section>
      <section className="section section-tight">
        <div className="container">
          <div className="toolbar">
            <Chips
              label="Filtrer les produits" value={type} onChange={setType}
              options={[{ value: 'all', label: 'Tout' }, { value: 'jersey', label: 'Maillots' }, { value: 'other', label: 'Accessoires' }]}
            />
          </div>
          <div className="products-grid" id="products">{shown.map((p) => <ProductCard key={p.id} product={p} />)}</div>
        </div>
      </section>
    </>
  );
}
