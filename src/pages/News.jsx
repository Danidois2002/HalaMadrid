import { useState } from 'react';
import { NEWS_CATEGORIES } from '../data.js';
import { NewsForm } from '../components/Forms.jsx';
import { Chips, NewsCard } from '../components/ui.jsx';
import { useSite } from '../state/SiteContext.jsx';

export default function News() {
  const { allNews, isAdmin, openModal } = useSite();
  const [cat, setCat] = useState('all');
  const shown = allNews.filter((n) => cat === 'all' || n.cat === cat);
  return (
    <>
      <section className="page-hero page-hero-compact">
        <div className="container">
          <p className="kicker">Actualités</p>
          <h1>Toute l'actualité merengue</h1>
          <p className="page-lead">Matchs, vie du groupe, récompenses et internationaux : la saison 2026-27 au jour le jour.</p>
        </div>
      </section>
      <section className="section section-tight">
        <div className="container">
          <div className="toolbar">
            <Chips
              label="Filtrer par catégorie" value={cat} onChange={setCat}
              options={[
                { value: 'all', label: 'Toutes', count: allNews.length },
                ...NEWS_CATEGORIES.map((c) => ({ value: c, label: c, count: allNews.filter((n) => n.cat === c).length })),
              ]}
            />
            {isAdmin && <button className="btn btn-navy" type="button" onClick={() => openModal(<NewsForm />)}>+ Publier une actualité</button>}
          </div>
          <div className="news-grid" id="news-grid">
            {shown.map((n) => <div className="news-cell" key={n.id}><NewsCard item={n} /></div>)}
          </div>
          <p className="empty" hidden={shown.length > 0}>Aucune actualité dans cette catégorie.</p>
        </div>
      </section>
    </>
  );
}
