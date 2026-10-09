import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="section auth-page">
      <div className="card auth-card">
        <h1>Hors-jeu&nbsp;!</h1>
        <p>Cette page n'existe pas.</p>
        <Link className="btn btn-navy" to="/">Retour à l'accueil</Link>
      </div>
    </section>
  );
}
