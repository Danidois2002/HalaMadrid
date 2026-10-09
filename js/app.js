/* =========================================================
   ¡Hala Madrid! — application (routeur, pages, boutique, admin)
   ========================================================= */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const app = $('#app');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const euro = new Intl.NumberFormat('fr-BE', { style: 'currency', currency: 'EUR' });
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const initials = (name) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
/* Nom affiché sur le terrain : surnom s'il existe, sinon le nom de famille */
const shortName = (p) => p.short || p.name.split(' ').slice(1).join(' ') || p.name;

/* ---------- Stockage local (jamais envoyé nulle part) ---------- */
const store = {
  get(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } },
  set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* navigation privée */ } },
};
let cart = store.get('rm-cart', []);
let newsEdits = store.get('rm-news', { added: [], removed: [] });
let rosterEdits = store.get('rm-roster', {});
/* ---------- Données affichées : celles de l'API quand elle répond, sinon celles de data.js ---------- */
const site = { online: false, user: null, teams: TEAMS, news: NEWS, products: PRODUCTS };
const findProduct = (id) => site.products.find((p) => p.id === id);
const isAdmin = () => {
  if (api.enabled) return Boolean(site.user);
  try { return sessionStorage.getItem('rm-admin') === '1'; } catch { return false; }
};
/* Le compte démo ne peut retirer que ses propres ajouts ; l'admin (et le mode sans serveur) peut tout retirer */
const canDelete = (item) => isAdmin() && (!api.enabled || site.user.role === 'admin' || item.createdBy === site.user.id);
const demoLogin = api.enabled ? { username: 'demo', password: 'halamadrid' } : { username: 'admin', password: 'admin123' };
const dateFormat = new Intl.DateTimeFormat('fr-BE', { dateStyle: 'short', timeStyle: 'short' });

