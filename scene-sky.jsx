// Sky, sun/moon, distant clouds.

function Sky({ pal, time, season, t = 0 }) {
  // Clouds always drift to the right and loop at a constant, gentle pace —
  // independent of wind strength.
  const speed = 0.015;
  const wrap = 2800; // total travel before wrapping back to the left
  const cloudDrift = (t * speed) % wrap - 1300;
  // Second, smaller cloud — slightly faster, offset on both axes so it never
  // sits directly above the main cloud.
  const speed2 = 0.022;
  const wrap2 = 2400;
  const cloud2Drift = (t * speed2) % wrap2 - 1100;
  const starDrift = Math.sin(t * 0.00005) * 20;
  // time: 0..1 (0=dawn, 0.25=morning, 0.5=noon, 0.75=dusk, ~1=night)
  // sun arc across viewbox 1600x900
  const ang = Math.PI - time * Math.PI; // from right (dawn) to left (dusk)
  const cx = 800 + Math.cos(ang) * 700;
  const cy = 320 - Math.sin(ang) * 220;

  // Night dimming: when time outside [0.05, 0.95]
  let nightT = 0;
  if (time < 0.05) nightT = (0.05 - time) / 0.05;
  if (time > 0.95) nightT = (time - 0.95) / 0.05;
  nightT = Math.min(1, nightT);

  // Time-of-day tint strengths (peak around morning=0.28, evening=0.82)
  const morningT = Math.max(0, 1 - Math.abs(time - 0.28) / 0.18);
  const eveningT = Math.max(0, 1 - Math.abs(time - 0.82) / 0.18);

  // Morning: lavender top → soft pink horizon
  // Evening: deep violet top → magenta/rose horizon
  const morningTop = "#b8a3d6";
  const morningMid = "#e5c4d6";
  const morningLow = "#fbd9d0";
  const eveningTop = "#3a2552";
  const eveningMid = "#6b3d72";
  const eveningLow = "#a85a78";

  let skyTop = pal.skyTop,skyMid = pal.skyMid,skyLow = pal.skyLow;
  skyTop = window.mixColor(skyTop, morningTop, morningT * 0.85);
  skyMid = window.mixColor(skyMid, morningMid, morningT * 0.85);
  skyLow = window.mixColor(skyLow, morningLow, morningT * 0.85);
  skyTop = window.mixColor(skyTop, eveningTop, eveningT * 0.9);
  skyMid = window.mixColor(skyMid, eveningMid, eveningT * 0.9);
  skyLow = window.mixColor(skyLow, eveningLow, eveningT * 0.85);
  skyTop = window.mixColor(skyTop, "#0e1525", nightT * 0.85);
  skyMid = window.mixColor(skyMid, "#1a2438", nightT * 0.85);
  skyLow = window.mixColor(skyLow, "#2c3346", nightT * 0.7);

  return (
    <g>
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={skyTop} />
          <stop offset="55%" stopColor={skyMid} />
          <stop offset="100%" stopColor={skyLow} />
        </linearGradient>
        <radialGradient id="sunGlow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor={nightT > 0.5 ? "rgba(220,228,240,0.55)" : pal.sunGlow} />
          <stop offset="60%" stopColor={nightT > 0.5 ? "rgba(220,228,240,0.12)" : window.mixColor(pal.sunGlow, "rgba(255,255,255,0)", 0.6)} />
          <stop offset="100%" stopColor={nightT > 0.5 ? "rgba(220,228,240,0)" : window.mixColor(pal.sunGlow, "rgba(255,255,255,0)", 1)} />
        </radialGradient>
      </defs>

      <rect x="0" y="0" width="1600" height="900" fill="url(#skyGrad)" style={{ width: "1632px" }} />

      {/* stars at night (drawn before moon so moon overlaps) */}
      {nightT > 0.3 &&
      <g opacity={nightT} transform={`translate(${starDrift} 0)`}>
          {Array.from({ length: 60 }).map((_, i) => {
          const x = i * 173 % 1600;
          const y = i * 91 % 380;
          const r = i * 7 % 5 * 0.3 + 0.4;
          const tw = 0.4 + i * 13 % 6 * 0.1;
          return <circle key={`st-${i}`} cx={x} cy={y} r={r} fill="#f4eedf" opacity={tw} />;
        })}
        </g>
      }

      {/* sun/moon glow */}
      <circle cx={cx} cy={cy} r={nightT > 0.5 ? 140 : 220} fill="url(#sunGlow)" style={{ fill: "rgba(17, 17, 17, 0)" }} />

      {/* sun/moon body */}
      {nightT > 0.5 ?
      <g>
          {/* moon halo */}
          <circle cx={cx} cy={cy} r="56" fill="rgba(240,240,250,0.18)" />
          {/* moon body */}
          <circle cx={cx} cy={cy} r="44" fill="#f0ecdc" />
          {/* moon rim shading */}
          <circle cx={cx + 6} cy={cy + 4} r="44" fill="rgba(60,70,90,0.18)" />
          {/* craters */}
          <circle cx={cx - 14} cy={cy - 8} r="6" fill="rgba(60,70,90,0.18)" />
          <circle cx={cx + 6} cy={cy + 12} r="4" fill="rgba(60,70,90,0.16)" />
          <circle cx={cx + 14} cy={cy - 14} r="3" fill="rgba(60,70,90,0.14)" />
          <circle cx={cx - 6} cy={cy + 14} r="2.5" fill="rgba(60,70,90,0.14)" />
        </g> :

      <circle cx={cx} cy={cy} r="42" fill={pal.sun} opacity="0.98" />
      }

      {/* big cumulus cloud near the horizon — sits behind the island.
          Slightly desaturated to read as further away through atmospheric haze. */}
      <g transform={`translate(${cloudDrift} 0)`} style={{ filter: "saturate(0.6)" }}>
        <CumulusCloud nightT={nightT} morningT={morningT} eveningT={eveningT} season={season} />
      </g>

      {/* smaller, higher cumulus — offset on Y, drifts a touch faster.
          Pushed brighter & slightly desaturated so it reads as a crisper, whiter cloud.
          CumulusCloud has an internal translate(680, 510); the outer scale
          shifts that to (286, 214), so we offset to land the small cloud
          near world (cloud2Drift + 400, 280). */}
      <g transform={`translate(${cloud2Drift + 114} 66) scale(0.42)`}
         style={{ filter: "brightness(1.15) saturate(0.75)" }}>
        <CumulusCloud nightT={nightT} morningT={morningT} eveningT={eveningT} season={season} />
      </g>

      {/* atmospheric fog band near horizon */}
      <rect x="0" y="430" width="1600" height="120" fill={pal.fog} style={{ fill: "rgba(246, 247, 248, 0)" }} />
    </g>);

}

