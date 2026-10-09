import { Link } from 'react-router-dom';
import { CLUB, HONOURS } from '../data.js';
import { CountUp, NewsCard, ProductCard, Reveal } from '../components/ui.jsx';
import { Jersey, PitchLines } from '../components/Visuals.jsx';
import { euro } from '../lib/format.js';
import { useSite } from '../state/SiteContext.jsx';

export default function Home() {
  const { allNews, teams, products } = useSite();
  const home = products[0];
  return (
    <>
      <section className="hero">
        <PitchLines />
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="kicker intro" style={{ '--i': 0 }}>Real Madrid C.F. · Fondé en 1902</p>
            <h1 className="hero-title intro" style={{ '--i': 1 }}><span>¡Hala</span> <span className="gold">Madrid!</span></h1>
            <p className="hero-lead intro" style={{ '--i': 2 }}>Élu meilleur club du XXᵉ siècle par la FIFA. Les équipes, les actualités et la boutique des supporters merengues, réunies au même endroit.</p>
            <div className="actions intro" style={{ '--i': 3 }}>
              <Link className="btn btn-gold" to="/equipes/masculine">Découvrir l'équipe</Link>
              <Link className="btn btn-ghost-light" to="/boutique">Visiter la boutique</Link>
            </div>
          </div>
          <div className="hero-visual intro-visual">
            <div className="hero-jersey"><Jersey kit={home.kit} view="back" name="BELLINGHAM" number="5" /></div>
            <Link className="hero-card" to="/boutique/domicile">
              <span className="hero-card-label">Maillot domicile</span>
              <span className="hero-card-price">{euro.format(home.price)}</span>
              <span className="hero-card-cta">Flocage personnalisé →</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="honours" aria-label="Palmarès">
        <div className="container honours-grid">
          {HONOURS.map((h) => (
            <Reveal key={h.label} className="honour">
              <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path fill="currentColor" d="M7 3h10v2h3v3a5 5 0 0 1-4.6 5A5 5 0 0 1 13 15.9V18h3v3H8v-3h3v-2.1A5 5 0 0 1 8.6 13 5 5 0 0 1 4 8V5h3zm0 4H6v1a3 3 0 0 0 1.4 2.5A7 7 0 0 1 7 8zm10 0v1a7 7 0 0 1-.4 2.5A3 3 0 0 0 18 8V7z" /></svg>
              <CountUp value={h.value} />
              <span>{h.label}</span>
            </Reveal>
          ))}
        </div>
        <p className="container honours-note">Palmarès à la fin de l'année 2024.</p>
      </section>

      <section className="section">
        <div className="container">
          <Reveal className="section-head">
            <div><p className="kicker">À la une</p><h2>Les dernières actualités</h2></div>
            <Link className="link-arrow" to="/actualites">Toutes les actualités →</Link>
          </Reveal>
          <div className="news-grid">{allNews.slice(0, 3).map((n) => <NewsCard key={n.id} item={n} />)}</div>
        </div>
      </section>

      <section className="section section-navy">
        <div className="container">
          <Reveal className="section-head">
            <div><p className="kicker">Le club</p><h2>Trois équipes, un seul maillot</h2></div>
          </Reveal>
          <div className="teams-grid">
            {Object.entries(teams).map(([id, team]) => (
              <Reveal as={Link} key={id} className="team-card" to={`/equipes/${id}`}>
                <img src={team.photo} alt="" loading="lazy" />
                <div className="team-card-body">
                  <p className="kicker">{team.short}</p>
                  <h3>{team.name}</h3>
                  <p>{team.staff[1].role} : {team.staff[1].name}</p>
                  <span className="link-arrow">Voir l'effectif →</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal className="section-head">
            <div><p className="kicker">La boutique</p><h2>Porte les couleurs, avec ton nom</h2></div>
            <Link className="link-arrow" to="/boutique">Toute la boutique →</Link>
          </Reveal>
          <div className="products-grid">{products.filter((p) => p.type === 'jersey').slice(0, 3).map((p) => <ProductCard key={p.id} product={p} />)}</div>
        </div>
      </section>

      <section className="section section-tight">
        <Reveal className="container stadium-card">
          <div>
            <p className="kicker">Le stade</p>
            <h2>{CLUB.stadium}</h2>
            <p>{CLUB.address}</p>
          </div>
          <Link className="btn btn-navy" to="/contact">Plan d'accès et contact</Link>
        </Reveal>
      </section>
    </>
  );
}
