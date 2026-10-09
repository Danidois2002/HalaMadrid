/* =========================================================
   Données du site (effectifs 2023-24 du projet d'origine)
   ========================================================= */

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
    season: 'Effectif 2023-24',
    feminine: false,
    photo: 'img/equipes/senior.webp',
    intro: "Quinze fois championne d'Europe, l'équipe première porte l'héritage du meilleur club du XXᵉ siècle.",
    staff: [
      { name: 'Florentino Pérez', role: 'Président du club', photo: 'img/staff/florentino.webp' },
      { name: 'Carlo Ancelotti', role: 'Entraîneur', photo: 'img/staff/ancelotti.webp' },
    ],
    players: [
      { id: 'courtois', name: 'Thibaut Courtois', pos: 'GK', photo: 'img/joueurs/courtois.webp' },
      { id: 'kepa', name: 'Kepa Arrizabalaga', short: 'Kepa', pos: 'GK', photo: 'img/joueurs/kepa.webp' },
      { id: 'carvajal', name: 'Daniel Carvajal', pos: 'DEF', photo: 'img/joueurs/carvajal.webp' },
      { id: 'militao', name: 'Éder Militão', pos: 'DEF', photo: 'img/joueurs/militao.webp' },
      { id: 'alaba', name: 'David Alaba', pos: 'DEF', photo: 'img/joueurs/alaba.webp' },
      { id: 'rudiger', name: 'Antonio Rüdiger', pos: 'DEF', photo: 'img/joueurs/rudiger.webp' },
      { id: 'mendy', name: 'Ferland Mendy', pos: 'DEF', photo: 'img/joueurs/mendy.webp' },
      { id: 'camavinga', name: 'Eduardo Camavinga', pos: 'MID', photo: 'img/joueurs/camavinga.webp' },
      { id: 'modric', name: 'Luka Modrić', pos: 'MID', photo: 'img/joueurs/modric.webp' },
      { id: 'kroos', name: 'Toni Kroos', pos: 'MID', photo: 'img/joueurs/kroos.webp' },
      { id: 'tchouameni', name: 'Aurélien Tchouaméni', pos: 'MID', photo: 'img/joueurs/tchouameni.webp' },
      { id: 'valverde', name: 'Federico Valverde', pos: 'MID', photo: 'img/joueurs/valverde.webp' },
      { id: 'bellingham', name: 'Jude Bellingham', pos: 'ATT', photo: 'img/joueurs/bellingham.webp' },
      { id: 'rodrygo', name: 'Rodrygo Goes', short: 'Rodrygo', pos: 'ATT', photo: 'img/joueurs/rodrygo.webp' },
      { id: 'vinicius', name: 'Vinícius Jr.', short: 'Vinícius', pos: 'ATT', photo: 'img/joueurs/vinicius.webp' },
    ],
    // Onze type en 4-3-3 (identifiants des joueurs, de l'arrière vers l'avant)
    lineup: { GK: ['courtois'], DEF: ['carvajal', 'militao', 'rudiger', 'mendy'], MID: ['valverde', 'tchouameni', 'kroos'], ATT: ['rodrygo', 'bellingham', 'vinicius'] },
  },
  feminine: {
    name: 'Équipe première féminine',
    short: 'Féminine',
    season: 'Effectif 2023-24',
    feminine: true,
    photo: 'img/equipes/seniorfemme.webp',
    intro: "Une équipe ambitieuse qui fait grandir le football féminin sous le maillot blanc.",
    staff: [
      { name: 'Florentino Pérez', role: 'Président du club', photo: 'img/staff/florentino.webp' },
      { name: 'Alberto Toril', role: 'Entraîneur', photo: 'img/staff/alberto.webp' },
    ],
    players: [
      { id: 'misa', name: 'Misa Rodríguez', short: 'Misa', pos: 'GK', photo: 'img/joueurs/misa.webp' },
      { id: 'mylene', name: 'Mylène Chavas', pos: 'GK', photo: 'img/joueurs/mylene.webp' },
      { id: 'kenti', name: 'Kenti Robles', pos: 'DEF', photo: 'img/joueurs/kenti.webp' },
      { id: 'rocui', name: 'Rocui Luna', pos: 'DEF', photo: 'img/joueurs/rocui.webp' },
      { id: 'ivana', name: 'Ivana Sanz', pos: 'DEF', photo: 'img/joueurs/ivana.webp' },
      { id: 'kathellen', name: 'Kathellen Sousa', pos: 'DEF', photo: 'img/joueurs/kathellen.webp' },
      { id: 'sofia', name: 'Sofia Svana', pos: 'DEF', photo: 'img/joueurs/sofia.webp' },
      { id: 'teresa', name: 'Teresa Abelleira', pos: 'MID', photo: 'img/joueurs/teresa.webp' },
      { id: 'sandie', name: 'Sandie Toletti', pos: 'MID', photo: 'img/joueurs/sandie.webp' },
      { id: 'maite', name: 'Maite Areta', pos: 'MID', photo: 'img/joueurs/maite.webp' },
      { id: 'caroline', name: 'Caroline Weir', pos: 'MID', photo: 'img/joueurs/caroline.webp' },
      { id: 'athenea', name: 'Athenea del Castillo', short: 'Athenea', pos: 'ATT', photo: 'img/joueurs/athenea.webp' },
      { id: 'naomie', name: 'Naomie Feller', pos: 'ATT', photo: 'img/joueurs/naomie.webp' },
      { id: 'carla', name: 'Carla Camacho', pos: 'ATT', photo: 'img/joueurs/carla.webp' },
      { id: 'hayley', name: 'Hayley Raso', pos: 'ATT', photo: 'img/joueurs/hayley.webp' },
    ],
    lineup: { GK: ['misa'], DEF: ['kenti', 'ivana', 'kathellen', 'sofia'], MID: ['teresa', 'sandie', 'caroline'], ATT: ['athenea', 'naomie', 'hayley'] },
  },
  academie: {
    name: 'Académie · Real Madrid Castilla',
    short: 'Académie',
    season: 'Effectif 2023-24',
    feminine: false,
    photo: 'img/equipes/castilla.webp',
    intro: "La Fábrica, l'école du club : ici se forment les talents qui rêvent du Bernabéu.",
    staff: [
      { name: 'Florentino Pérez', role: 'Président du club', photo: 'img/staff/florentino.webp' },
      { name: 'Raúl González', role: 'Entraîneur', photo: 'img/staff/raul.webp' },
    ],
    players: [
      { id: 'conchello', name: 'Luca Conchello', pos: 'GK' },
      { id: 'pinero', name: 'Diego Pinero', pos: 'GK' },
      { id: 'antonin', name: 'Marvelous Antonin', pos: 'DEF' },
      { id: 'augusto', name: 'Vinicius Augusto', pos: 'DEF' },
      { id: 'carillo', name: 'Alvaro Carillo', pos: 'DEF' },
      { id: 'herrera', name: 'Lorenzo Herrera', pos: 'DEF' },
      { id: 'pontorreal', name: 'Edgar Pontorreal', pos: 'DEF' },
      { id: 'angel', name: 'Manuel Angel', pos: 'MID' },
      { id: 'camona', name: 'Peter Camona', pos: 'MID' },
      { id: 'fernandez', name: 'Theo Fernandez', pos: 'MID' },
      { id: 'paz', name: 'Nico Paz', pos: 'MID' },
      { id: 'torres', name: 'Gonzalo Torres', pos: 'MID' },
      { id: 'bravo', name: 'Iker Bravo', pos: 'ATT' },
      { id: 'lopez', name: 'Noel Lopez', pos: 'ATT' },
      { id: 'manoz', name: 'Alvaro Manoz', pos: 'ATT' },
    ],
    lineup: { GK: ['conchello'], DEF: ['antonin', 'augusto', 'carillo', 'herrera'], MID: ['paz', 'fernandez', 'angel'], ATT: ['bravo', 'lopez', 'manoz'] },
  },
};