/* ---------- Petites aides d'interface ---------- */
let toastTimer;
function toast(message) {
  const el = $('#toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}
const modal = $('#modal');
function openModal(html) { $('#modal-content').innerHTML = html; modal.showModal(); }
modal.addEventListener('click', (e) => { if (e.target === modal || e.target.closest('[data-close-modal]')) modal.close(); });

/* =========================================================
   Visuels produits dessinés en SVG
   ========================================================= */
let svgId = 0;
/* Silhouette (viewBox 300 × 330) : épaules arrondies, manches raglan, bas arrondi.
   Le contour est fermé par l'encolure, différente devant (rond ou V) et derrière. */
const SHIRT_BODY = 'M104 26 C92 30 76 34 64 40 L18 82 Q14 86 17 91 L42 128 Q46 132 51 129 L76 112 C74 165 72 235 74 300 Q150 318 226 300 C228 235 226 165 224 112 L249 129 Q254 132 258 128 L283 91 Q286 86 282 82 L236 40 C224 34 208 30 196 26';
const NECKLINE = { crew: 'C182 50 118 50 104 26 Z', v: 'L150 70 L104 26 Z', back: 'C180 36 120 36 104 26 Z' };
const SLEEVES = [
  'M104 26 C92 30 76 34 64 40 L18 82 Q14 86 17 91 L42 128 Q46 132 51 129 L76 112 C80 80 90 52 104 26 Z',
  'M196 26 C208 30 224 34 236 40 L282 82 Q286 86 283 91 L258 128 Q254 132 249 129 L224 112 C220 80 210 52 196 26 Z',
];

/* Motif propre à chaque maillot */
function kitPattern(kit, id) {
  switch (kit.pattern) {
    case 'pin': return `<g stroke="${kit.text}" stroke-opacity=".07" stroke-width="2">${Array.from({ length: 15 }, (_, i) => `<line x1="${80 + i * 10}" y1="30" x2="${80 + i * 10}" y2="320" />`).join('')}</g>`;
    case 'diag': return `<g stroke="#fff" stroke-opacity=".06" stroke-width="5">${Array.from({ length: 26 }, (_, i) => `<line x1="${-220 + i * 22}" y1="330" x2="${110 + i * 22}" y2="0" />`).join('')}</g>`;
    case 'fade': return `<rect width="300" height="330" fill="url(#${id}f)" /><g stroke="${kit.trim}" stroke-opacity=".45" stroke-width="1.5"><line x1="70" y1="262" x2="230" y2="262" /><line x1="70" y1="270" x2="230" y2="270" /></g>`;
    case 'bands': return `<g fill="#000" fill-opacity=".1">${Array.from({ length: 5 }, (_, i) => `<rect y="${120 + i * 40}" width="300" height="18" />`).join('')}</g>`;
    default: return '';
  }
}

function jerseySvg(kit, { view = 'front', name = '', number = '' } = {}) {
  const id = `j${++svgId}`;
  const back = view === 'back';
  const vNeck = kit.neck === 'v';
  const outline = `${SHIRT_BODY} ${back ? NECKLINE.back : NECKLINE[vNeck ? 'v' : 'crew']}`;
  const nameSize = name.length > 9 ? 19 : 24;
  const frontNeck = vNeck ? 'L150 70 L196 26' : 'C118 50 182 50 196 26';
  const collar = back
    ? `<path d="M106 28 C122 37 178 37 194 28" fill="none" stroke="${kit.collar}" stroke-width="7" stroke-linecap="round" />`
    : vNeck
      ? `<path d="M106 28 L150 68 L194 28" fill="none" stroke="${kit.collar}" stroke-width="8" stroke-linejoin="round" stroke-linecap="round" />
         <path d="M113 34 L150 73 L187 34" fill="none" stroke="${kit.trim}" stroke-width="2" stroke-linejoin="round" />`
      : `<path d="M106 28 C120 48 180 48 194 28" fill="none" stroke="${kit.collar}" stroke-width="8" stroke-linecap="round" />
         <path d="M110 35 C124 52 176 52 190 35" fill="none" stroke="${kit.trim}" stroke-width="2" />`;
  const details = back
    ? `<text x="150" y="106" text-anchor="middle" class="j-name" font-size="${nameSize}" fill="${kit.text}">${esc(name)}</text>
       <text x="150" y="238" text-anchor="middle" class="j-number" fill="${kit.text}" stroke="${kit.trim}" stroke-width="3">${esc(number)}</text>`
    : `<circle cx="196" cy="100" r="19" fill="#fff" stroke="${kit.trim}" stroke-width="2" />
       <image href="img/crest.webp" x="185" y="86" width="22" height="29" clip-path="url(#${id}k)" />
       <text x="150" y="170" text-anchor="middle" class="j-front" fill="${kit.text}">HALA MADRID</text>`;
  return `
    <svg class="jersey" viewBox="0 0 300 330" role="img" aria-label="Maillot vu de ${back ? 'dos' : 'face'}${name ? `, flocage ${esc(name)} ${esc(number)}` : ''}">
      <defs>
        <clipPath id="${id}c"><path d="${outline}" /></clipPath>
        <clipPath id="${id}k"><circle cx="196" cy="100" r="17" /></clipPath>
        <linearGradient id="${id}g" x1="0" x2="1">
          <stop offset="0" stop-color="#fff" stop-opacity=".16" />
          <stop offset=".5" stop-color="#fff" stop-opacity="0" />
          <stop offset="1" stop-color="#000" stop-opacity=".18" />
        </linearGradient>
        <linearGradient id="${id}f" x1="0" y1="0" x2="0" y2="1">
          <stop offset=".3" stop-color="#000" stop-opacity="0" />
          <stop offset="1" stop-color="#000" stop-opacity=".38" />
        </linearGradient>
        <radialGradient id="${id}r" cx=".35" cy=".22" r=".75">
          <stop offset="0" stop-color="#fff" stop-opacity=".2" />
          <stop offset="1" stop-color="#fff" stop-opacity="0" />
        </radialGradient>
      </defs>
      ${back ? '' : `<path d="M104 26 ${frontNeck} C180 36 120 36 104 26 Z" fill="${kit.inner}" />`}
      <path d="${outline}" fill="${kit.body}" />
      <g clip-path="url(#${id}c)">
        ${kitPattern(kit, id)}
        ${SLEEVES.map((d) => `<path d="${d}" fill="${kit.sleeve}" />`).join('')}
        <path d="M104 26 C90 52 80 80 76 112 M196 26 C210 52 220 80 224 112" fill="none" stroke="${kit.trim}" stroke-width="3" />
        <path d="M14 88 L45 134 M286 88 L255 134" stroke="${kit.trim}" stroke-width="9" />
        <path d="M70 296 Q150 314 230 296" fill="none" stroke="${kit.trim}" stroke-width="8" />
        <path d="M76 112 C74 165 72 235 74 300 M224 112 C226 165 228 235 226 300" fill="none" stroke="#000" stroke-opacity=".08" stroke-width="3" />
        <path d="M100 150 Q150 166 200 150 M96 232 Q150 246 204 232" fill="none" stroke="#000" stroke-opacity=".025" stroke-width="10" stroke-linecap="round" />
        <rect width="300" height="330" fill="url(#${id}r)" />
        <rect width="300" height="330" fill="url(#${id}g)" />
      </g>
      <path d="${outline}" fill="none" stroke="rgba(10,20,40,.22)" stroke-width="1.5" />
      ${collar}
      ${details}
    </svg>`;
}

function scarfSvg() {
  return `
    <svg class="jersey" viewBox="0 0 300 330" role="img" aria-label="Écharpe Hala Madrid">
      <g transform="rotate(-24 150 165)">
        <g stroke="#c9a227" stroke-width="3">${Array.from({ length: 9 }, (_, i) => `<line x1="${22 + i * 0}" y1="${128 + i * 9}" x2="6" y2="${128 + i * 9}" /><line x1="278" y1="${128 + i * 9}" x2="294" y2="${128 + i * 9}" />`).join('')}</g>
        <rect x="22" y="122" width="256" height="86" rx="8" fill="#13254a" />
        <rect x="22" y="122" width="256" height="12" fill="#ffffff" />
        <rect x="22" y="196" width="256" height="12" fill="#ffffff" />
        <rect x="22" y="138" width="256" height="4" fill="#c9a227" />
        <rect x="22" y="188" width="256" height="4" fill="#c9a227" />
        <rect x="22" y="122" width="34" height="86" fill="#ffffff" opacity=".12" />
        <rect x="244" y="122" width="34" height="86" fill="#ffffff" opacity=".12" />
        <text x="150" y="176" text-anchor="middle" class="j-scarf" fill="#ffffff">¡HALA MADRID!</text>
      </g>
    </svg>`;
}

function ballSvg() {
  const cx = 150; const cy = 165; const R = 112;
  const pent = (x, y, r, rot = -90) => Array.from({ length: 5 }, (_, i) => {
    const a = ((rot + i * 72) * Math.PI) / 180;
    return `${(x + r * Math.cos(a)).toFixed(1)},${(y + r * Math.sin(a)).toFixed(1)}`;
  }).join(' ');
  const outer = Array.from({ length: 5 }, (_, i) => {
    const a = ((-90 + i * 72) * Math.PI) / 180;
    return pent(cx + 108 * Math.cos(a), cy + 108 * Math.sin(a), 36, -90 + i * 72 + 36);
  });
  const seams = Array.from({ length: 5 }, (_, i) => {
    const a = ((-90 + i * 72) * Math.PI) / 180;
    return `<line x1="${(cx + 36 * Math.cos(a)).toFixed(1)}" y1="${(cy + 36 * Math.sin(a)).toFixed(1)}" x2="${(cx + 76 * Math.cos(a)).toFixed(1)}" y2="${(cy + 76 * Math.sin(a)).toFixed(1)}" />`;
  }).join('');
  return `
    <svg class="jersey" viewBox="0 0 300 330" role="img" aria-label="Ballon d'entraînement">
      <defs>
        <clipPath id="ballclip"><circle cx="${cx}" cy="${cy}" r="${R}" /></clipPath>
        <radialGradient id="ballshade" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff" /><stop offset="1" stop-color="#d9dee8" /></radialGradient>
      </defs>
      <circle cx="${cx}" cy="${cy}" r="${R}" fill="url(#ballshade)" stroke="#13254a" stroke-width="3" />
      <g clip-path="url(#ballclip)">
        <polygon points="${pent(cx, cy, 36)}" fill="#13254a" />
        ${outer.map((p, i) => `<polygon points="${p}" fill="${i % 2 ? '#c9a227' : '#13254a'}" />`).join('')}
        <g stroke="#13254a" stroke-width="2.5">${seams}</g>
      </g>
      <circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="#13254a" stroke-width="3" />
    </svg>`;
}

function productVisual(product, opts) {
  if (product.type === 'jersey') return jerseySvg(product.kit, opts);
  return product.type === 'scarf' ? scarfSvg() : ballSvg();
}

/* =========================================================
   Données modifiables par l'admin
   ========================================================= */
function teamPlayers(teamId) {
  const team = site.teams[teamId];
  if (site.online) return team.players;
  const edits = rosterEdits[teamId] || { added: [], removed: [] };
  return [...team.players.filter((p) => !edits.removed.includes(p.id)), ...edits.added];
}
function saveRoster(teamId, edits) { rosterEdits[teamId] = edits; store.set('rm-roster', rosterEdits); }
function allNews() { return site.online ? site.news : [...newsEdits.added, ...NEWS.filter((n) => !newsEdits.removed.includes(n.id))]; }

/* =========================================================
   Composants
   ========================================================= */
const avatar = (person, cls = '') => person.photo
  ? `<img class="avatar ${cls}" src="${person.photo}" alt="" width="200" height="200" loading="lazy" />`
  : `<span class="avatar avatar-initials ${cls}" aria-hidden="true">${esc(initials(person.name))}</span>`;
const posLabel = (pos, feminine) => (feminine ? POSITIONS[pos].labelF : POSITIONS[pos].label);

function newsCard(item) {
  return `
    <article class="news-card reveal">
      <div class="news-media">${item.img ? `<img src="${item.img}" alt="" loading="lazy" />` : '<span class="news-fallback"><img src="img/crest.webp" alt="" /></span>'}</div>
      <div class="news-body">
        <span class="pill">${esc(item.cat)}</span>
        <h3>${esc(item.title)}</h3>
      </div>
      ${canDelete(item) ? `<button class="admin-remove" type="button" data-remove-news="${esc(item.id)}" aria-label="Supprimer l'actualité ${esc(item.title)}">×</button>` : ''}
    </article>`;
}

function productCard(product) {
  return `
    <a class="product-card reveal" href="#/boutique/${product.id}" data-type="${product.type}">
      <div class="product-stage" style="--kit:${product.kit ? product.kit.body : '#13254a'}">${productVisual(product)}</div>
      <div class="product-info">
        <span class="product-tag">${esc(product.tag)}</span>
        <h3>${esc(product.name)}</h3>
        <p class="price">${euro.format(product.price)}</p>
      </div>
      <span class="product-cta">${product.type === 'jersey' ? 'Personnaliser' : 'Voir le produit'} <span aria-hidden="true">→</span></span>
    </a>`;
}

function pitchSvg() {
  return `
    <svg class="pitch-lines" viewBox="0 0 680 1050" preserveAspectRatio="none" aria-hidden="true">
      <g fill="none" stroke="rgba(255,255,255,.55)" stroke-width="4">
        <rect x="20" y="20" width="640" height="1010" rx="4" />
        <line x1="20" y1="525" x2="660" y2="525" />
        <circle cx="340" cy="525" r="92" />
        <rect x="138" y="20" width="404" height="165" /><rect x="248" y="20" width="184" height="55" />
        <rect x="138" y="865" width="404" height="165" /><rect x="248" y="975" width="184" height="55" />
        <path d="M262 185 A92 92 0 0 0 418 185" /><path d="M262 865 A92 92 0 0 1 418 865" />
      </g>
      <circle cx="340" cy="525" r="5" fill="rgba(255,255,255,.7)" />
    </svg>`;
}

/* =========================================================
   Pages
   ========================================================= */
function viewHome() {
  const latest = allNews().slice(0, 3);
  return `
    <section class="hero">
      ${pitchSvg()}
      <div class="container hero-grid">
        <div class="hero-copy">
          <p class="kicker intro" style="--i:0">Real Madrid C.F. · Fondé en 1902</p>
          <h1 class="hero-title intro" style="--i:1"><span>¡Hala</span> <span class="gold">Madrid!</span></h1>
          <p class="hero-lead intro" style="--i:2">Élu meilleur club du XXᵉ siècle par la FIFA. Les équipes, les actualités et la boutique des supporters merengues, réunies au même endroit.</p>
          <div class="actions intro" style="--i:3">
            <a class="btn btn-gold" href="#/equipes/masculine">Découvrir l'équipe</a>
            <a class="btn btn-ghost-light" href="#/boutique">Visiter la boutique</a>
          </div>
        </div>
        <div class="hero-visual intro-visual">
          <div class="hero-jersey">${jerseySvg(site.products[0].kit, { view: 'back', name: 'BELLINGHAM', number: '5' })}</div>
          <a class="hero-card" href="#/boutique/domicile">
            <span class="hero-card-label">Maillot domicile</span>
            <span class="hero-card-price">${euro.format(site.products[0].price)}</span>
            <span class="hero-card-cta">Flocage personnalisé →</span>
          </a>
        </div>
      </div>
    </section>

    <section class="honours" aria-label="Palmarès">
      <div class="container honours-grid">
        ${HONOURS.map((h) => `
          <div class="honour reveal">
            <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path fill="currentColor" d="M7 3h10v2h3v3a5 5 0 0 1-4.6 5A5 5 0 0 1 13 15.9V18h3v3H8v-3h3v-2.1A5 5 0 0 1 8.6 13 5 5 0 0 1 4 8V5h3zm0 4H6v1a3 3 0 0 0 1.4 2.5A7 7 0 0 1 7 8zm10 0v1a7 7 0 0 1-.4 2.5A3 3 0 0 0 18 8V7z"/></svg>
            <strong data-count="${h.value}">${h.value}</strong>
            <span>${h.label}</span>
          </div>`).join('')}
      </div>
      <p class="container honours-note">Palmarès à la fin de l'année 2024.</p>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head reveal">
          <div><p class="kicker">À la une</p><h2>Les dernières actualités</h2></div>
          <a class="link-arrow" href="#/actualites">Toutes les actualités →</a>
        </div>
        <div class="news-grid">${latest.map((n) => newsCard(n)).join('')}</div>
      </div>
    </section>

    <section class="section section-navy">
      <div class="container">
        <div class="section-head reveal">
          <div><p class="kicker">Le club</p><h2>Trois équipes, un seul maillot</h2></div>
        </div>
        <div class="teams-grid">
          ${Object.entries(site.teams).map(([id, team]) => `
            <a class="team-card reveal" href="#/equipes/${id}">
              <img src="${team.photo}" alt="" loading="lazy" />
              <div class="team-card-body">
                <p class="kicker">${team.short}</p>
                <h3>${team.name}</h3>
                <p>${team.staff[1].role} : ${team.staff[1].name}</p>
                <span class="link-arrow">Voir l'effectif →</span>
              </div>
            </a>`).join('')}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head reveal">
          <div><p class="kicker">La boutique</p><h2>Porte les couleurs, avec ton nom</h2></div>
          <a class="link-arrow" href="#/boutique">Toute la boutique →</a>
        </div>
        <div class="products-grid">${site.products.filter((p) => p.type === 'jersey').slice(0, 3).map(productCard).join('')}</div>
      </div>
    </section>

    <section class="section section-tight">
      <div class="container stadium-card reveal">
        <div>
          <p class="kicker">Le stade</p>
          <h2>${CLUB.stadium}</h2>
          <p>${CLUB.address}</p>
        </div>
        <a class="btn btn-navy" href="#/contact">Plan d'accès et contact</a>
      </div>
    </section>`;
}

function viewTeam(teamId) {
  const team = site.teams[teamId];
  if (!team) return viewNotFound();
  const players = teamPlayers(teamId);
  const byId = Object.fromEntries(players.map((p) => [p.id, p]));
  const lines = ['ATT', 'MID', 'DEF', 'GK'];
  const rows = { ATT: 22, MID: 46, DEF: 70, GK: 89 };
  const tokens = lines.flatMap((line) => {
    const ids = team.lineup[line].filter((id) => byId[id]);
    return ids.map((id, i) => {
      const x = ((i + 1) / (ids.length + 1)) * 100;
      const p = byId[id];
      return `<li class="token" style="--x:${x}%; --y:${rows[line]}%">${avatar(p, 'token-avatar')}<span>${esc(shortName(p))}</span></li>`;
    });
  });

  return `
    <section class="page-hero">
      <div class="container page-hero-grid">
        <div>
          <nav class="tabs" aria-label="Équipes">
            ${Object.entries(site.teams).map(([id, t]) => `<a href="#/equipes/${id}" ${id === teamId ? 'aria-current="page"' : ''}>${t.short}</a>`).join('')}
          </nav>
          <h1>${team.name}</h1>
          <p class="page-lead">${team.intro}</p>
          <p class="season">${team.season} · ${players.length} ${team.feminine ? 'joueuses' : 'joueurs'}</p>
        </div>
        <img class="page-hero-photo" src="${team.photo}" alt="Photo de l'${team.name.toLowerCase()}" />
      </div>
    </section>

    <section class="section">
      <div class="container team-grid">
        <div class="pitch-wrap reveal">
          <h2 class="card-title">Onze type <small>4-3-3</small></h2>
          <div class="pitch">${pitchSvg()}<ol class="tokens">${tokens.join('')}</ol></div>
        </div>
        <div class="team-side">
          <div class="card reveal">
            <h2 class="card-title">Staff</h2>
            <ul class="staff-list">
              ${team.staff.map((s) => `<li>${avatar(s)}<div><strong>${esc(s.name)}</strong><span>${esc(s.role)}</span></div></li>`).join('')}
            </ul>
          </div>
          <div class="card reveal">
            <h2 class="card-title">Composition de l'effectif</h2>
            <ul class="split">
              ${Object.keys(POSITIONS).map((pos) => {
                const n = players.filter((p) => p.pos === pos).length;
                return `<li><span>${POSITIONS[pos].plural}</span><div class="split-bar"><i style="--w:${(n / Math.max(players.length, 1)) * 100}%"></i></div><b>${n}</b></li>`;
              }).join('')}
            </ul>
          </div>
        </div>
      </div>
    </section>

    <section class="section section-tight">
      <div class="container">
        <div class="section-head reveal">
          <div><p class="kicker">Effectif</p><h2>${team.feminine ? 'Les joueuses' : 'Les joueurs'}</h2></div>
          ${isAdmin() ? `<button class="btn btn-navy" type="button" data-add-player="${teamId}">+ Ajouter ${team.feminine ? 'une joueuse' : 'un joueur'}</button>` : ''}
        </div>
        <div class="toolbar">
          <div class="chips" role="group" aria-label="Filtrer par poste">
            <button type="button" class="chip" data-pos="all" aria-pressed="true">Tous</button>
            ${Object.keys(POSITIONS).map((pos) => `<button type="button" class="chip" data-pos="${pos}" aria-pressed="false">${POSITIONS[pos].plural}</button>`).join('')}
          </div>
          <label class="search">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" d="m21 21-4.3-4.3M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z"/></svg>
            <input type="search" id="player-search" placeholder="Rechercher un nom" aria-label="Rechercher dans l'effectif" />
          </label>
        </div>
        <div class="roster" id="roster" data-team="${teamId}">
          ${Object.keys(POSITIONS).map((pos) => {
            const list = players.filter((p) => p.pos === pos);
            if (!list.length) return '';
            return `
              <div class="roster-group" data-group="${pos}">
                <h3>${POSITIONS[pos].plural} <span>${list.length}</span></h3>
                <ul class="player-grid">
                  ${list.map((p) => `
                    <li class="player-card" data-name="${esc(p.name.toLowerCase())}">
                      ${avatar(p)}
                      <strong>${esc(p.name)}</strong>
                      <span>${posLabel(p.pos, team.feminine)}</span>
                      ${canDelete(p) ? `<button class="admin-remove" type="button" data-remove-player="${esc(p.id)}" aria-label="Retirer ${esc(p.name)}">×</button>` : ''}
                    </li>`).join('')}
                </ul>
              </div>`;
          }).join('')}
          <p class="empty" id="roster-empty" hidden>Aucun résultat pour cette recherche.</p>
        </div>
      </div>
    </section>`;
}

function viewNews() {
  const items = allNews();
  return `
    <section class="page-hero page-hero-compact">
      <div class="container">
        <p class="kicker">Actualités</p>
        <h1>Toute l'actualité merengue</h1>
        <p class="page-lead">Transferts, matchs, équipe féminine et grands souvenirs du club.</p>
      </div>
    </section>
    <section class="section section-tight">
      <div class="container">
        <div class="toolbar">
          <div class="chips" role="group" aria-label="Filtrer par catégorie">
            <button type="button" class="chip" data-cat="all" aria-pressed="true">Toutes <span>${items.length}</span></button>
            ${NEWS_CATEGORIES.map((c) => `<button type="button" class="chip" data-cat="${esc(c)}" aria-pressed="false">${esc(c)} <span>${items.filter((n) => n.cat === c).length}</span></button>`).join('')}
          </div>
          ${isAdmin() ? '<button class="btn btn-navy" type="button" data-add-news>+ Publier une actualité</button>' : ''}
        </div>
        <div class="news-grid" id="news-grid">${items.map((n) => `<div class="news-cell" data-cat="${esc(n.cat)}">${newsCard(n)}</div>`).join('')}</div>
        <p class="empty" id="news-empty" ${items.length ? 'hidden' : ''}>Aucune actualité dans cette catégorie.</p>
      </div>
    </section>`;
}

function viewShop() {
  return `
    <section class="page-hero page-hero-compact">
      <div class="container">
        <p class="kicker">Boutique</p>
        <h1>La boutique des supporters</h1>
        <p class="page-lead">Maillots floqués à ton nom ou à celui de ton joueur préféré, écharpe de tribune et ballon.</p>
        <p class="demo-note">Boutique de démonstration : le panier fonctionne, mais aucun paiement n'est demandé.</p>
      </div>
    </section>
    <section class="section section-tight">
      <div class="container">
        <div class="toolbar">
          <div class="chips" role="group" aria-label="Filtrer les produits">
            <button type="button" class="chip" data-type="all" aria-pressed="true">Tout</button>
            <button type="button" class="chip" data-type="jersey" aria-pressed="false">Maillots</button>
            <button type="button" class="chip" data-type="other" aria-pressed="false">Accessoires</button>
          </div>
        </div>
        <div class="products-grid" id="products">${site.products.map(productCard).join('')}</div>
      </div>
    </section>`;
}

function viewProduct(id) {
  const product = findProduct(id);
  if (!product) return viewNotFound();
  const jersey = product.type === 'jersey';
  return `
    <section class="section product-page">
      <div class="container">
        <a class="link-arrow back-link" href="#/boutique">← Retour à la boutique</a>
        <div class="product-grid">
          <div class="product-visual reveal">
            <div class="stage" style="--kit:${jersey ? product.kit.body : '#13254a'}">
              <div class="flip" id="flip">
                <div class="flip-face flip-front">${productVisual(product, { view: 'front' })}</div>
                ${jersey ? `<div class="flip-face flip-back" id="back-face">${productVisual(product, { view: 'back' })}</div>` : ''}
              </div>
            </div>
            ${jersey ? `
              <div class="view-toggle" role="group" aria-label="Vue du maillot">
                <button type="button" data-view="front" aria-pressed="true">Face</button>
                <button type="button" data-view="back" aria-pressed="false">Dos</button>
              </div>` : ''}
          </div>

          <form class="product-form reveal" id="product-form" novalidate>
            <span class="product-tag">${esc(product.tag)}</span>
            <h1>${esc(product.name)}</h1>
            <p class="product-desc">${esc(product.desc)}</p>
            <p class="price price-lg" id="live-price">${euro.format(product.price)}</p>

            ${jersey ? `
              <fieldset class="opt">
                <legend>Taille <span class="opt-hint" id="size-hint"></span></legend>
                <div class="size-grid">${SIZES.map((s) => `<label class="size"><input type="radio" name="size" value="${s}" /><span>${s}</span></label>`).join('')}</div>
              </fieldset>

              <fieldset class="opt">
                <legend>Flocage <span class="opt-hint">+ ${euro.format(FLOCAGE_PRICE)}</span></legend>
                <div class="seg" role="radiogroup">
                  <label><input type="radio" name="flocage" value="none" checked /><span>Sans</span></label>
                  <label><input type="radio" name="flocage" value="player" /><span>Joueur</span></label>
                  <label><input type="radio" name="flocage" value="custom" /><span>Personnalisé</span></label>
                </div>
                <div class="flocage-panel" data-panel="player" hidden>
                  <select name="player" aria-label="Choisir un joueur">
                    ${FLOCAGE_PLAYERS.map((p, i) => `<option value="${i}">${p.number} · ${esc(p.name)}</option>`).join('')}
                  </select>
                </div>
                <div class="flocage-panel flocage-custom" data-panel="custom" hidden>
                  <label>Nom<input type="text" name="customName" maxlength="12" placeholder="TON NOM" autocomplete="off" /></label>
                  <label>Numéro<input type="number" name="customNumber" min="0" max="99" placeholder="10" /></label>
                </div>
              </fieldset>` : ''}

            <div class="buy-row">
              <div class="qty" role="group" aria-label="Quantité">
                <button type="button" data-qty="-1" aria-label="Diminuer la quantité">−</button>
                <output id="qty">1</output>
                <button type="button" data-qty="1" aria-label="Augmenter la quantité">+</button>
              </div>
              <button class="btn btn-gold btn-block" type="submit">Ajouter au panier</button>
            </div>
            <p class="form-error" id="product-error" role="alert"></p>
            <ul class="perks">
              <li>Livraison offerte dès ${euro.format(100)}</li>
              <li>Flocage officiel, police du club</li>
              <li>Retour gratuit sous 30 jours</li>
            </ul>
          </form>
        </div>
      </div>
    </section>
    <section class="section section-tight">
      <div class="container">
        <div class="section-head"><div><p class="kicker">Vous aimerez aussi</p><h2>Complète ta tenue</h2></div></div>
        <div class="products-grid">${site.products.filter((p) => p.id !== id).slice(0, 3).map(productCard).join('')}</div>
      </div>
    </section>`;
}

function viewContact() {
  const q = encodeURIComponent(`${CLUB.stadium}, ${CLUB.address}`);
  return `
    <section class="page-hero page-hero-compact">
      <div class="container">
        <p class="kicker">Contact</p>
        <h1>Rendez-vous au Bernabéu</h1>
        <p class="page-lead">Pour joindre le club, appelez le standard ou passez par ses canaux officiels.</p>
      </div>
    </section>
    <section class="section section-tight">
      <div class="container contact-grid">
        <div class="card reveal">
          <h2 class="card-title">${CLUB.stadium}</h2>
          <p class="contact-line">${CLUB.address}</p>
          <a class="link-arrow" href="https://www.google.com/maps/dir/?api=1&amp;destination=${q}" target="_blank" rel="noopener">Itinéraire →</a>
          <div class="phone-block">
            <span>Standard du club</span>
            <a href="${CLUB.phoneHref}">${CLUB.phone}</a>
          </div>
          <h3 class="links-title">Canaux officiels</h3>
          <ul class="official-links">
            ${CLUB.links.map((l) => `<li><a href="${l.href}" target="_blank" rel="noopener"><span>${l.label}</span><b>${l.handle}</b></a></li>`).join('')}
          </ul>
        </div>
        <div class="map reveal">
          <iframe title="Plan d'accès au ${CLUB.stadium}" src="https://www.google.com/maps?q=${q}&amp;output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
        </div>
      </div>
    </section>`;
}

function viewLogin() {
  if (isAdmin()) {
    const demo = api.enabled && site.user.role === 'demo';
    return `
      <section class="section auth-page">
        <div class="auth-stack">
        <div class="card auth-card reveal">
          <span class="crest-badge crest-lg"><img src="img/crest.webp" alt="" /></span>
          <h1>Vous êtes connecté</h1>
          <p>${demo
            ? 'Compte démo : publiez des actualités et modifiez les effectifs. Vos ajouts restent visibles 24 h et vous ne pouvez retirer que ce que vous avez ajouté.'
            : 'Le mode admin est actif : publiez des actualités et modifiez les effectifs depuis leurs pages.'}</p>
          <div class="auth-actions">
            <a class="btn btn-navy" href="#/actualites">Gérer les actualités</a>
            <a class="btn btn-ghost" href="#/equipes/masculine">Gérer les effectifs</a>
            <button class="link-btn" type="button" data-logout>Se déconnecter</button>
          </div>
        </div>
        ${api.enabled ? '<div class="card orders-card reveal" id="orders-panel"><h2 class="card-title">Dernières commandes</h2><p class="empty-note">Chargement…</p></div>' : ''}
        </div>
      </section>`;
  }
  return `
    <section class="section auth-page">
      <form class="card auth-card reveal" id="login-form" novalidate>
        <span class="crest-badge crest-lg"><img src="img/crest.webp" alt="" /></span>
        <h1>Espace admin</h1>
        <p>Connectez-vous pour publier des actualités et gérer les effectifs.</p>
        <label class="field">Nom d'utilisateur<input type="text" name="username" autocomplete="username" required /></label>
        <label class="field">Mot de passe<input type="password" name="password" autocomplete="current-password" required /></label>
        <p class="form-error" id="login-error" role="alert"></p>
        <button class="btn btn-navy btn-block" type="submit">Se connecter</button>
        <div class="demo-creds">
          <p><b>Démo</b> · identifiant <code>${demoLogin.username}</code>, mot de passe <code>${demoLogin.password}</code></p>
          <button class="link-btn" type="button" data-fill-demo>Remplir automatiquement</button>
        </div>
      </form>
    </section>`;
}

function viewNotFound() {
  return `
    <section class="section auth-page">
      <div class="card auth-card">
        <h1>Hors-jeu&nbsp;!</h1>
        <p>Cette page n'existe pas.</p>
        <a class="btn btn-navy" href="#/">Retour à l'accueil</a>
      </div>
    </section>`;
}

/* =========================================================
   Comportements propres à chaque page
   ========================================================= */
function setupChips(groupSelector, onChange) {
  const chips = $$(`${groupSelector} .chip`);
  chips.forEach((chip) => chip.addEventListener('click', () => {
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
    onChange(chip);
  }));
}

function setupTeam(teamId) {
  let pos = 'all';
  const search = $('#player-search');
  const apply = () => {
    const q = search.value.trim().toLowerCase();
    let visible = 0;
    $$('.roster-group').forEach((group) => {
      const groupMatch = pos === 'all' || group.dataset.group === pos;
      let groupVisible = 0;
      $$('.player-card', group).forEach((card) => {
        const show = groupMatch && card.dataset.name.includes(q);
        card.hidden = !show;
        if (show) groupVisible += 1;
      });
      group.hidden = groupVisible === 0;
      visible += groupVisible;
    });
    $('#roster-empty').hidden = visible > 0;
  };
  setupChips('.toolbar', (chip) => { pos = chip.dataset.pos; apply(); });
  search.addEventListener('input', apply);
}

function setupNews() {
  setupChips('.toolbar', (chip) => {
    const cat = chip.dataset.cat;
    let visible = 0;
    $$('.news-cell').forEach((cell) => {
      const show = cat === 'all' || cell.dataset.cat === cat;
      cell.hidden = !show;
      if (show) visible += 1;
    });
    $('#news-empty').hidden = visible > 0;
  });
}

function setupShop() {
  setupChips('.toolbar', (chip) => {
    $$('#products .product-card').forEach((card) => {
      const t = card.dataset.type;
      card.hidden = !(chip.dataset.type === 'all' || (chip.dataset.type === 'jersey' ? t === 'jersey' : t !== 'jersey'));
    });
  });
}

function setupProduct(id) {
  const product = findProduct(id);
  if (!product) return;
  const form = $('#product-form');
  const flip = $('#flip');
  let qty = 1;

  const flocage = () => {
    if (product.type !== 'jersey') return null;
    const mode = form.elements.flocage.value;
    if (mode === 'player') return { ...FLOCAGE_PLAYERS[Number(form.elements.player.value)] };
    if (mode === 'custom') {
      const name = form.elements.customName.value.trim().toUpperCase();
      const raw = form.elements.customNumber.value;
      return { name, number: raw === '' ? '' : String(Math.max(0, Math.min(99, Number(raw)))) };
    }
    return null;
  };
  const showView = (view) => {
    if (!flip) return;
    flip.classList.toggle('is-back', view === 'back');
    $$('.view-toggle button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.view === view)));
  };
  const refresh = () => {
    const f = flocage();
    const unit = product.price + (f && (f.name || f.number) ? FLOCAGE_PRICE : 0);
    $('#live-price').textContent = euro.format(unit * qty);
    $('#qty').textContent = qty;
    if (product.type === 'jersey') {
      $('#back-face').innerHTML = jerseySvg(product.kit, { view: 'back', name: f ? f.name : '', number: f ? f.number : '' });
      $$('.flocage-panel', form).forEach((panel) => { panel.hidden = panel.dataset.panel !== form.elements.flocage.value; });
    }
  };

  form.addEventListener('change', (e) => {
    if (['flocage', 'player'].includes(e.target.name)) showView(form.elements.flocage.value === 'none' ? 'front' : 'back');
    if (e.target.name === 'size') { $('#size-hint').textContent = ''; $('#product-error').textContent = ''; }
    refresh();
  });
  form.addEventListener('input', (e) => { if (e.target.name?.startsWith('custom')) { showView('back'); refresh(); } });
  $$('.view-toggle button').forEach((b) => b.addEventListener('click', () => showView(b.dataset.view)));
  $$('[data-qty]', form).forEach((b) => b.addEventListener('click', () => { qty = Math.max(1, Math.min(10, qty + Number(b.dataset.qty))); refresh(); }));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let size = null;
    if (product.type === 'jersey') {
      size = form.elements.size.value;
      if (!size) {
        $('#product-error').textContent = 'Choisissez une taille.';
        $('.size-grid input').focus();
        return;
      }
    }
    const f = flocage();
    if (f && form.elements.flocage.value === 'custom' && (!f.name || f.number === '')) {
      $('#product-error').textContent = 'Indiquez un nom et un numéro pour le flocage.';
      return;
    }
    addToCart({ productId: product.id, size, flocage: f && (f.name || f.number) ? f : null, qty });
    $('#product-error').textContent = '';
    toast(`${product.name} ajouté au panier`);
    openCart();
  });
  refresh();
}

function setupLogin() {
  if (isAdmin() && api.enabled) loadOrders();
  const form = $('#login-form');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = form.elements.username.value.trim();
    const password = form.elements.password.value;
    const error = $('#login-error');
    if (api.enabled) {
      const button = $('[type="submit"]', form);
      button.disabled = true;
      error.textContent = '';
      try {
        const { token, user } = await api.post('/api/auth/login', { username, password });
        api.token.set(token);
        site.user = user;
      } catch (err) {
        error.textContent = err.message;
        return;
      } finally {
        button.disabled = false;
      }
      if (!site.online) await loadRemote();
    } else {
      if (username !== 'admin' || password !== 'admin123') { error.textContent = "Nom d'utilisateur ou mot de passe incorrect."; return; }
      try { sessionStorage.setItem('rm-admin', '1'); } catch { /* ignore */ }
    }
    updateChrome();
    toast('Connexion réussie : mode admin activé');
    location.hash = '#/actualites';
  });
  $('[data-fill-demo]').addEventListener('click', () => {
    form.elements.username.value = demoLogin.username;
    form.elements.password.value = demoLogin.password;
    $('#login-error').textContent = '';
  });
}

