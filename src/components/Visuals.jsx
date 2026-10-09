/* =========================================================
   Visuels dessinés en SVG : maillots, écharpe, ballon, lignes du terrain
   ========================================================= */
import { useId } from 'react';

/* Identifiant unique utilisable dans url(#…) : on retire les caractères spéciaux de useId */
const useSvgId = (prefix) => `${prefix}${useId().replace(/[^a-zA-Z0-9]/g, '')}`;

/* Silhouette (viewBox 300 × 330) : épaules arrondies, manches raglan, bas arrondi.
   Le contour est fermé par l'encolure, différente devant (rond ou V) et derrière. */
const SHIRT_BODY = 'M104 26 C92 30 76 34 64 40 L18 82 Q14 86 17 91 L42 128 Q46 132 51 129 L76 112 C74 165 72 235 74 300 Q150 318 226 300 C228 235 226 165 224 112 L249 129 Q254 132 258 128 L283 91 Q286 86 282 82 L236 40 C224 34 208 30 196 26';
const NECKLINE = { crew: 'C182 50 118 50 104 26 Z', v: 'L150 70 L104 26 Z', back: 'C180 36 120 36 104 26 Z' };
const SLEEVES = [
  'M104 26 C92 30 76 34 64 40 L18 82 Q14 86 17 91 L42 128 Q46 132 51 129 L76 112 C80 80 90 52 104 26 Z',
  'M196 26 C208 30 224 34 236 40 L282 82 Q286 86 283 91 L258 128 Q254 132 249 129 L224 112 C220 80 210 52 196 26 Z',
];
const FACET_SHADES = [['#fff', 0.07], ['#000', 0.04], ['#fff', 0.11], ['#000', 0.07], ['#fff', 0.03]];
const ROUND = { strokeLinecap: 'round', strokeLinejoin: 'round' };

/* Motif propre à chaque maillot (dessiné dans la silhouette, sous les manches) */
function KitPattern({ kit, id }) {
  switch (kit.pattern) {
    // Micro-motif « pixels » sur tout le maillot
    case 'dots': return <rect width="300" height="330" fill={`url(#${id}d)`} />;
    // Facettes géométriques, plus claires ou plus sombres
    case 'facets': {
      const tris = [];
      for (let r = 0; r < 7; r += 1) {
        for (let c = 0; c < 7; c += 1) {
          const x = c * 54 - (r % 2) * 27;
          const y = r * 50;
          const [fa, oa] = FACET_SHADES[(r * 3 + c * 2) % FACET_SHADES.length];
          const [fb, ob] = FACET_SHADES[(r * 2 + c * 3 + 1) % FACET_SHADES.length];
          tris.push(<polygon key={`${r}-${c}a`} points={`${x},${y} ${x + 54},${y} ${x + 27},${y + 50}`} fill={fa} fillOpacity={oa} />);
          tris.push(<polygon key={`${r}-${c}b`} points={`${x + 27},${y + 50} ${x + 81},${y + 50} ${x + 54},${y}`} fill={fb} fillOpacity={ob} />);
        }
      }
      return <g>{tris}</g>;
    }
    // Panneaux latéraux plus foncés, sous les bras
    case 'panels': return (
      <g fill={kit.panel}>
        <path d="M58 96 C84 150 94 232 88 330 L0 330 L0 96 Z" />
        <path d="M242 96 C216 150 206 232 212 330 L300 330 L300 96 Z" />
      </g>
    );
    default: return null;
  }
}

/* Bandes sur les épaules, du col jusqu'à la manche (même tracé, en miroir à droite) */
function ShoulderStripes({ kit }) {
  if (!kit.stripes) return null;
  const { color, count = 1, width = 2.4 } = kit.stripes;
  const lines = Array.from({ length: count }, (_, i) => (
    <path key={i} d="M101 31 C90 35 76 40 65 46 L20 87" transform={`translate(${(i * 3.4).toFixed(1)} ${(i * 3.8).toFixed(1)})`} />
  ));
  return (
    <g fill="none" stroke={color} strokeWidth={width} strokeLinecap="round">
      {lines}
      <g transform="matrix(-1 0 0 1 300 0)">{lines}</g>
    </g>
  );
}

/* Trait doublé d'une bordure (col et poignets bordés de blanc, par exemple) */
function Edged({ d, color, edge, width, round = false }) {
  const extra = round ? ROUND : {};
  return (
    <>
      {edge && <path d={d} fill="none" stroke={edge} strokeWidth={width + 4} {...extra} />}
      <path d={d} fill="none" stroke={color} strokeWidth={width} {...extra} />
    </>
  );
}

