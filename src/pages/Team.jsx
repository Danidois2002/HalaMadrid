import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { POSITIONS } from '../data.js';
import { PlayerForm } from '../components/Forms.jsx';
import { Avatar, Chips, Reveal } from '../components/ui.jsx';
import { PitchLines } from '../components/Visuals.jsx';
import { posLabel, shortName } from '../lib/format.js';
import { useSite } from '../state/SiteContext.jsx';
import NotFound from './NotFound.jsx';

const LINES = ['ATT', 'MID', 'DEF', 'GK'];
const ROWS = { ATT: 22, MID: 46, DEF: 70, GK: 89 }; // hauteur de chaque ligne sur le terrain (%)

export default function Team() {
  const { teamId = 'masculine' } = useParams();
  const { teams, teamPlayers, isAdmin, canDelete, removePlayer, openModal } = useSite();
  const [pos, setPos] = useState('all');
  const [query, setQuery] = useState('');
  const team = teams[teamId];
  if (!team) return <NotFound />;

  const players = teamPlayers(teamId);
  const byId = Object.fromEntries(players.map((p) => [p.id, p]));
  const q = query.trim().toLowerCase();
  const groups = Object.keys(POSITIONS)
    .map((p) => ({ pos: p, all: players.filter((pl) => pl.pos === p) }))
    .filter((g) => g.all.length)
    .map((g) => ({ ...g, shown: (pos === 'all' || pos === g.pos) ? g.all.filter((pl) => pl.name.toLowerCase().includes(q)) : [] }));
  const visible = groups.reduce((n, g) => n + g.shown.length, 0);

  return (
    <>
      <section className="page-hero">
        <div className="container page-hero-grid">
          <div>
            <nav className="tabs" aria-label="Équipes">
              {Object.entries(teams).map(([id, t]) => (
                <Link key={id} to={`/equipes/${id}`} aria-current={id === teamId ? 'page' : undefined}>{t.short}</Link>
              ))}
            </nav>
            <h1>{team.name}</h1>
            <p className="page-lead">{team.intro}</p>
            <p className="season">{team.season} · {players.length} {team.feminine ? 'joueuses' : 'joueurs'}</p>
          </div>
          <img className="page-hero-photo" src={team.photo} alt={`Photo de l'${team.name.toLowerCase()}`} />
        </div>
      </section>

      <section className="section">
        <div className="container team-grid">
          <Reveal className="pitch-wrap">
            <h2 className="card-title">Onze type <small>4-3-3</small></h2>
            <div className="pitch">
              <PitchLines />
              <ol className="tokens">
                {LINES.flatMap((line) => {
                  const ids = team.lineup[line].filter((id) => byId[id]);
                  return ids.map((id, i) => (
                    <li key={id} className="token" style={{ '--x': `${((i + 1) / (ids.length + 1)) * 100}%`, '--y': `${ROWS[line]}%` }}>
                      <Avatar person={byId[id]} className="token-avatar" />
                      <span>{shortName(byId[id])}</span>
                    </li>
                  ));
                })}
              </ol>
            </div>
          </Reveal>
          <div className="team-side">
            <Reveal className="card">
              <h2 className="card-title">Staff</h2>
              <ul className="staff-list">
                {team.staff.map((s) => (
                  <li key={s.name}><Avatar person={s} /><div><strong>{s.name}</strong><span>{s.role}</span></div></li>
                ))}
              </ul>
            </Reveal>
            <Reveal className="card">
              <h2 className="card-title">Composition de l'effectif</h2>
              <ul className="split">
                {Object.keys(POSITIONS).map((p) => {
                  const n = players.filter((pl) => pl.pos === p).length;
                  return (
                    <li key={p}>
                      <span>{POSITIONS[p].plural}</span>
                      <div className="split-bar"><i style={{ '--w': `${(n / Math.max(players.length, 1)) * 100}%` }} /></div>
                      <b>{n}</b>
                    </li>
                  );
                })}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section section-tight">
        <div className="container">
          <Reveal className="section-head">
            <div><p className="kicker">Effectif</p><h2>{team.feminine ? 'Les joueuses' : 'Les joueurs'}</h2></div>
            {isAdmin && (
              <button className="btn btn-navy" type="button" onClick={() => openModal(<PlayerForm teamId={teamId} />)}>
                + Ajouter {team.feminine ? 'une joueuse' : 'un joueur'}
              </button>
            )}
          </Reveal>
          <div className="toolbar">
            <Chips
              label="Filtrer par poste" value={pos} onChange={setPos}
              options={[{ value: 'all', label: 'Tous' }, ...Object.keys(POSITIONS).map((p) => ({ value: p, label: POSITIONS[p].plural }))]}
            />
            <label className="search">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="2" d="m21 21-4.3-4.3M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z" /></svg>
              <input type="search" id="player-search" placeholder="Rechercher un nom" aria-label="Rechercher dans l'effectif" value={query} onChange={(e) => setQuery(e.target.value)} />
            </label>
          </div>
          <div className="roster" id="roster">
            {groups.map((g) => (
              <div className="roster-group" key={g.pos} hidden={g.shown.length === 0}>
                <h3>{POSITIONS[g.pos].plural} <span>{g.all.length}</span></h3>
                <ul className="player-grid">
                  {g.shown.map((p) => (
                    <li className="player-card" key={p.id}>
                      <Avatar person={p} />
                      <strong>{p.name}</strong>
                      <span>{posLabel(p.pos, team.feminine)}</span>
                      {canDelete(p) && (
                        <button className="admin-remove" type="button" aria-label={`Retirer ${p.name}`} onClick={() => removePlayer(teamId, p.id)}>×</button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <p className="empty" hidden={visible > 0}>Aucun résultat pour cette recherche.</p>
          </div>
        </div>
      </section>
    </>
  );
}