/* Dernières commandes enregistrées par l'API (espace admin) */
async function loadOrders() {
  const panel = $('#orders-panel');
  if (!panel) return;
  try {
    const { stats, orders } = await api.get('/api/orders');
    const lines = (o) => o.items.map((i) => `${i.qty} × ${esc(i.name)}${i.size ? ` · ${esc(i.size)}` : ''}${i.flocageName ? ` · ${esc(i.flocageName)} ${esc(i.flocageNumber)}` : ''}`).join('<br>');
    panel.innerHTML = `
      <h2 class="card-title">Dernières commandes</h2>
      <div class="order-stats">
        <div><b>${stats.count}</b><span>commande${stats.count > 1 ? 's' : ''}</span></div>
        <div><b>${euro.format(stats.revenue)}</b><span>montant total</span></div>
      </div>
      ${orders.length
        ? `<ul class="order-list">${orders.map((o) => `
            <li>
              <div class="order-ref"><b>${esc(o.reference)}</b><span>${dateFormat.format(new Date(o.createdAt))}</span></div>
              <p>${lines(o)}</p>
              <strong>${euro.format(o.total)}</strong>
            </li>`).join('')}</ul>`
        : '<p class="empty-note">Aucune commande pour le moment : passez-en une depuis la boutique.</p>'}`;
  } catch (err) {
    $('.empty-note', panel).textContent = err.message;
  }
}