function Collar({ kit, back }) {
  if (back) return <Edged d="M106 28 C122 37 178 37 194 28" color={kit.collar} edge={kit.collarEdge} width={7} round />;
  if (kit.neck === 'v') {
    return (
      <>
        <Edged d="M106 28 L150 68 L194 28" color={kit.collar} edge={kit.collarEdge} width={8} round />
        {kit.collarTrim && <path d="M113 34 L150 73 L187 34" fill="none" stroke={kit.collarTrim} strokeWidth="2" {...ROUND} />}
      </>
    );
  }
  // Col rond ; « notch » ajoute la petite encoche en V sous le col
  return (
    <>
      {kit.neck === 'notch' && <polygon points="143,45 157,45 150,58" fill={kit.collarEdge || kit.collar} />}
      <Edged d="M106 28 C120 48 180 48 194 28" color={kit.collar} edge={kit.collarEdge} width={8} round />
      {kit.collarTrim && <path d="M111 35 C125 51 175 51 189 35" fill="none" stroke={kit.collarTrim} strokeWidth="2" />}
    </>
  );
}

export function Jersey({ kit, view = 'front', name = '', number = '' }) {
  const id = useSvgId('j');
  const back = view === 'back';
  const vNeck = kit.neck === 'v';
  const outline = `${SHIRT_BODY} ${back ? NECKLINE.back : NECKLINE[vNeck ? 'v' : 'crew']}`;
  const frontNeck = vNeck ? 'L150 70 L196 26' : 'C118 50 182 50 196 26';
  const label = `Maillot vu de ${back ? 'dos' : 'face'}${name ? `, flocage ${name} ${number}` : ''}`;
  return (
    <svg className="jersey" viewBox="0 0 300 330" role="img" aria-label={label}>
      <defs>
        <clipPath id={`${id}c`}><path d={outline} /></clipPath>
        <clipPath id={`${id}k`}><circle cx="196" cy="100" r="17" /></clipPath>
        <pattern id={`${id}d`} width="7" height="7" patternUnits="userSpaceOnUse">
          <rect width="2.6" height="2.6" fill={kit.dots || '#fff'} fillOpacity=".22" />
          <rect x="3.5" y="3.5" width="1.6" height="1.6" fill={kit.dots || '#fff'} fillOpacity=".08" />
        </pattern>
        <linearGradient id={`${id}g`} x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".16" />
          <stop offset=".5" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".18" />
        </linearGradient>
        <radialGradient id={`${id}r`} cx=".35" cy=".22" r=".75">
          <stop offset="0" stopColor="#fff" stopOpacity=".2" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      {!back && <path d={`M104 26 ${frontNeck} C180 36 120 36 104 26 Z`} fill={kit.inner} />}
      <path d={outline} fill={kit.body} />
      <g clipPath={`url(#${id}c)`}>
        <KitPattern kit={kit} id={id} />
        {(kit.sleeve !== kit.body || kit.pattern === 'panels') && SLEEVES.map((d) => <path key={d} d={d} fill={kit.sleeve} />)}
        {kit.seam && <path d="M104 26 C90 52 80 80 76 112 M196 26 C210 52 220 80 224 112" fill="none" stroke={kit.seam} strokeWidth="2" />}
        <ShoulderStripes kit={kit} />
        <Edged d="M14 88 L45 134 M286 88 L255 134" color={kit.cuff} edge={kit.cuffEdge} width={9} />
        <path d="M76 112 C74 165 72 235 74 300 M224 112 C226 165 228 235 226 300" fill="none" stroke="#000" strokeOpacity=".08" strokeWidth="3" />
        <path d="M100 150 Q150 166 200 150 M96 232 Q150 246 204 232" fill="none" stroke="#000" strokeOpacity=".025" strokeWidth="10" strokeLinecap="round" />
        <rect width="300" height="330" fill={`url(#${id}r)`} />
        <rect width="300" height="330" fill={`url(#${id}g)`} />
      </g>
      <path d={outline} fill="none" stroke="rgba(10,20,40,.22)" strokeWidth="1.5" />
      <Collar kit={kit} back={back} />
      {back ? (
        <>
          <text x="150" y="106" textAnchor="middle" className="j-name" fontSize={name.length > 9 ? 19 : 24} fill={kit.text}>{name}</text>
          <text x="150" y="238" textAnchor="middle" className="j-number" fill={kit.text} stroke={kit.trim} strokeWidth="3">{number}</text>
        </>
      ) : (
        <>
          <circle cx="196" cy="100" r="19" fill="#fff" stroke={kit.trim} strokeWidth="2" />
          <image href="img/crest.webp" x="185" y="86" width="22" height="29" clipPath={`url(#${id}k)`} />
          <text x="150" y="170" textAnchor="middle" className="j-front" fill={kit.text}>HALA MADRID</text>
        </>
      )}
    </svg>
  );
}

