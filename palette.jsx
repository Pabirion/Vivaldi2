// Season palettes + interpolation helpers.
// Seasons indexed 0=winter, 1=spring, 2=summer, 3=autumn (cyclic).

const SEASON_NAMES = ["Winter", "Spring", "Summer", "Autumn"];

const PALETTES = [
  // 0 — Winter
  {
    skyTop:    "#b9c6d2",
    skyMid:    "#d3dae0",
    skyLow:    "#e8e4dc",
    sun:       "#f4ecdc",
    sunGlow:   "rgba(244,236,220,0.35)",
    water:     "#7a8a96",
    waterHi:   "#a3b3bd",
    grass:     "#d8dde2",
    grassHi:   "#eef1f3",
    grassDark: "#9aa6ad",
    soil:      "#5a4d42",
    soilLight: "#7a6b5d",
    rock:      "#766a5e",
    trunk:     "#3a2e25",
    trunkHi:   "#5a4838",
    foliage:   "rgba(255,255,255,0)",   // bare branches
    foliage2:  "rgba(255,255,255,0)",
    snow:      "#f6f3ec",
    bench:     "#5b4632",
    benchHi:   "#7a5e44",
    particle:  "#ffffff",
    particleAlt: "#e8eef3",
    bird:      "#ffffff",
    fog:       "rgba(220,225,228,0.35)",
  },
  // 1 — Spring
  {
    skyTop:    "#a9c7da",
    skyMid:    "#dde9ed",
    skyLow:    "#f5e3df",
    sun:       "#fff4d8",
    sunGlow:   "rgba(255,224,188,0.45)",
    water:     "#6f9bb0",
    waterHi:   "#a8c4d0",
    grass:     "#a3c768",
    grassHi:   "#c5dd86",
    grassDark: "#6f9c46",
    soil:      "#5a3f2a",
    soilLight: "#856349",
    rock:      "#8a7d6e",
    trunk:     "#3f2e22",
    trunkHi:   "#624936",
    foliage:   "#e8a8bd",   // soft warm cherry blossom
    foliage2:  "#d68196",   // deeper rose accent
    snow:      "rgba(246,243,236,0)",
    bench:     "#5b4632",
    benchHi:   "#7a5e44",
    particle:  "#f7c8d6",   // petals
    particleAlt: "#fce3eb",
    bird:      "#2a2a2a",
    fog:       "rgba(220,230,225,0.15)",
  },
  // 2 — Summer
  {
    skyTop:    "#5fa8d6",
    skyMid:    "#8ec5e3",
    skyLow:    "#dfeef5",
    sun:       "#ffe79a",
    sunGlow:   "rgba(255,221,130,0.5)",
    water:     "#3d7e9a",
    waterHi:   "#82b3c6",
    grass:     "#5e9c3a",
    grassHi:   "#84bb5e",
    grassDark: "#3f7424",
    soil:      "#5a3f2a",
    soilLight: "#856349",
    rock:      "#8e8268",
    trunk:     "#3a2820",
    trunkHi:   "#5a3e2c",
    foliage:   "#4a8f5a",   // rich summer leaf-green, harmonizes with grass
    foliage2:  "#6cb074",   // sunlit top-leaf accent
    snow:      "rgba(246,243,236,0)",
    bench:     "#5b4632",
    benchHi:   "#7a5e44",
    particle:  "#f6e08a",   // pollen / fireflies
    particleAlt: "#fff3b8",
    bird:      "#1f1f1f",
    fog:       "rgba(255,240,200,0.0)",
  },
  // 3 — Autumn
  {
    skyTop:    "#c79862",
    skyMid:    "#e3b884",
    skyLow:    "#f1d5b0",
    sun:       "#ffd28a",
    sunGlow:   "rgba(255,180,110,0.5)",
    water:     "#6b6855",
    waterHi:   "#a39c7e",
    grass:     "#9a7a3a",
    grassHi:   "#bf9c54",
    grassDark: "#6e5523",
    soil:      "#4e3520",
    soilLight: "#75503a",
    rock:      "#8a7558",
    trunk:     "#36241a",
    trunkHi:   "#553825",
    foliage:   "#b85025",   // burnt orange, harmonizes with sky
    foliage2:  "#e09040",   // golden sunlit highlight
    snow:      "rgba(246,243,236,0)",
    bench:     "#4f3c2a",
    benchHi:   "#6e533a",
    particle:  "#d97142",
    particleAlt: "#e8a55a",
    bird:      "#1f1f1f",
    fog:       "rgba(220,180,140,0.18)",
  },
];

// hex/rgba parse + mix
function parseColor(c) {
  if (c.startsWith("rgba")) {
    const m = c.match(/rgba?\(([^)]+)\)/i);
    const [r, g, b, a = 1] = m[1].split(",").map((s) => parseFloat(s));
    return { r, g, b, a };
  }
  if (c.startsWith("rgb")) {
    const m = c.match(/rgba?\(([^)]+)\)/i);
    const [r, g, b] = m[1].split(",").map((s) => parseFloat(s));
    return { r, g, b, a: 1 };
  }
  // hex
  let h = c.replace("#", "");
  if (h.length === 3) h = h.split("").map((x) => x + x).join("");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return { r, g, b, a: 1 };
}
function mixColor(a, b, t) {
  const A = parseColor(a), B = parseColor(b);
  const r = Math.round(A.r + (B.r - A.r) * t);
  const g = Math.round(A.g + (B.g - A.g) * t);
  const bl = Math.round(A.b + (B.b - A.b) * t);
  const al = A.a + (B.a - A.a) * t;
  return `rgba(${r},${g},${bl},${al.toFixed(3)})`;
}

// season is a float [0, 4) — wraps. Returns interpolated palette.
function getPalette(season) {
  const s = ((season % 4) + 4) % 4;
  const i = Math.floor(s);
  const t = s - i;
  const A = PALETTES[i];
  const B = PALETTES[(i + 1) % 4];
  const out = {};
  for (const k of Object.keys(A)) out[k] = mixColor(A[k], B[k], t);
  return out;
}

// also expose blend factors for each season at a given continuous value
function seasonWeights(season) {
  const s = ((season % 4) + 4) % 4;
  const w = [0, 0, 0, 0];
  const i = Math.floor(s);
  const t = s - i;
  w[i] = 1 - t;
  w[(i + 1) % 4] = t;
  return w;
}

function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

window.SEASON_NAMES = SEASON_NAMES;
window.getPalette = getPalette;
window.seasonWeights = seasonWeights;
window.lerp = lerp;
window.clamp = clamp;
window.mixColor = mixColor;