async function refreshNews() { site.news = await api.get('/api/news'); }
async function refreshTeam(teamId) { site.teams[teamId] = await api.get(`/api/teams/${encodeURIComponent(teamId)}`); }

/* Lance une action admin sur l'API, puis réaffiche la page sans la faire remonter */
async function runAdmin(action, success) {
  try {
    await action();
    toast(success);
    rerender();
  } catch (err) {
    toast(err.message);
  }
}

/* ---------- Actions admin (délégation) ---------- */
document.addEventListener('click', (e) => {
  const logout = e.target.closest('[data-logout]');
  if (logout) {
    if (api.enabled) {
      api.token.clear();
      site.user = null;
    }
    try { sessionStorage.removeItem('rm-admin'); } catch { /* ignore */ }
    updateChrome();
    toast('Vous êtes déconnecté');
    route();
    return;
  }
  const removeNews = e.target.closest('[data-remove-news]');
  if (removeNews) {
    const id = removeNews.dataset.removeNews;
    if (api.enabled) {
      runAdmin(async () => { await api.del(`/api/news/${encodeURIComponent(id)}`); await refreshNews(); }, 'Actualité supprimée');
      return;
    }
    if (newsEdits.added.some((n) => n.id === id)) newsEdits.added = newsEdits.added.filter((n) => n.id !== id);
    else newsEdits.removed.push(id);
    store.set('rm-news', newsEdits);
    toast('Actualité supprimée');
    route();
    return;
  }
  const removePlayer = e.target.closest('[data-remove-player]');
  if (removePlayer) {
    const teamId = $('#roster').dataset.team;
    const id = removePlayer.dataset.removePlayer;
    if (api.enabled) {
      runAdmin(async () => { await api.del(`/api/players/${encodeURIComponent(id)}`); await refreshTeam(teamId); }, 'Membre retiré de l’effectif');
      return;
    }
    const edits = rosterEdits[teamId] || { added: [], removed: [] };
    if (edits.added.some((p) => p.id === id)) edits.added = edits.added.filter((p) => p.id !== id);
    else edits.removed.push(id);
    saveRoster(teamId, edits);
    toast('Membre retiré de l’effectif');
    route();
    return;
  }
  if (e.target.closest('[data-add-news]')) {
    const images = [...new Set(NEWS.map((n) => n.img).filter(Boolean))];
    openModal(`
      <form class="admin-form" id="news-form" novalidate>
        <h2 id="modal-title">Publier une actualité</h2>
        <label class="field">Titre<input type="text" name="title" maxlength="80" required /></label>
        <label class="field">Catégorie<select name="cat">${NEWS_CATEGORIES.map((c) => `<option>${esc(c)}</option>`).join('')}</select></label>
        <fieldset class="field"><legend>Image</legend>
          <div class="img-pick">
            <label><input type="radio" name="img" value="" checked /><span class="news-fallback"><img src="img/crest.webp" alt="Sans image" /></span></label>
            ${images.map((src) => `<label><input type="radio" name="img" value="${src}" /><img src="${src}" alt="" /></label>`).join('')}
          </div>
        </fieldset>
        <p class="form-error" id="news-error" role="alert"></p>
        <button class="btn btn-navy btn-block" type="submit">Publier</button>
      </form>`);
    $('#news-form').addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const f = ev.currentTarget;
      const title = f.elements.title.value.trim();
      if (!title) { $('#news-error').textContent = 'Indiquez un titre.'; return; }
      if (api.enabled) {
        try {
          await api.post('/api/news', { title, cat: f.elements.cat.value, img: f.elements.img.value });
          await refreshNews();
        } catch (err) {
          $('#news-error').textContent = err.details ? 'Titre trop court (3 caractères minimum) ou trop long.' : err.message;
          return;
        }
        modal.close();
        toast('Actualité publiée');
        rerender();
        return;
      }
      newsEdits.added.unshift({ id: `admin-${Date.now()}`, title, cat: f.elements.cat.value, img: f.elements.img.value });
      store.set('rm-news', newsEdits);
      modal.close();
      toast('Actualité publiée');
      route();
    });
    return;
  }
  const addPlayer = e.target.closest('[data-add-player]');
  if (addPlayer) {
    const teamId = addPlayer.dataset.addPlayer;
    const team = site.teams[teamId];
    openModal(`
      <form class="admin-form" id="player-form" novalidate>
        <h2 id="modal-title">Ajouter ${team.feminine ? 'une joueuse' : 'un joueur'}</h2>
        <label class="field">Nom complet<input type="text" name="name" maxlength="40" required /></label>
        <label class="field">Poste<select name="pos">${Object.keys(POSITIONS).map((p) => `<option value="${p}">${posLabel(p, team.feminine)}</option>`).join('')}</select></label>
        <p class="form-error" id="player-error" role="alert"></p>
        <button class="btn btn-navy btn-block" type="submit">Ajouter à l'effectif</button>
      </form>`);
    $('#player-form').addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const f = ev.currentTarget;
      const name = f.elements.name.value.trim();
      if (!name) { $('#player-error').textContent = 'Indiquez un nom.'; return; }
      if (api.enabled) {
        try {
          await api.post(`/api/teams/${encodeURIComponent(teamId)}/players`, { name, pos: f.elements.pos.value });
          await refreshTeam(teamId);
        } catch (err) {
          $('#player-error').textContent = err.details ? 'Nom trop court (2 caractères minimum) ou trop long.' : err.message;
          return;
        }
        modal.close();
        toast(`${name} a rejoint l'effectif`);
        rerender();
        return;
      }
      const edits = rosterEdits[teamId] || { added: [], removed: [] };
      edits.added.push({ id: `admin-${Date.now()}`, name, pos: f.elements.pos.value });
      saveRoster(teamId, edits);
      modal.close();
      toast(`${name} a rejoint l'effectif`);
      route();
    });
  }
});

