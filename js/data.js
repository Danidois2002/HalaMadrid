/* =========================================================
   Données du site : saison 2026-27 (effectifs, staff et actualités d'après realmadrid.com, octobre 2026)
   ========================================================= */

/* Version des données de départ : à changer quand on modifie ce fichier, pour que l'API les recharge */
const DATA_VERSION = '2026-27.1';

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
      { name: 'José Mourinho', role: 'Entraîneur', photo: 'img/staff/mourinho.webp' },
    ],
    players: [
      { id: 'courtois', name: 'Thibaut Courtois', pos: 'GK', photo: 'img/joueurs/courtois.webp' },
      { id: 'lunin', name: 'Andriy Lunin', pos: 'GK', photo: 'img/joueurs/lunin.webp' },
      { id: 'asencio', name: 'Raúl Asencio', pos: 'DEF', photo: 'img/joueurs/asencio.webp' },
      { id: 'militao', name: 'Éder Militão', pos: 'DEF', photo: 'img/joueurs/militao.webp' },
      { id: 'huijsen', name: 'Dean Huijsen', pos: 'DEF', photo: 'img/joueurs/huijsen.webp' },
      { id: 'trent', name: 'Trent Alexander-Arnold', short: 'Trent', pos: 'DEF', photo: 'img/joueurs/trent.webp' },
      { id: 'konate', name: 'Ibrahima Konaté', pos: 'DEF', photo: 'img/joueurs/konate.webp' },
      { id: 'cucurella', name: 'Marc Cucurella', pos: 'DEF', photo: 'img/joueurs/cucurella.webp' },
      { id: 'rudiger', name: 'Antonio Rüdiger', pos: 'DEF', photo: 'img/joueurs/rudiger.webp' },
      { id: 'mendy', name: 'Ferland Mendy', pos: 'DEF', photo: 'img/joueurs/mendy.webp' },
      { id: 'dumfries', name: 'Denzel Dumfries', pos: 'DEF', photo: 'img/joueurs/dumfries.webp' },
      { id: 'bellingham', name: 'Jude Bellingham', pos: 'MID', photo: 'img/joueurs/bellingham.webp' },
      { id: 'camavinga', name: 'Eduardo Camavinga', pos: 'MID', photo: 'img/joueurs/camavinga.webp' },
      { id: 'valverde', name: 'Federico Valverde', pos: 'MID', photo: 'img/joueurs/valverde.webp' },
      { id: 'tchouameni', name: 'Aurélien Tchouaméni', pos: 'MID', photo: 'img/joueurs/tchouameni.webp' },
      { id: 'guler', name: 'Arda Güler', pos: 'MID', photo: 'img/joueurs/guler.webp' },
      { id: 'bernardo', name: 'Bernardo Silva', short: 'Bernardo', pos: 'MID', photo: 'img/joueurs/bernardo.webp' },
      { id: 'thiago', name: 'Thiago Pitarch', short: 'Thiago', pos: 'MID', photo: 'img/joueurs/thiago.webp' },
      { id: 'brahim', name: 'Brahim Díaz', short: 'Brahim', pos: 'ATT', photo: 'img/joueurs/brahim.webp' },
      { id: 'vinicius', name: 'Vinícius Jr.', short: 'Vinícius', pos: 'ATT', photo: 'img/joueurs/vinicius.webp' },
      { id: 'endrick', name: 'Endrick', pos: 'ATT', photo: 'img/joueurs/endrick.webp' },
      { id: 'mbappe', name: 'Kylian Mbappé', pos: 'ATT', photo: 'img/joueurs/mbappe.webp' },
      { id: 'rodrygo', name: 'Rodrygo Goes', short: 'Rodrygo', pos: 'ATT', photo: 'img/joueurs/rodrygo.webp' },
      { id: 'espi', name: 'Carlos Espí', pos: 'ATT', photo: 'img/joueurs/espi.webp' },
      { id: 'diomande', name: 'Yan Diomande', pos: 'ATT', photo: 'img/joueurs/diomande.webp' },
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
      { name: 'Pau Quesada', role: 'Entraîneur', photo: 'img/staff/quesada.webp' },
    ],
    players: [
      { id: 'frohms', name: 'Merle Frohms', pos: 'GK', photo: 'img/joueurs/frohms.webp' },
      { id: 'laia', name: 'Laia López', short: 'Laia', pos: 'GK', photo: 'img/joueurs/laia.webp' },
      { id: 'noe', name: 'Noemí Bejarano', short: 'Noe', pos: 'DEF', photo: 'img/joueurs/noe.webp' },
      { id: 'levels', name: 'Janou Levels', pos: 'DEF', photo: 'img/joueurs/levels.webp' },
      { id: 'cristobal', name: 'Silvia Cristóbal', pos: 'DEF', photo: 'img/joueurs/cristobal.webp' },
      { id: 'mendez', name: 'María Méndez', pos: 'DEF', photo: 'img/joueurs/mendez.webp' },
      { id: 'holmgaard', name: 'Sara Holmgaard', pos: 'DEF', photo: 'img/joueurs/holmgaard.webp' },
      { id: 'andersson', name: 'Bella Andersson', pos: 'DEF', photo: 'img/joueurs/andersson.webp' },
      { id: 'lakrar', name: 'Maëlle Lakrar', pos: 'DEF', photo: 'img/joueurs/lakrar.webp' },
      { id: 'toletti', name: 'Sandie Toletti', pos: 'MID', photo: 'img/joueurs/toletti.webp' },
      { id: 'dabritz', name: 'Sara Däbritz', pos: 'MID', photo: 'img/joueurs/dabritz.webp' },
      { id: 'irune', name: 'Irune Dorado', short: 'Irune', pos: 'MID', photo: 'img/joueurs/irune.webp' },
      { id: 'angeldahl', name: 'Filippa Angeldahl', pos: 'MID', photo: 'img/joueurs/angeldahl.webp' },
      { id: 'andreia', name: 'Andreia Jacinto', pos: 'MID', photo: 'img/joueurs/andreia.webp' },
      { id: 'elisa', name: 'Elisa Senß', short: 'Elisa', pos: 'MID', photo: 'img/joueurs/elisa.webp' },
      { id: 'caruso', name: 'Arianna Caruso', pos: 'MID', photo: 'img/joueurs/caruso.webp' },
      { id: 'navarro', name: 'Eva Navarro', pos: 'ATT', photo: 'img/joueurs/navarro.webp' },
      { id: 'comendador', name: 'Paula Comendador', pos: 'ATT', photo: 'img/joueurs/comendador.webp' },
      { id: 'keukelaar', name: 'Lotte Keukelaar', pos: 'ATT', photo: 'img/joueurs/keukelaar.webp' },
      { id: 'bruun', name: 'Signe Bruun', pos: 'ATT', photo: 'img/joueurs/bruun.webp' },
      { id: 'athenea', name: 'Athenea del Castillo', short: 'Athenea', pos: 'ATT', photo: 'img/joueurs/athenea.webp' },
      { id: 'beerensteyn', name: 'Lineth Beerensteyn', pos: 'ATT', photo: 'img/joueurs/beerensteyn.webp' },
      { id: 'schroder', name: 'Felicia Schröder', pos: 'ATT', photo: 'img/joueurs/schroder.webp' },
      { id: 'linda', name: 'Linda Caicedo', short: 'Linda', pos: 'ATT', photo: 'img/joueurs/linda.webp' },
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
      { name: 'Julián López de Lerma', role: 'Entraîneur', photo: 'img/staff/lopez-de-lerma.webp' },
    ],
    players: [
      { id: 'mestre', name: 'Sergio Mestre', pos: 'GK', photo: 'img/joueurs/mestre.webp' },
      { id: 'arroyo', name: 'Diego Arroyo', pos: 'GK', photo: 'img/joueurs/arroyo.webp' },
      { id: 'javi-navarro', name: 'Javi Navarro', pos: 'GK', photo: 'img/joueurs/javi-navarro.webp' },
      { id: 'quetglas', name: 'Ferran Quetglas', pos: 'GK', photo: 'img/joueurs/quetglas.webp' },
      { id: 'fortea', name: 'Jesús Fortea', pos: 'DEF', photo: 'img/joueurs/fortea.webp' },
      { id: 'aguado', name: 'Diego Aguado', pos: 'DEF', photo: 'img/joueurs/aguado.webp' },
      { id: 'rivas', name: 'Mario Rivas', pos: 'DEF', photo: 'img/joueurs/rivas.webp' },
      { id: 'joan', name: 'Joan Martínez', short: 'Joan', pos: 'DEF', photo: 'img/joueurs/joan.webp' },
      { id: 'naasei', name: 'Óscar Naasei', pos: 'DEF', photo: 'img/joueurs/naasei.webp' },
      { id: 'lamini', name: 'Lamini Fati', short: 'Lamini', pos: 'DEF', photo: 'img/joueurs/lamini.webp' },
      { id: 'cestero', name: 'Jorge Cestero', pos: 'MID', photo: 'img/joueurs/cestero.webp' },
      { id: 'de-llanos', name: 'Hugo de Llanos', short: 'De Llanos', pos: 'MID', photo: 'img/joueurs/de-llanos.webp' },
      { id: 'fortuny', name: 'Pol Fortuny', pos: 'MID', photo: 'img/joueurs/fortuny.webp' },
      { id: 'leiva', name: 'Álvaro Leiva', pos: 'MID', photo: 'img/joueurs/leiva.webp' },
      { id: 'izan', name: 'Izan Regueira', short: 'Izan', pos: 'MID', photo: 'img/joueurs/izan.webp' },
      { id: 'cristian-david', name: 'Cristian David Perea', short: 'Cristian David', pos: 'MID', photo: 'img/joueurs/cristian-david.webp' },
      { id: 'sergio-martinez', name: 'Sergio Martínez', pos: 'MID', photo: 'img/joueurs/sergio-martinez.webp' },
      { id: 'roberto', name: 'Roberto Martín', short: 'Roberto', pos: 'MID', photo: 'img/joueurs/roberto.webp' },
      { id: 'mesonero', name: 'Daniel Mesonero', pos: 'MID', photo: 'img/joueurs/mesonero.webp' },
      { id: 'yanez', name: 'Daniel Yáñez', pos: 'ATT', photo: 'img/joueurs/yanez.webp' },
      { id: 'rachad', name: 'Rachad Fettal', short: 'Rachad', pos: 'ATT', photo: 'img/joueurs/rachad.webp' },
      { id: 'angel-carvajal', name: 'Ángel Carvajal', pos: 'ATT', photo: 'img/joueurs/angel-carvajal.webp' },
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
