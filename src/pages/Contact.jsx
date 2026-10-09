import { CLUB } from '../data.js';
import { Reveal } from '../components/ui.jsx';

export default function Contact() {
  const q = encodeURIComponent(`${CLUB.stadium}, ${CLUB.address}`);
  return (
    <>
      <section className="page-hero page-hero-compact">
        <div className="container">
          <p className="kicker">Contact</p>
          <h1>Rendez-vous au Bernabéu</h1>
          <p className="page-lead">Pour joindre le club, appelez le standard ou passez par ses canaux officiels.</p>
        </div>
      </section>
      <section className="section section-tight">
        <div className="container contact-grid">
          <Reveal className="card">
            <h2 className="card-title">{CLUB.stadium}</h2>
            <p className="contact-line">{CLUB.address}</p>
            <a className="link-arrow" href={`https://www.google.com/maps/dir/?api=1&destination=${q}`} target="_blank" rel="noopener">Itinéraire →</a>
            <div className="phone-block">
              <span>Standard du club</span>
              <a href={CLUB.phoneHref}>{CLUB.phone}</a>
            </div>
            <h3 className="links-title">Canaux officiels</h3>
            <ul className="official-links">
              {CLUB.links.map((l) => (
                <li key={l.href}><a href={l.href} target="_blank" rel="noopener"><span>{l.label}</span><b>{l.handle}</b></a></li>
              ))}
            </ul>
          </Reveal>
          <Reveal className="map">
            <iframe title={`Plan d'accès au ${CLUB.stadium}`} src={`https://www.google.com/maps?q=${q}&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </Reveal>
        </div>
      </section>
    </>
  );
}