/* =========================================================
   Panier
   ========================================================= */
const cartKey = (item) => [item.productId, item.size, item.flocage ? `${item.flocage.name}#${item.flocage.number}` : ''].join('|');
const unitPrice = (item) => findProduct(item.productId).price + (item.flocage ? FLOCAGE_PRICE : 0);
const cartCount = () => cart.reduce((n, i) => n + i.qty, 0);
const subtotal = () => cart.reduce((sum, i) => sum + unitPrice(i) * i.qty, 0);
const shipping = (sub) => (sub === 0 || sub >= 100 ? 0 : 6.9);

function addToCart(item) {
  const key = cartKey(item);
  const existing = cart.find((i) => cartKey(i) === key);
  if (existing) existing.qty = Math.min(10, existing.qty + item.qty);
  else cart.push(item);
  saveCart();
  const badge = $('#cart-count'); // petit rebond du compteur
  badge.classList.remove('bump');
  void badge.offsetWidth;
  badge.classList.add('bump');
}
function saveCart() { store.set('rm-cart', cart); renderCart(); }

function renderCart() {
  const count = cartCount();
  $('#cart-count').textContent = count;
  $('#cart-count').hidden = count === 0;
  if (!cart.length) {
    $('#cart-body').innerHTML = `
      <div class="cart-empty">
        <p>Votre panier est vide.</p>
        <a class="btn btn-navy" href="#/boutique" data-close-cart>Découvrir la boutique</a>
      </div>`;
    $('#cart-foot').innerHTML = '';
    return;
  }
  $('#cart-body').innerHTML = `<ul class="cart-list">${cart.map((item, idx) => {
    const product = findProduct(item.productId);
    const details = [item.size && `Taille ${item.size}`, item.flocage && `Flocage ${item.flocage.name} ${item.flocage.number}`].filter(Boolean).join(' · ');
    return `
      <li class="cart-item">
        <div class="cart-thumb" style="--kit:${product.kit ? product.kit.body : '#13254a'}">${productVisual(product, item.flocage ? { view: 'back', name: item.flocage.name, number: item.flocage.number } : {})}</div>
        <div class="cart-info">
          <strong>${esc(product.name)}</strong>
          ${details ? `<span>${esc(details)}</span>` : ''}
          <div class="qty qty-sm" role="group" aria-label="Quantité de ${esc(product.name)}">
            <button type="button" data-cart-qty="${idx}" data-delta="-1" aria-label="Diminuer">−</button>
            <output>${item.qty}</output>
            <button type="button" data-cart-qty="${idx}" data-delta="1" aria-label="Augmenter">+</button>
          </div>
        </div>
        <div class="cart-side">
          <b>${euro.format(unitPrice(item) * item.qty)}</b>
          <button class="link-btn" type="button" data-cart-remove="${idx}">Retirer</button>
        </div>
      </li>`;
  }).join('')}</ul>`;
  const sub = subtotal();
  const ship = shipping(sub);
  $('#cart-foot').innerHTML = `
    <dl class="totals">
      <div><dt>Sous-total</dt><dd>${euro.format(sub)}</dd></div>
      <div><dt>Livraison</dt><dd>${ship ? euro.format(ship) : 'Offerte'}</dd></div>
      ${ship ? `<p class="free-hint">Plus que ${euro.format(100 - sub)} pour la livraison offerte.</p>` : ''}
      <div class="total"><dt>Total</dt><dd>${euro.format(sub + ship)}</dd></div>
    </dl>
    <button class="btn btn-gold btn-block" type="button" id="checkout">Commander</button>
    <p class="demo-note">Commande simulée : aucun paiement ne sera demandé.</p>`;
}

