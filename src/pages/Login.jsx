import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Reveal } from '../components/ui.jsx';
import { api } from '../lib/api.js';
import { dateFormat, euro } from '../lib/format.js';
import { demoLogin, useSite } from '../state/SiteContext.jsx';

/* Dernières commandes enregistrées par l'API (espace admin) */
function OrdersPanel() {
  const [state, setState] = useState({ status: 'loading' });
  useEffect(() => {
    let alive = true;
    api.get('/api/orders')
      .then((res) => alive && setState({ status: 'ready', ...res }))
      .catch((err) => alive && setState({ status: 'error', message: err.message }));
    return () => { alive = false; };
  }, []);

  if (state.status !== 'ready') {
    return (
      <Reveal className="card orders-card" id="orders-panel">
        <h2 className="card-title">Dernières commandes</h2>
        <p className="empty-note">{state.status === 'loading' ? 'Chargement…' : state.message}</p>
      </Reveal>
    );
  }
  const { stats, orders } = state;
  return (
    <Reveal className="card orders-card" id="orders-panel">
      <h2 className="card-title">Dernières commandes</h2>
      <div className="order-stats">
        <div><b>{stats.count}</b><span>commande{stats.count > 1 ? 's' : ''}</span></div>
        <div><b>{euro.format(stats.revenue)}</b><span>montant total</span></div>
      </div>
      {orders.length ? (
        <ul className="order-list">
          {orders.map((o) => (
            <li key={o.reference}>
              <div className="order-ref"><b>{o.reference}</b><span>{dateFormat.format(new Date(o.createdAt))}</span></div>
              <p>
                {o.items.map((i, n) => (
                  <span key={n}>
                    {n > 0 && <br />}
                    {i.qty} × {i.name}{i.size ? ` · ${i.size}` : ''}{i.flocageName ? ` · ${i.flocageName} ${i.flocageNumber}` : ''}
                  </span>
                ))}
              </p>
              <strong>{euro.format(o.total)}</strong>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty-note">Aucune commande pour le moment : passez-en une depuis la boutique.</p>
      )}
    </Reveal>
  );
}

function LoginForm() {
  const { login, toast } = useSite();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(username.trim(), password);
    } catch (err) {
      setError(err.message);
      setBusy(false);
      return;
    }
    toast('Connexion réussie : mode admin activé');
    navigate('/actualites');
  };

  return (
    <section className="section auth-page">
      <Reveal as="form" className="card auth-card" id="login-form" noValidate onSubmit={submit}>
        <span className="crest-badge crest-lg"><img src="img/crest.webp" alt="" /></span>
        <h1>Espace admin</h1>
        <p>Connectez-vous pour publier des actualités et gérer les effectifs.</p>
        <label className="field">Nom d'utilisateur<input type="text" name="username" autoComplete="username" required value={username} onChange={(e) => setUsername(e.target.value)} /></label>
        <label className="field">Mot de passe<input type="password" name="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        <p className="form-error" id="login-error" role="alert">{error}</p>
        <button className="btn btn-navy btn-block" type="submit" disabled={busy}>Se connecter</button>
        <div className="demo-creds">
          <p><b>Démo</b> · identifiant <code>{demoLogin.username}</code>, mot de passe <code>{demoLogin.password}</code></p>
          <button className="link-btn" type="button" onClick={() => { setUsername(demoLogin.username); setPassword(demoLogin.password); setError(''); }}>Remplir automatiquement</button>
        </div>
      </Reveal>
    </section>
  );
}

export default function Login() {
  const { isAdmin, isDemo, logout } = useSite();
  if (!isAdmin) return <LoginForm />;
  return (
    <section className="section auth-page">
      <div className="auth-stack">
        <Reveal className="card auth-card">
          <span className="crest-badge crest-lg"><img src="img/crest.webp" alt="" /></span>
          <h1>Vous êtes connecté</h1>
          <p>
            {isDemo
              ? 'Compte démo : publiez des actualités et modifiez les effectifs. Vos ajouts restent visibles 24 h et vous ne pouvez retirer que ce que vous avez ajouté.'
              : 'Le mode admin est actif : publiez des actualités et modifiez les effectifs depuis leurs pages.'}
          </p>
          <div className="auth-actions">
            <Link className="btn btn-navy" to="/actualites">Gérer les actualités</Link>
            <Link className="btn btn-ghost" to="/equipes/masculine">Gérer les effectifs</Link>
            <button className="link-btn" type="button" onClick={logout}>Se déconnecter</button>
          </div>
        </Reveal>
        {api.enabled && <OrdersPanel />}
      </div>
    </section>
  );
}