function CumulusCloud({ nightT, morningT, eveningT, season }) {
  // Season tilt: winter cool/gray, spring soft warm, summer bright white,
  // autumn slightly amber
  const w = window.seasonWeights(season);
  const seasonBody = window.mixColor(
    window.mixColor(
      window.mixColor("#e6ecf0", "#f7eee8", w[1]),
      "#ffffff", w[2]),
    "#f3e3cc", w[3]
  );
  const seasonShade = window.mixColor(
    window.mixColor(
      window.mixColor("#b6c0cc", "#d6c5cc", w[1]),
      "#c9d4e2", w[2]),
    "#c9a880", w[3]
  );

  // Tint per time of day on top of the season base
  let body = seasonBody;
  let shade = seasonShade;
  body = window.mixColor(body, "#f4dce6", morningT * 0.45);
  shade = window.mixColor(shade, "#c9a8c4", morningT * 0.55);
  body = window.mixColor(body, "#d9b9cf", eveningT * 0.55);
  shade = window.mixColor(shade, "#6a4570", eveningT * 0.7);
  body = window.mixColor(body, "#2a3148", nightT * 0.7);
  shade = window.mixColor(shade, "#161d2e", nightT * 0.8);

  // Cloud anchored around horizon y≈500. Asymmetric: heavier mass on left,
  // a trailing wisp drifting out to the right.
  return (
    <g transform="translate(680 510)">
      {/* soft shadow band on horizon — wider, off-center */}
      <ellipse cx="-40" cy="38" rx="460" ry="14" fill={shade} opacity="0.22" />

      {/* shadow lobes underneath (darker base) — uneven heights */}
      <g fill={shade} opacity="0.85">
        <ellipse cx="-280" cy="22" rx="90" ry="26" />
        <ellipse cx="-160" cy="18" rx="140" ry="36" />
        <ellipse cx="-10" cy="28" rx="170" ry="30" />
        <ellipse cx="160" cy="24" rx="120" ry="28" />
        <ellipse cx="290" cy="20" rx="70" ry="22" />
        <ellipse cx="430" cy="26" rx="60" ry="16" />
      </g>

      {/* main billowing body — left side heavier, taller; right side trails */}
      <g fill={body}>
        {/* bottom layer — staggered widths */}
        <ellipse cx="-290" cy="6" rx="80" ry="32" />
        <ellipse cx="-200" cy="12" rx="120" ry="44" />
        <ellipse cx="-70" cy="16" rx="150" ry="50" />
        <ellipse cx="80" cy="14" rx="135" ry="46" />
        <ellipse cx="210" cy="12" rx="100" ry="38" />
        <ellipse cx="320" cy="18" rx="70" ry="26" />
        <ellipse cx="420" cy="22" rx="50" ry="18" />

        {/* mid puffs — taller stack on the left half */}
        <ellipse cx="-260" cy="-22" rx="70" ry="46" />
        <ellipse cx="-170" cy="-46" rx="100" ry="76" />
        <ellipse cx="-60" cy="-58" rx="130" ry="92" />
        <ellipse cx="60" cy="-42" rx="110" ry="70" />
        <ellipse cx="170" cy="-28" rx="90" ry="54" />
        <ellipse cx="270" cy="-10" rx="60" ry="34" />
        <ellipse cx="370" cy="0" rx="40" ry="22" />

        {/* top crowns — main tower offset left */}
        <ellipse cx="-130" cy="-100" rx="70" ry="52" />
        <ellipse cx="-50" cy="-128" rx="80" ry="62" />
        <ellipse cx="40" cy="-110" rx="60" ry="48" />
        <ellipse cx="120" cy="-78" rx="46" ry="36" />

        {/* tallest cauliflower peak — off to the left of center */}
        <ellipse cx="-60" cy="-160" rx="50" ry="38" />
        <ellipse cx="-10" cy="-180" rx="32" ry="26" />
      </g>

      {/* sun-side highlight on upper-right billows */}
      <g fill="#ffffff" opacity={nightT > 0.5 ? 0 : 0.55}>
        <ellipse cx="-30" cy="-135" rx="44" ry="22" />
        <ellipse cx="50" cy="-118" rx="34" ry="16" />
        <ellipse cx="-15" cy="-182" rx="22" ry="11" />
        <ellipse cx="115" cy="-86" rx="22" ry="10" />
      </g>

      {/* faint wisp drifting further right — pulls eye outward, breaks symmetry */}
      <g fill={body} opacity="0.7">
        <ellipse cx="520" cy="20" rx="44" ry="14" />
        <ellipse cx="560" cy="14" rx="28" ry="10" />
        <ellipse cx="595" cy="20" rx="18" ry="7" />
      </g>
    </g>);

}

function Clouds({ pal, season, nightT }) {
  const w = window.seasonWeights(season);
  // density: spring 0.6, summer 0.9, autumn 0.7, winter 0.4
  const dens = w[0] * 0.4 + w[1] * 0.6 + w[2] * 0.9 + w[3] * 0.7;
  const tint = window.mixColor("#ffffff", "#1a2438", nightT * 0.5);
  return (
    <g opacity={dens * 0.8}>
      <Cloud x={180} y={220} s={1.2} fill={tint} />
      <Cloud x={520} y={170} s={0.9} fill={tint} />
      <Cloud x={920} y={250} s={1.4} fill={tint} />
      <Cloud x={1280} y={190} s={1.0} fill={tint} />
      <Cloud x={1480} y={300} s={0.8} fill={tint} />
    </g>);

}

function Cloud({ x, y, s, fill }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity="0.85">
      <ellipse cx="0" cy="0" rx="60" ry="14" fill={fill} />
      <ellipse cx="-26" cy="-6" rx="32" ry="14" fill={fill} />
      <ellipse cx="22" cy="-4" rx="36" ry="16" fill={fill} />
      <ellipse cx="48" cy="2" rx="22" ry="10" fill={fill} />
    </g>);

}

window.Sky = Sky;