const drawer = $('#cart');
const backdrop = $('#drawer-backdrop');
function openCart() {
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
  backdrop.hidden = false;
  document.body.classList.add('no-scroll');
  $('.close-btn', drawer).focus();
}
function closeCart() {
  drawer.classList.remove('open');
  drawer.setAttribute('aria-hidden', 'true');
  backdrop.hidden = true;
  document.body.classList.remove('no-scroll');
}
$('#cart-open').addEventListener('click', openCart);
backdrop.addEventListener('click', closeCart);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && drawer.classList.contains('open')) closeCart(); });
drawer.addEventListener('click', (e) => {
  if (e.target.closest('[data-close-cart]')) { closeCart(); return; }
  const qtyBtn = e.target.closest('[data-cart-qty]');
  if (qtyBtn) {
    const item = cart[Number(qtyBtn.dataset.cartQty)];
    item.qty = Math.max(1, Math.min(10, item.qty + Number(qtyBtn.dataset.delta)));
    saveCart();
    return;
  }
  const remove = e.target.closest('[data-cart-remove]');
  if (remove) { cart.splice(Number(remove.dataset.cartRemove), 1); saveCart(); return; }
  const checkoutBtn = e.target.closest('#checkout');
  if (checkoutBtn) checkout(checkoutBtn);
});