export function Scarf() {
  return (
    <svg className="jersey" viewBox="0 0 300 330" role="img" aria-label="Écharpe Hala Madrid">
      <g transform="rotate(-24 150 165)">
        <g stroke="#c9a227" strokeWidth="3">
          {Array.from({ length: 9 }, (_, i) => (
            <g key={i}>
              <line x1="22" y1={128 + i * 9} x2="6" y2={128 + i * 9} />
              <line x1="278" y1={128 + i * 9} x2="294" y2={128 + i * 9} />
            </g>
          ))}
        </g>
        <rect x="22" y="122" width="256" height="86" rx="8" fill="#13254a" />
        <rect x="22" y="122" width="256" height="12" fill="#ffffff" />
        <rect x="22" y="196" width="256" height="12" fill="#ffffff" />
        <rect x="22" y="138" width="256" height="4" fill="#c9a227" />
        <rect x="22" y="188" width="256" height="4" fill="#c9a227" />
        <rect x="22" y="122" width="34" height="86" fill="#ffffff" opacity=".12" />
        <rect x="244" y="122" width="34" height="86" fill="#ffffff" opacity=".12" />
        <text x="150" y="176" textAnchor="middle" className="j-scarf" fill="#ffffff">¡HALA MADRID!</text>
      </g>
    </svg>
  );
}

const pentagon = (x, y, r, rot = -90) => Array.from({ length: 5 }, (_, i) => {
  const a = ((rot + i * 72) * Math.PI) / 180;
  return `${(x + r * Math.cos(a)).toFixed(1)},${(y + r * Math.sin(a)).toFixed(1)}`;
}).join(' ');

export function Ball() {
  const id = useSvgId('ball');
  const cx = 150; const cy = 165; const R = 112;
  const angle = (i) => ((-90 + i * 72) * Math.PI) / 180;
  return (
    <svg className="jersey" viewBox="0 0 300 330" role="img" aria-label="Ballon d'entraînement">
      <defs>
        <clipPath id={`${id}c`}><circle cx={cx} cy={cy} r={R} /></clipPath>
        <radialGradient id={`${id}s`} cx=".35" cy=".3" r=".8"><stop offset="0" stopColor="#fff" /><stop offset="1" stopColor="#d9dee8" /></radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={R} fill={`url(#${id}s)`} stroke="#13254a" strokeWidth="3" />
      <g clipPath={`url(#${id}c)`}>
        <polygon points={pentagon(cx, cy, 36)} fill="#13254a" />
        {Array.from({ length: 5 }, (_, i) => (
          <polygon key={i} points={pentagon(cx + 108 * Math.cos(angle(i)), cy + 108 * Math.sin(angle(i)), 36, -90 + i * 72 + 36)} fill={i % 2 ? '#c9a227' : '#13254a'} />
        ))}
        <g stroke="#13254a" strokeWidth="2.5">
          {Array.from({ length: 5 }, (_, i) => (
            <line key={i} x1={(cx + 36 * Math.cos(angle(i))).toFixed(1)} y1={(cy + 36 * Math.sin(angle(i))).toFixed(1)} x2={(cx + 76 * Math.cos(angle(i))).toFixed(1)} y2={(cy + 76 * Math.sin(angle(i))).toFixed(1)} />
          ))}
        </g>
      </g>
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="#13254a" strokeWidth="3" />
    </svg>
  );
}

export function ProductVisual({ product, ...opts }) {
  if (product.type === 'jersey') return <Jersey kit={product.kit} {...opts} />;
  return product.type === 'scarf' ? <Scarf /> : <Ball />;
}

export function PitchLines() {
  return (
    <svg className="pitch-lines" viewBox="0 0 680 1050" preserveAspectRatio="none" aria-hidden="true">
      <g fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="4">
        <rect x="20" y="20" width="640" height="1010" rx="4" />
        <line x1="20" y1="525" x2="660" y2="525" />
        <circle cx="340" cy="525" r="92" />
        <rect x="138" y="20" width="404" height="165" /><rect x="248" y="20" width="184" height="55" />
        <rect x="138" y="865" width="404" height="165" /><rect x="248" y="975" width="184" height="55" />
        <path d="M262 185 A92 92 0 0 0 418 185" /><path d="M262 865 A92 92 0 0 1 418 865" />
      </g>
      <circle cx="340" cy="525" r="5" fill="rgba(255,255,255,.7)" />
    </svg>
  );
}
