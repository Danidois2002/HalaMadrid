/* =========================================================
   Données du site : saison 2026-27 (effectifs, staff et actualités d'après realmadrid.com, octobre 2026)
   ========================================================= */

/* Version des données de départ : à changer quand on modifie ce fichier, pour que l'API les recharge.
   Les photos portent ?v=2627 : changer ce numéro quand on remplace une photo, sinon les navigateurs gardent l'ancienne. */
const DATA_VERSION = '2026-27.2';

const POSITIONS = {
  GK: { label: 'Gardien', labelF: 'Gardienne', plural: 'Gardiens' },
  DEF: { label: 'Défenseur', labelF: 'Défenseuse', plural: 'Défenseurs' },
  MID: { label: 'Milieu', labelF: 'Milieu', plural: 'Milieux' },
  ATT: { label: 'Attaquant', labelF: 'Attaquante', plural: 'Attaquants' },
};

const TEAMS = {
  masculine: {
    name: 'Équipe première masculine',
    short: 'Masculine',
    season: 'Effectif 2026-27',
    feminine: false,
    photo: 'img/equipes/senior.webp',
    intro: "Quinze fois championne d'Europe, l'équipe première porte l'héritage du meilleur club du XXᵉ siècle.",
    staff: [
      { name: 'Florentino Pérez', role: 'Président du club', photo: 'img/staff/florentino.webp' },
      { name: 'José Mourinho', role: 'Entraîneur', photo: 'img/staff/mourinho.webp?v=2627' },
    ],
    players: [
      { id: 'courtois', name: 'Thibaut Courtois', pos: 'GK', photo: 'img/joueurs/courtois.webp?v=2627' },
      { id: 'lunin', name: 'Andriy Lunin', pos: 'GK', photo: 'img/joueurs/lunin.webp?v=2627' },
      { id: 'asencio', name: 'Raúl Asencio', pos: 'DEF', photo: 'img/joueurs/asencio.webp?v=2627' },
      { id: 'militao', name: 'Éder Militão', pos: 'DEF', photo: 'img/joueurs/militao.webp?v=2627' },
      { id: 'huijsen', name: 'Dean Huijsen', pos: 'DEF', photo: 'img/joueurs/huijsen.webp?v=2627' },
      { id: 'trent', name: 'Trent Alexander-Arnold', short: 'Trent', pos: 'DEF', photo: 'img/joueurs/trent.webp?v=2627' },
      { id: 'konate', name: 'Ibrahima Konaté', pos: 'DEF', photo: 'img/joueurs/konate.webp?v=2627' },
      { id: 'cucurella', name: 'Marc Cucurella', pos: 'DEF', photo: 'img/joueurs/cucurella.webp?v=2627' },
      { id: 'rudiger', name: 'Antonio Rüdiger', pos: 'DEF', photo: 'img/joueurs/rudiger.webp?v=2627' },
      { id: 'mendy', name: 'Ferland Mendy', pos: 'DEF', photo: 'img/joueurs/mendy.webp?v=2627' },
      { id: 'dumfries', name: 'Denzel Dumfries', pos: 'DEF', photo: 'img/joueurs/dumfries.webp?v=2627' },
      { id: 'bellingham', name: 'Jude Bellingham', pos: 'MID', photo: 'img/joueurs/bellingham.webp?v=2627' },
      { id: 'camavinga', name: 'Eduardo Camavinga', pos: 'MID', photo: 'img/joueurs/camavinga.webp?v=2627' },
      { id: 'valverde', name: 'Federico Valverde', pos: 'MID', photo: 'img/joueurs/valverde.webp?v=2627' },
      { id: 'tchouameni', name: 'Aurélien Tchouaméni', pos: 'MID', photo: 'img/joueurs/tchouameni.webp?v=2627' },
      { id: 'guler', name: 'Arda Güler', pos: 'MID', photo: 'img/joueurs/guler.webp?v=2627' },
      { id: 'bernardo', name: 'Bernardo Silva', short: 'Bernardo', pos: 'MID', photo: 'img/joueurs/bernardo.webp?v=2627' },
      { id: 'thiago', name: 'Thiago Pitarch', short: 'Thiago', pos: 'MID', photo: 'img/joueurs/thiago.webp?v=2627' },
      { id: 'brahim', name: 'Brahim Díaz', short: 'Brahim', pos: 'ATT', photo: 'img/joueurs/brahim.webp?v=2627' },
      { id: 'vinicius', name: 'Vinícius Jr.', short: 'Vinícius', pos: 'ATT', photo: 'img/joueurs/vinicius.webp?v=2627' },
      { id: 'endrick', name: 'Endrick', pos: 'ATT', photo: 'img/joueurs/endrick.webp?v=2627' },
      { id: 'mbappe', name: 'Kylian Mbappé', pos: 'ATT', photo: 'img/joueurs/mbappe.webp?v=2627' },
      { id: 'rodrygo', name: 'Rodrygo Goes', short: 'Rodrygo', pos: 'ATT', photo: 'img/joueurs/rodrygo.webp?v=2627' },
      { id: 'espi', name: 'Carlos Espí', pos: 'ATT', photo: 'img/joueurs/espi.webp?v=2627' },
      { id: 'diomande', name: 'Yan Diomande', pos: 'ATT', photo: 'img/joueurs/diomande.webp?v=2627' },
    ],
    // Onze type en 4-3-3 (identifiants des joueurs, de l'arrière vers l'avant ; dans chaque ligne, de gauche à droite sur le terrain)
    lineup: { GK: ['courtois'], DEF: ['cucurella', 'huijsen', 'konate', 'trent'], MID: ['guler', 'tchouameni', 'valverde'], ATT: ['vinicius', 'mbappe', 'diomande'] },
  },
  feminine: {
    name: 'Équipe première féminine',
    short: 'Féminine',
    season: 'Effectif 2026-27',
    feminine: true,
    photo: 'img/equipes/seniorfemme.webp',
    intro: "Une équipe ambitieuse qui fait grandir le football féminin sous le maillot blanc.",
    staff: [
      { name: 'Florentino Pérez', role: 'Président du club', photo: 'img/staff/florentino.webp' },
      { name: 'Pau Quesada', role: 'Entraîneur', photo: 'img/staff/quesada.webp?v=2627' },
    ],
    players: [
      { id: 'frohms', name: 'Merle Frohms', pos: 'GK', photo: 'img/joueurs/frohms.webp?v=2627' },
      { id: 'laia', name: 'Laia López', short: 'Laia', pos: 'GK', photo: 'img/joueurs/laia.webp?v=2627' },
      { id: 'noe', name: 'Noemí Bejarano', short: 'Noe', pos: 'DEF', photo: 'img/joueurs/noe.webp?v=2627' },
      { id: 'levels', name: 'Janou Levels', pos: 'DEF', photo: 'img/joueurs/levels.webp?v=2627' },
      { id: 'cristobal', name: 'Silvia Cristóbal', pos: 'DEF', photo: 'img/joueurs/cristobal.webp?v=2627' },
      { id: 'mendez', name: 'María Méndez', pos: 'DEF', photo: 'img/joueurs/mendez.webp?v=2627' },
      { id: 'holmgaard', name: 'Sara Holmgaard', pos: 'DEF', photo: 'img/joueurs/holmgaard.webp?v=2627' },
      { id: 'andersson', name: 'Bella Andersson', pos: 'DEF', photo: 'img/joueurs/andersson.webp?v=2627' },
      { id: 'lakrar', name: 'Maëlle Lakrar', pos: 'DEF', photo: 'img/joueurs/lakrar.webp?v=2627' },
      { id: 'toletti', name: 'Sandie Toletti', pos: 'MID', photo: 'img/joueurs/toletti.webp?v=2627' },
      { id: 'dabritz', name: 'Sara Däbritz', pos: 'MID', photo: 'img/joueurs/dabritz.webp?v=2627' },
      { id: 'irune', name: 'Irune Dorado', short: 'Irune', pos: 'MID', photo: 'img/joueurs/irune.webp?v=2627' },
      { id: 'angeldahl', name: 'Filippa Angeldahl', pos: 'MID', photo: 'img/joueurs/angeldahl.webp?v=2627' },
      { id: 'andreia', name: 'Andreia Jacinto', pos: 'MID', photo: 'img/joueurs/andreia.webp?v=2627' },
      { id: 'elisa', name: 'Elisa Senß', short: 'Elisa', pos: 'MID', photo: 'img/joueurs/elisa.webp?v=2627' },
      { id: 'caruso', name: 'Arianna Caruso', pos: 'MID', photo: 'img/joueurs/caruso.webp?v=2627' },
      { id: 'navarro', name: 'Eva Navarro', pos: 'ATT', photo: 'img/joueurs/navarro.webp?v=2627' },
      { id: 'comendador', name: 'Paula Comendador', pos: 'ATT', photo: 'img/joueurs/comendador.webp?v=2627' },
      { id: 'keukelaar', name: 'Lotte Keukelaar', pos: 'ATT', photo: 'img/joueurs/keukelaar.webp?v=2627' },
      { id: 'bruun', name: 'Signe Bruun', pos: 'ATT', photo: 'img/joueurs/bruun.webp?v=2627' },
      { id: 'athenea', name: 'Athenea del Castillo', short: 'Athenea', pos: 'ATT', photo: 'img/joueurs/athenea.webp?v=2627' },
      { id: 'beerensteyn', name: 'Lineth Beerensteyn', pos: 'ATT', photo: 'img/joueurs/beerensteyn.webp?v=2627' },
      { id: 'schroder', name: 'Felicia Schröder', pos: 'ATT', photo: 'img/joueurs/schroder.webp?v=2627' },
      { id: 'linda', name: 'Linda Caicedo', short: 'Linda', pos: 'ATT', photo: 'img/joueurs/linda.webp?v=2627' },
    ],
    lineup: { GK: ['frohms'], DEF: ['cristobal', 'andersson', 'lakrar', 'navarro'], MID: ['andreia', 'elisa', 'caruso'], ATT: ['linda', 'schroder', 'athenea'] },
  },
  academie: {
    name: 'Académie · Real Madrid Castilla',
    short: 'Académie',
    season: 'Effectif 2026-27',
    feminine: false,
    photo: 'img/equipes/castilla.webp',
    intro: "La Fábrica, l'école du club : ici se forment les talents qui rêvent du Bernabéu.",
    staff: [
      { name: 'Florentino Pérez', role: 'Président du club', photo: 'img/staff/florentino.webp' },
      { name: 'Julián López de Lerma', role: 'Entraîneur', photo: 'img/staff/lopez-de-lerma.webp?v=2627' },
    ],
    players: [
      { id: 'mestre', name: 'Sergio Mestre', pos: 'GK', photo: 'img/joueurs/mestre.webp?v=2627' },
      { id: 'arroyo', name: 'Diego Arroyo', pos: 'GK', photo: 'img/joueurs/arroyo.webp?v=2627' },
      { id: 'javi-navarro', name: 'Javi Navarro', pos: 'GK', photo: 'img/joueurs/javi-navarro.webp?v=2627' },
      { id: 'quetglas', name: 'Ferran Quetglas', pos: 'GK', photo: 'img/joueurs/quetglas.webp?v=2627' },
      { id: 'fortea', name: 'Jesús Fortea', pos: 'DEF', photo: 'img/joueurs/fortea.webp?v=2627' },
      { id: 'aguado', name: 'Diego Aguado', pos: 'DEF', photo: 'img/joueurs/aguado.webp?v=2627' },
      { id: 'rivas', name: 'Mario Rivas', pos: 'DEF', photo: 'img/joueurs/rivas.webp?v=2627' },
      { id: 'joan', name: 'Joan Martínez', short: 'Joan', pos: 'DEF', photo: 'img/joueurs/joan.webp?v=2627' },
      { id: 'naasei', name: 'Óscar Naasei', pos: 'DEF', photo: 'img/joueurs/naasei.webp?v=2627' },
      { id: 'lamini', name: 'Lamini Fati', short: 'Lamini', pos: 'DEF', photo: 'img/joueurs/lamini.webp?v=2627' },
      { id: 'cestero', name: 'Jorge Cestero', pos: 'MID', photo: 'img/joueurs/cestero.webp?v=2627' },
      { id: 'de-llanos', name: 'Hugo de Llanos', short: 'De Llanos', pos: 'MID', photo: 'img/joueurs/de-llanos.webp?v=2627' },
      { id: 'fortuny', name: 'Pol Fortuny', pos: 'MID', photo: 'img/joueurs/fortuny.webp?v=2627' },
      { id: 'leiva', name: 'Álvaro Leiva', pos: 'MID', photo: 'img/joueurs/leiva.webp?v=2627' },
      { id: 'izan', name: 'Izan Regueira', short: 'Izan', pos: 'MID', photo: 'img/joueurs/izan.webp?v=2627' },
      { id: 'cristian-david', name: 'Cristian David Perea', short: 'Cristian David', pos: 'MID', photo: 'img/joueurs/cristian-david.webp?v=2627' },
      { id: 'sergio-martinez', name: 'Sergio Martínez', pos: 'MID', photo: 'img/joueurs/sergio-martinez.webp?v=2627' },
      { id: 'roberto', name: 'Roberto Martín', short: 'Roberto', pos: 'MID', photo: 'img/joueurs/roberto.webp?v=2627' },
      { id: 'mesonero', name: 'Daniel Mesonero', pos: 'MID', photo: 'img/joueurs/mesonero.webp?v=2627' },
      { id: 'yanez', name: 'Daniel Yáñez', pos: 'ATT', photo: 'img/joueurs/yanez.webp?v=2627' },
      { id: 'rachad', name: 'Rachad Fettal', short: 'Rachad', pos: 'ATT', photo: 'img/joueurs/rachad.webp?v=2627' },
      { id: 'angel-carvajal', name: 'Ángel Carvajal', pos: 'ATT', photo: 'img/joueurs/angel-carvajal.webp?v=2627' },
    ],
    lineup: { GK: ['mestre'], DEF: ['aguado', 'rivas', 'naasei', 'fortea'], MID: ['fortuny', 'cestero', 'sergio-martinez'], ATT: ['leiva', 'angel-carvajal', 'yanez'] },
  },
};