async function checkout(button) {
  let order;
  if (api.enabled) {
    button.disabled = true;
    button.textContent = 'Envoi de la commande…';
    try {
      order = await api.post('/api/orders', {
        items: cart.map((i) => ({ productId: i.productId, size: i.size, flocage: i.flocage, qty: i.qty })),
      });
    } catch (err) {
      toast(err.message);
      button.disabled = false;
      button.textContent = 'Commander';
      return;
    }
  } else {
    order = {
      reference: `RM-${Math.floor(100000 + Math.random() * 900000)}`,
      total: subtotal() + shipping(subtotal()),
      items: cart.map((i) => ({ name: findProduct(i.productId).name, qty: i.qty, flocage: i.flocage })),
    };
  }
  const lines = order.items.map((i) => `<li>${i.qty} × ${esc(i.name)}${i.flocage ? ` (${esc(i.flocage.name)} ${esc(i.flocage.number)})` : ''}</li>`).join('');
  cart = [];
  saveCart();
  closeCart();
  openModal(`
    <div class="order-done">
      <span class="check-badge" aria-hidden="true">✓</span>
      <h2 id="modal-title">Commande confirmée&nbsp;!</h2>
      <p>Référence <b>${esc(order.reference)}</b> · ${euro.format(order.total)}</p>
      <ul>${lines}</ul>
      <p class="demo-note">${api.enabled
        ? 'Commande enregistrée sur le serveur. Démonstration : aucun paiement ni livraison.'
        : "Ceci est une démonstration : aucune commande réelle n'a été passée."}</p>
      <button class="btn btn-navy btn-block" type="button" data-close-modal>Continuer</button>
    </div>`);
}

