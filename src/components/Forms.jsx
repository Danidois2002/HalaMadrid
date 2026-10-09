/* =========================================================
   Contenus de la fenêtre modale : formulaires admin et confirmation de commande
   ========================================================= */
import { useState } from 'react';
import { NEWS, NEWS_CATEGORIES, POSITIONS } from '../data.js';
import { api } from '../lib/api.js';
import { euro, posLabel } from '../lib/format.js';
import { useSite } from '../state/SiteContext.jsx';

const NEWS_IMAGES = [...new Set(NEWS.map((n) => n.img).filter(Boolean))];

export function NewsForm() {
  const { addNews, closeModal, toast } = useSite();
  const [title, setTitle] = useState('');
  const [cat, setCat] = useState(NEWS_CATEGORIES[0]);
  const [img, setImg] = useState('');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { setError('Indiquez un titre.'); return; }
    try {
      await addNews({ title: title.trim(), cat, img });
    } catch (err) {
      setError(err.details ? 'Titre trop court (3 caractères minimum) ou trop long.' : err.message);
      return;
    }
    closeModal();
    toast('Actualité publiée');
  };

  return (
    <form className="admin-form" noValidate onSubmit={submit}>
      <h2 id="modal-title">Publier une actualité</h2>
      <label className="field">Titre<input type="text" name="title" maxLength="80" required value={title} onChange={(e) => setTitle(e.target.value)} /></label>
      <label className="field">Catégorie
        <select name="cat" value={cat} onChange={(e) => setCat(e.target.value)}>
          {NEWS_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </label>
      <fieldset className="field"><legend>Image</legend>
        <div className="img-pick">
          <label><input type="radio" name="img" value="" checked={img === ''} onChange={() => setImg('')} /><span className="news-fallback"><img src="img/crest.webp" alt="Sans image" /></span></label>
          {NEWS_IMAGES.map((src) => (
            <label key={src}><input type="radio" name="img" value={src} checked={img === src} onChange={() => setImg(src)} /><img src={src} alt="" /></label>
          ))}
        </div>
      </fieldset>
      <p className="form-error" role="alert">{error}</p>
      <button className="btn btn-navy btn-block" type="submit">Publier</button>
    </form>
  );
}

export function PlayerForm({ teamId }) {
  const { teams, addPlayer, closeModal, toast } = useSite();
  const team = teams[teamId];
  const [name, setName] = useState('');
  const [pos, setPos] = useState('GK');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    const clean = name.trim();
    if (!clean) { setError('Indiquez un nom.'); return; }
    try {
      await addPlayer(teamId, { name: clean, pos });
    } catch (err) {
      setError(err.details ? 'Nom trop court (2 caractères minimum) ou trop long.' : err.message);
      return;
    }
    closeModal();
    toast(`${clean} a rejoint l'effectif`);
  };

  return (
    <form className="admin-form" noValidate onSubmit={submit}>
      <h2 id="modal-title">Ajouter {team.feminine ? 'une joueuse' : 'un joueur'}</h2>
      <label className="field">Nom complet<input type="text" name="name" maxLength="40" required value={name} onChange={(e) => setName(e.target.value)} /></label>
      <label className="field">Poste
        <select name="pos" value={pos} onChange={(e) => setPos(e.target.value)}>
          {Object.keys(POSITIONS).map((p) => <option key={p} value={p}>{posLabel(p, team.feminine)}</option>)}
        </select>
      </label>
      <p className="form-error" role="alert">{error}</p>
      <button className="btn btn-navy btn-block" type="submit">Ajouter à l'effectif</button>
    </form>
  );
}

export function OrderDone({ order }) {
  return (
    <div className="order-done">
      <span className="check-badge" aria-hidden="true">✓</span>
      <h2 id="modal-title">Commande confirmée&nbsp;!</h2>
      <p>Référence <b>{order.reference}</b> · {euro.format(order.total)}</p>
      <ul>
        {order.items.map((i, n) => (
          <li key={n}>{i.qty} × {i.name}{i.flocage ? ` (${i.flocage.name} ${i.flocage.number})` : ''}</li>
        ))}
      </ul>
      <p className="demo-note">
        {api.enabled
          ? 'Commande enregistrée sur le serveur. Démonstration : aucun paiement ni livraison.'
          : "Ceci est une démonstration : aucune commande réelle n'a été passée."}
      </p>
      <button className="btn btn-navy btn-block" type="button" data-close-modal>Continuer</button>
    </div>
  );
}