/* Palmarès (octobre 2026) */
const HONOURS = [
  { value: 15, label: 'Ligues des champions' },
  { value: 36, label: 'Championnats d’Espagne' },
  { value: 9, label: 'Titres mondiaux' },
  { value: 6, label: 'Supercoupes d’Europe' },
];

const NEWS_CATEGORIES = ['Matchs', 'Équipe', 'Récompenses', 'Sélections'];
/* Actualités, de la plus récente à la plus ancienne */
const NEWS = [
  { id: 'convocation-villarreal', title: 'Real Madrid-Villarreal : la liste des convoqués', cat: 'Matchs', date: '2026-10-09', img: 'img/actus/convocation-villarreal.webp' },
  { id: 'mourinho-villarreal', title: 'Mourinho : « Nous devons prendre les points » contre Villarreal', cat: 'Matchs', date: '2026-10-09', img: 'img/actus/mourinho-villarreal.webp' },
  { id: 'entrainement-villarreal', title: 'Dernier entraînement avant de recevoir Villarreal', cat: 'Équipe', date: '2026-10-09', img: 'img/actus/entrainement-villarreal.webp' },
  { id: 'guler-cinq-etoiles', title: 'Arda Güler, joueur Cinq Étoiles Mahou de septembre', cat: 'Récompenses', date: '2026-10-08', img: 'img/actus/guler-cinq-etoiles.webp' },
  { id: 'mourinho-asencio', title: 'Mourinho rend visite à Asencio après son opération', cat: 'Équipe', date: '2026-10-01', img: 'img/actus/mourinho-asencio.webp' },
  { id: 'selections', title: 'Quatorze madridistas appelés en sélection', cat: 'Sélections', date: '2026-09-21', img: 'img/actus/selections.webp' },
  { id: 'victoire-rayo', title: '4-1 contre le Rayo : large victoire avec un doublé de Mbappé', cat: 'Matchs', date: '2026-09-12', img: 'img/actus/victoire-rayo.webp' },
  { id: 'mbappe-meilleur-buteur', title: 'Mbappé reçoit le trophée de meilleur buteur de la Ligue des champions', cat: 'Récompenses', date: '2026-09-08', img: 'img/actus/mbappe-meilleur-buteur.webp' },
  { id: 'courtois-ballon-or', title: "Courtois en lice pour le trophée du meilleur gardien du Ballon d'Or", cat: 'Récompenses', date: '2026-09-08', img: 'img/actus/courtois-ballon-or.webp' },
];