/* =========================================================
   Routeur
   ========================================================= */
const titles = { accueil: '¡Hala Madrid!', equipes: 'Équipes', actualites: 'Actualités', boutique: 'Boutique', contact: 'Contact', connexion: 'Espace admin' };
let firstRender = true;

function route(options = {}) {
  const [, section = '', param = ''] = (location.hash || '#/').split('/');
  let html;
  let setup = () => {};
  switch (section) {
    case '': html = viewHome(); setup = setupCounters; break;
    case 'equipes': html = viewTeam(param || 'masculine'); setup = () => site.teams[param || 'masculine'] && setupTeam(param || 'masculine'); break;
    case 'actualites': html = viewNews(); setup = setupNews; break;
    case 'boutique': html = param ? viewProduct(param) : viewShop(); setup = () => (param ? setupProduct(param) : setupShop()); break;
    case 'contact': html = viewContact(); break;
    case 'connexion': html = viewLogin(); setup = setupLogin; break;
    default: html = viewNotFound();
  }
  app.innerHTML = `<div class="page">${html}</div>`;
  setup();
  if (options.keepScroll) $$('.reveal', app).forEach((el) => el.classList.add('in-view'));
  observeReveals();
  const key = section || 'accueil';
  $$('.nav a').forEach((a) => { if (a.dataset.route === key) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  document.title = `${titles[key] || 'Page introuvable'} · Real Madrid, site de supporters`;
  if (!options.keepScroll) {
    window.scrollTo({ top: 0, behavior: 'auto' });
    if (!firstRender) app.focus({ preventScroll: true });
  }
  firstRender = false;
  closeMenu();
}

const rerender = () => route({ keepScroll: true });

/* ---------- Habillage commun ---------- */
function updateChrome() {
  const admin = isAdmin();
  const demo = admin && api.enabled && site.user.role === 'demo';
  $('#admin-bar').hidden = !admin;
  $('#admin-bar-text').innerHTML = demo
    ? '<b>Compte démo</b> : vos ajouts restent visibles 24 h.'
    : '<b>Mode admin</b> : vous pouvez publier des actualités et modifier les effectifs.';
  $('#account-label').textContent = admin ? (demo ? 'Démo' : 'Admin') : 'Connexion';
  $('#account-link').classList.toggle('is-admin', admin);
}

const menuBtn = $('#menu-toggle');
function closeMenu() { $('#nav').classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); }
menuBtn.addEventListener('click', () => {
  const open = !$('#nav').classList.contains('open');
  $('#nav').classList.toggle('open', open);
  menuBtn.setAttribute('aria-expanded', String(open));
});

/* ---------- Apparitions et compteurs ---------- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('in-view');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });
function observeReveals() { $$('.reveal:not(.in-view)').forEach((el) => revealObserver.observe(el)); }

function setupCounters() {
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = Number(el.dataset.count);
      counterObserver.unobserve(el);
      if (reducedMotion) return;
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min((now - start) / 1300, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach((el) => counterObserver.observe(el));
}

let ticking = false;
window.addEventListener('scroll', () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => { $('#topbar').classList.toggle('scrolled', window.scrollY > 10); ticking = false; });
}, { passive: true });

/* ---------- API ---------- */
api.onSlow = () => toast('Le serveur se réveille (hébergement gratuit), encore quelques secondes…');
api.onUnauthorized = () => {
  api.token.clear();
  site.user = null;
  updateChrome();
  toast('Session expirée, reconnectez-vous.');
};

async function loadRemote() {
  if (!api.enabled) return;
  try {
    const [teams, news, products] = await Promise.all([
      api.get('/api/teams', { quiet: true }), api.get('/api/news', { quiet: true }), api.get('/api/products', { quiet: true }),
    ]);
    if (api.token.get()) site.user = (await api.get('/api/auth/me', { quiet: true }).catch(() => ({ user: null }))).user;
    site.teams = Object.fromEntries(teams.map((t) => [t.id, t]));
    site.news = news;
    site.products = products;
    site.online = true;
  } catch {
    return; // serveur injoignable : le site continue avec les données de data.js
  }
  updateChrome();
  // Pas de nouveau rendu pendant une saisie (fiche produit, formulaire de connexion)
  const [, section = '', param = ''] = (location.hash || '#/').split('/');
  const typing = (section === 'boutique' && param) || (section === 'connexion' && !isAdmin());
  if (!typing) rerender();
}

/* ---------- Démarrage ---------- */
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.addEventListener('hashchange', route);
updateChrome();
renderCart();
route();
loadRemote();