/* Palmarès (fin 2024) */
const HONOURS = [
  { value: 15, label: 'Ligues des champions' },
  { value: 36, label: 'Championnats d’Espagne' },
  { value: 9, label: 'Titres mondiaux' },
  { value: 6, label: 'Supercoupes d’Europe' },
];

const NEWS_CATEGORIES = ['Transferts', 'Équipe', 'Matchs', 'Féminine', 'Histoire'];
const NEWS = [
  { id: 'mbappe', title: 'Mbappé au Real Madrid ?', cat: 'Transferts', img: 'img/actus/mbappe.webp' },
  { id: 'alaba', title: 'Alaba blessé pour la saison', cat: 'Équipe', img: 'img/actus/alaba.webp' },
  { id: 'ronaldo', title: 'En souvenir du but de Ronaldo', cat: 'Histoire', img: 'img/actus/ronaldo.webp' },
  { id: 'feminine', title: "L'équipe féminine remporte la coupe", cat: 'Féminine', img: 'img/actus/femme.webp' },
  { id: 'alaves', title: 'Real Madrid – Alavés', cat: 'Matchs', img: 'img/actus/match.webp' },
  { id: 'modric', title: 'Modrić en grande forme', cat: 'Équipe', img: 'img/actus/modric.webp' },
  { id: 'osimhen', title: 'Osimhen vers le Real Madrid ?', cat: 'Transferts', img: 'img/actus/osimhen.webp' },
  { id: 'endrick', title: 'Endrick a signé !', cat: 'Transferts', img: 'img/actus/endrick.webp' },
  { id: 'rodrygo', title: 'Rodrygo marque deux fois face à Valence', cat: 'Matchs', img: 'img/actus/rodrygo.webp' },
];