/* Boutique : les maillots sont dessinés en SVG (voir jerseySvg dans app.js) */
const PRODUCTS = [
  {
    id: 'domicile', type: 'jersey', name: 'Maillot domicile', tag: 'Le classique', price: 90,
    desc: 'Le blanc du Bernabéu, col et poignets vert profond, liseré bordeaux sur les épaules.',
    kit: {
      body: '#f6f6f3', sleeve: '#f6f6f3', collar: '#1e4a40', collarTrim: '#8f2b45', cuff: '#1e4a40', trim: '#1e4a40',
      text: '#1e4a40', inner: '#e2e7e4', neck: 'crew', pattern: 'plain', stripes: { color: '#8f2b45', count: 1, width: 2.6 },
    },
  },
  {
    id: 'exterieur', type: 'jersey', name: 'Maillot extérieur', tag: 'Nouveau', price: 90,
    desc: 'Vert sapin à micro-motif pixel, col bordé de blanc avec encoche en V.',
    kit: {
      body: '#1f4c45', sleeve: '#1f4c45', collar: '#1f4c45', collarEdge: '#e8efe9', cuff: '#1f4c45', cuffEdge: '#e8efe9',
      trim: '#e8efe9', text: '#f2f5f1', inner: '#123630', neck: 'notch', pattern: 'dots', dots: '#7fd3c4',
      stripes: { color: '#e8efe9', count: 1, width: 1.8 },
    },
  },
  {
    id: 'third', type: 'jersey', name: 'Maillot third', tag: 'Édition spéciale', price: 90,
    desc: 'Framboise à facettes géométriques, col en V et poignets crème.',
    kit: {
      body: '#b5466e', sleeve: '#b5466e', collar: '#efe5d6', cuff: '#efe5d6', trim: '#efe5d6',
      text: '#f5ede0', inner: '#8e3254', neck: 'v', pattern: 'facets',
    },
  },
  {
    id: 'gardien', type: 'jersey', name: 'Maillot gardien', tag: 'Dernier rempart', price: 85,
    desc: 'Bleu ciel, panneaux latéraux plus foncés, col indigo et trois bandes jaunes sur les épaules.',
    kit: {
      body: '#38aee0', sleeve: '#38aee0', panel: '#2386c0', collar: '#2c3592', cuff: '#2c3592', trim: '#2c3592',
      text: '#2c3592', inner: '#1f6f9c', neck: 'crew', pattern: 'panels', stripes: { color: '#f3d53a', count: 3, width: 2.2 },
    },
  },
  { id: 'echarpe', type: 'scarf', name: 'Écharpe ¡Hala Madrid!', tag: 'Tribune', price: 25, desc: 'Tricotée en double face, pour chanter tout le match.' },
  { id: 'ballon', type: 'ball', name: 'Ballon d’entraînement', tag: 'Taille 5', price: 30, desc: 'Le ballon pour travailler sa conduite comme à Valdebebas.' },
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const FLOCAGE_PRICE = 15;

/* Joueurs proposés pour le flocage (numéros de la saison 2026-27) */
const FLOCAGE_PLAYERS = [
  { name: 'COURTOIS', number: 1 }, { name: 'ASENCIO', number: 2 }, { name: 'MILITÃO', number: 3 },
  { name: 'HUIJSEN', number: 4 }, { name: 'BELLINGHAM', number: 5 }, { name: 'CAMAVINGA', number: 6 },
  { name: 'VINI JR.', number: 7 }, { name: 'VALVERDE', number: 8 }, { name: 'ENDRICK', number: 9 },
  { name: 'MBAPPÉ', number: 10 }, { name: 'RODRYGO', number: 11 }, { name: 'TRENT', number: 12 },
  { name: 'TCHOUAMÉNI', number: 14 }, { name: 'ARDA GÜLER', number: 15 }, { name: 'KONATÉ', number: 16 },
  { name: 'CUCURELLA', number: 17 }, { name: 'BERNARDO', number: 20 }, { name: 'BRAHIM', number: 21 },
  { name: 'RÜDIGER', number: 22 }, { name: 'DUMFRIES', number: 24 }, { name: 'DIOMANDE', number: 25 },
];

const CLUB = {
  stadium: 'Estadio Santiago Bernabéu',
  address: 'Av. de Concha Espina, 1, 28036 Madrid, Espagne',
  phone: '+34 913 984 300',
  phoneHref: 'tel:+34913984300',
  links: [
    { label: 'Site officiel', handle: 'realmadrid.com', href: 'https://www.realmadrid.com/' },
    { label: 'Instagram', handle: '@realmadrid', href: 'https://www.instagram.com/realmadrid/' },
    { label: 'X (Twitter)', handle: '@realmadrid', href: 'https://x.com/realmadrid' },
    { label: 'Messenger', handle: 'Real Madrid C.F.', href: 'https://m.me/realmadrid' },
  ],
};
