// Tree component — branches always present, foliage fades by season.
// Uses deterministic pseudo-random branch layout.

const { useMemo } = React;

function rng(seed) {
  let s = seed | 0;
  return () => {
    s = s * 1664525 + 1013904223 | 0;
    return (s >>> 0) % 100000 / 100000;
  };
}

// Build a recursive branch path starting at (x,y) going at angle (rad), length L
function buildBranches(seed = 7) {
  const rand = rng(seed);
  const branches = []; // {x1,y1,x2,y2,w}
  const blobs = []; // {x,y,r} foliage cluster centers

  function grow(x, y, ang, len, w, depth) {
    const x2 = x + Math.cos(ang) * len;
    const y2 = y + Math.sin(ang) * len;
    branches.push({ x1: x, y1: y, x2, y2, w });
    if (depth <= 0 || len < 6) {
      // leaf cluster
      blobs.push({ x: x2, y: y2, r: 22 + rand() * 18 });
      return;
    }
    // 2-3 children
    const n = 2 + (rand() > 0.55 ? 1 : 0);
    for (let i = 0; i < n; i++) {
      const spread = 0.45 + rand() * 0.55;
      const dir = i === 0 ? -1 : i === 1 ? 1 : (rand() - 0.5) * 2;
      const childAng = ang + dir * spread + (rand() - 0.5) * 0.2;
      const childLen = len * (0.62 + rand() * 0.18);
      const childW = Math.max(1, w * (0.62 + rand() * 0.1));
      grow(x2, y2, childAng, childLen, childW, depth - 1);
    }
  }

  // trunk: starts at base, slight curve via 2 segments
  const baseX = 0,baseY = 0;
  // use grow but trunk is one segment, then split
  grow(baseX, baseY, -Math.PI / 2 + 0.05, 70, 12, 4);
  return { branches, blobs };
}

function Tree({ pal, season, wind, t, time = 0.5, x = 560, y = 588, scale = 1.1 }) {
  const data = useMemo(() => buildBranches(7), []);

  // wind sway: gentle continuous sin
  const sway = Math.sin(t * 0.0008) * 2 * (0.5 + wind);

  // Hard-switch foliage: present unless winter is dominant.
  const w = window.seasonWeights(season);
  const foliageOpacity = w[0] >= 0.5 ? 0 : 1;

  // Snow on branches snaps on in winter rather than fading.
  const snowOp = w[0] >= 0.5 ? 1 : 0;

  // Time-of-day tinting (mirrors sky logic): morning pink, evening violet, night cool blue
  let nightT = 0;
  if (time < 0.05) nightT = (0.05 - time) / 0.05;
  if (time > 0.95) nightT = (time - 0.95) / 0.05;
  nightT = Math.min(1, nightT);
  const morningT = Math.max(0, 1 - Math.abs(time - 0.28) / 0.18);
  const eveningT = Math.max(0, 1 - Math.abs(time - 0.82) / 0.18);

  const tintFoliage = (c) => {
    let out = c;
    out = window.mixColor(out, "#f4c0d0", morningT * 0.35);   // soft pink wash
    out = window.mixColor(out, "#5a3870", eveningT * 0.45);   // deep violet wash
    out = window.mixColor(out, "#1a2238", nightT * 0.6);      // cool night
    return out;
  };
  const tintTrunk = (c) => {
    let out = c;
    out = window.mixColor(out, "#7a4458", morningT * 0.25);
    out = window.mixColor(out, "#3a2240", eveningT * 0.4);
    out = window.mixColor(out, "#10182a", nightT * 0.55);
    return out;
  };

  const trunkColor = tintTrunk(pal.trunk);
  const trunkHiColor = tintTrunk(pal.trunkHi);
  const foliageColor = tintFoliage(pal.foliage);
  const foliage2Color = tintFoliage(pal.foliage2);

  return (
    <g transform={`translate(${x} ${y}) scale(${scale}) rotate(${sway * 0.3})`}>
      {/* shadow on ground under tree */}
      <ellipse cx="0" cy="8" rx="90" ry="10" fill="rgba(0,0,0,0.18)" />

      {/* branches */}
      <g>
        {data.branches.map((b, i) =>
        <line
          key={i}
          x1={b.x1} y1={b.y1} x2={b.x2} y2={b.y2}
          stroke={trunkColor}
          strokeWidth={b.w}
          strokeLinecap="round" />

        )}
        {/* highlight on trunk */}
        {data.branches.slice(0, 3).map((b, i) =>
        <line
          key={`hl-${i}`}
          x1={b.x1 - b.w * 0.25} y1={b.y1}
          x2={b.x2 - b.w * 0.25} y2={b.y2}
          stroke={trunkHiColor}
          strokeWidth={Math.max(1, b.w * 0.3)}
          strokeLinecap="round"
          opacity="0.7" />

        )}
      </g>

      {/* snow on branches (winter only) */}
      {snowOp > 0.01 &&
      <g opacity={snowOp}>
          {data.branches.map((b, i) => {
          // small snow caps on top side of horizontal-ish branches
          const dx = b.x2 - b.x1,dy = b.y2 - b.y1;
          const len = Math.hypot(dx, dy);
          const horiz = Math.abs(dy / (len || 1));
          if (horiz > 0.6) return null;
          const mx = (b.x1 + b.x2) / 2;
          const my = (b.y1 + b.y2) / 2 - b.w * 0.6;
          return (
            <ellipse
              key={`sn-${i}`}
              cx={mx} cy={my}
              rx={len * 0.45} ry={b.w * 0.6 + 1.2}
              fill="#f6f3ec" />);


        })}
        </g>
      }

      {/* foliage */}
      {foliageOpacity > 0.01 &&
      <g opacity={foliageOpacity}>
          {data.blobs.map((b, i) =>
        <g key={i}>
              <circle cx={b.x} cy={b.y} r={b.r} fill={foliageColor} />
              <circle cx={b.x - b.r * 0.25} cy={b.y - b.r * 0.3} r={b.r * 0.55} fill={foliage2Color} />
            </g>
        )}
        </g>
      }
    </g>);

}

window.Tree = Tree;