/* Boutique : les maillots sont dessinés en SVG (voir jerseySvg dans app.js) */
const PRODUCTS = [
  {
    id: 'domicile', type: 'jersey', name: 'Maillot domicile', tag: 'Le classique', price: 90,
    desc: 'Le blanc immaculé du Bernabéu, liseré or et col marine.',
    kit: { body: '#fdfdfd', sleeve: '#ffffff', trim: '#c9a227', collar: '#13254a', text: '#13254a', inner: '#e3e7ef', neck: 'crew', pattern: 'pin' },
  },
  {
    id: 'exterieur', type: 'jersey', name: 'Maillot extérieur', tag: 'Nouveau', price: 90,
    desc: 'Bleu nuit profond et détails dorés pour les grands déplacements.',
    kit: { body: '#152b57', sleeve: '#0f2148', trim: '#e2bd55', collar: '#e2bd55', text: '#ffffff', inner: '#0a1630', neck: 'v', pattern: 'diag' },
  },
  {
    id: 'third', type: 'jersey', name: 'Maillot third', tag: 'Édition spéciale', price: 90,
    desc: 'Le violet historique du club, réinterprété avec des finitions or.',
    kit: { body: '#4b2a7a', sleeve: '#3b2063', trim: '#e2bd55', collar: '#e2bd55', text: '#ffffff', inner: '#2a1647', neck: 'crew', pattern: 'fade' },
  },
  {
    id: 'gardien', type: 'jersey', name: 'Maillot gardien', tag: 'Dernier rempart', price: 85,
    desc: 'Vert intense, coupe ajustée : la tenue des gardiens merengues.',
    kit: { body: '#1f7253', sleeve: '#175a41', trim: '#a6ecc9', collar: '#0f3b2b', text: '#ffffff', inner: '#0f3b2b', neck: 'crew', pattern: 'bands' },
  },
  { id: 'echarpe', type: 'scarf', name: 'Écharpe ¡Hala Madrid!', tag: 'Tribune', price: 25, desc: 'Tricotée en double face, pour chanter tout le match.' },
  { id: 'ballon', type: 'ball', name: 'Ballon d’entraînement', tag: 'Taille 5', price: 30, desc: 'Le ballon pour travailler sa conduite comme à Valdebebas.' },
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const FLOCAGE_PRICE = 15;

/* Joueurs proposés pour le flocage (numéros de la saison 2023-24) */
const FLOCAGE_PLAYERS = [
  { name: 'COURTOIS', number: 1 }, { name: 'CARVAJAL', number: 2 }, { name: 'MILITÃO', number: 3 },
  { name: 'ALABA', number: 4 }, { name: 'BELLINGHAM', number: 5 }, { name: 'VINI JR.', number: 7 },
  { name: 'KROOS', number: 8 }, { name: 'MODRIĆ', number: 10 }, { name: 'RODRYGO', number: 11 },
  { name: 'CAMAVINGA', number: 12 }, { name: 'VALVERDE', number: 15 }, { name: 'TCHOUAMÉNI', number: 18 },
  { name: 'RÜDIGER', number: 22 }, { name: 'MENDY', number: 23 }, { name: 'KEPA', number: 25 },
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
