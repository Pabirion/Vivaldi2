// Island — water, soil, grass, bench, ground details.

function Water({ pal, t, time }) {
  const tt = t * 0.001;
  // Sky-tint reflection: morning pink, evening violet, night deep blue
  let nightT = 0;
  if (time < 0.05) nightT = (0.05 - time) / 0.05;
  if (time > 0.95) nightT = (time - 0.95) / 0.05;
  nightT = Math.min(1, nightT);
  const morningT = Math.max(0, 1 - Math.abs((time ?? 0.5) - 0.28) / 0.18);
  const eveningT = Math.max(0, 1 - Math.abs((time ?? 0.5) - 0.82) / 0.18);

  let waterHi = pal.waterHi;
  let water = pal.water;
  waterHi = window.mixColor(waterHi, "#e5c4d6", morningT * 0.55);
  water = window.mixColor(water, "#a888b8", morningT * 0.45);
  waterHi = window.mixColor(waterHi, "#7a4a78", eveningT * 0.6);
  water = window.mixColor(water, "#3e2552", eveningT * 0.55);
  waterHi = window.mixColor(waterHi, "#1a2438", nightT * 0.7);
  water = window.mixColor(water, "#0e1525", nightT * 0.75);

  const lines = [];
  for (let i = 0; i < 14; i++) {
    const y = 600 + i * 22;
    const off = Math.sin(tt * 0.6 + i * 0.7) * 8;
    const op = 0.18 - i * 0.008;
    lines.push(
      <path
        key={`w-${i}`}
        d={`M 0 ${y + off} Q 400 ${y - 4 + off} 800 ${y + off} T 1600 ${y + off}`}
        stroke={waterHi} strokeWidth="1.4" fill="none" opacity={Math.max(0.05, op)} />

    );
  }
  return (
    <g>
      <defs>
        <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={waterHi} stopOpacity="0.95" />
          <stop offset="100%" stopColor={water} />
        </linearGradient>
      </defs>
      <rect x="0" y="540" width="1600" height="360" fill="url(#waterGrad)" />
      {lines}
    </g>);

}

function Island({ pal, season }) {
  const w = window.seasonWeights(season);
  const snow = w[0]; // snow coverage in winter
  // Island silhouette: extends well below visible area so it sits IN the water, not on it.
  const islandPath =
  "M 430 626 " +
  "C 480 612 550 604 630 602 " +
  "C 720 600 800 604 870 614 " +
  "C 920 622 960 632 975 652 " +
  "C 980 686 945 718 870 736 " +
  "C 795 752 690 752 600 744 " +
  "C 525 736 470 716 450 690 " +
  "C 438 666 440 642 430 626 Z";

  const underwaterPath =
  "M 440 668 " +
  "C 520 686 620 696 720 696 " +
  "C 820 696 900 686 960 668 " +
  "C 970 706 925 738 855 752 " +
  "C 780 766 680 766 590 758 " +
  "C 510 748 460 724 440 696 Z";

  const grassPath =
  "M 430 626 " +
  "C 480 612 550 604 630 602 " +
  "C 720 600 800 604 870 614 " +
  "C 920 622 960 632 975 652 " +
  "L 975 668 " +
  "C 950 644 910 634 860 626 " +
  "C 800 616 720 614 630 614 " +
  "C 555 614 500 622 440 638 Z";

  return (
    <g>
      {/* underwater silhouette — softens the join with water */}
      <path d={underwaterPath} fill={pal.water} opacity="0.55" />
      <ellipse cx="700" cy="720" rx="320" ry="22" fill="rgba(0,0,0,0.30)" />

      <path d="M 430 668 C 520 684 620 694 720 694 C 820 694 905 684 970 666"
      stroke={pal.waterHi} strokeWidth="2.5" fill="none" opacity="0.55" />
      <path d="M 410 678 C 520 696 620 706 720 706 C 820 706 920 696 980 676"
      stroke={pal.waterHi} strokeWidth="1.4" fill="none" opacity="0.4" />

      <path d={islandPath} fill={pal.soil} />
      <path
        d="M 440 660 C 540 684 640 696 740 696 C 830 696 910 684 965 660 C 955 706 890 736 800 750 C 690 764 580 758 490 740 C 430 720 415 696 440 660 Z"
        fill={pal.soilLight}
        opacity="0.55" />
      

      <ellipse cx="455" cy="700" rx="26" ry="9" fill={pal.rock} />
      <ellipse cx="425" cy="708" rx="14" ry="5" fill={pal.rock} opacity="0.8" />
      <ellipse cx="910" cy="706" rx="30" ry="10" fill={pal.rock} style={{ fill: "rgb(179, 138, 67)" }} />
      <ellipse cx="945" cy="714" rx="16" ry="6" fill={pal.rock} opacity="0.8" />

      {/* grass top */}
      <path d={grassPath} fill={pal.grass} />
      {/* grass highlight */}
      <path
        d="M 460 616 C 540 604 640 600 720 600 C 800 600 880 606 950 618 C 880 608 800 604 720 604 C 640 604 540 608 460 616 Z"
        fill={pal.grassHi} opacity="0.7" />
      
      <ellipse cx="700" cy="626" rx="180" ry="10" fill={pal.grassDark} opacity="0.45" />

      {/* dense grass tufts — clipped to grass region of the island */}
      <defs>
        <clipPath id="grassClip">
          <path d={grassPath} />
        </clipPath>
      </defs>
      <g clipPath="url(#grassClip)">
        {Array.from({ length: 110 }).map((_, i) => {
          // distribute across grass band x∈[440,970], y∈[604,640]
          const seed = i * 9301 + 49297;
          const rx = seed * 233280 % 53000 / 53000; // 0..1
          const ry = seed * 7919 % 36000 / 36000;
          const x = 440 + rx * 530;
          const y = 606 + ry * 32;
          const h = 5 + i * 7 % 7; // tuft height
          const lean = i * 3 % 5 - 2;
          return (
            <g key={`tf-${i}`} opacity={1 - snow * 0.85}>
              <path
                d={`M ${x - 2 + lean} ${y} l 1 ${-h + 1} M ${x} ${y} l ${lean * 0.4} ${-h - 1} M ${x + 2 + lean} ${y} l -1 ${-h}`}
                stroke={pal.grassDark}
                strokeWidth="1.1"
                strokeLinecap="round"
                fill="none" />
              
            </g>);

        })}
        {/* lighter blades for variation */}
        {Array.from({ length: 70 }).map((_, i) => {
          const seed = i * 4253 + 1117;
          const rx = seed * 199 % 47000 / 47000;
          const ry = seed * 113 % 31000 / 31000;
          const x = 440 + rx * 530;
          const y = 608 + ry * 28;
          const h = 3 + i * 5 % 5;
          return (
            <path
              key={`tfl-${i}`}
              d={`M ${x} ${y} l 0 ${-h}`}
              stroke={pal.grassHi}
              strokeWidth="0.9"
              strokeLinecap="round"
              opacity={(1 - snow * 0.85) * 0.85} />);


        })}
      </g>

      {/* snow blanket over grass (winter) */}
      {snow > 0.01 &&
      <g opacity={snow}>
          <path d={grassPath} fill={pal.snow} />
          <path
          d="M 240 616 C 360 602 500 596 640 598 C 780 600 920 608 1000 622 C 920 614 780 606 640 606 C 500 606 360 612 240 616 Z"
          fill="#ffffff" opacity="0.55" />
        
        </g>
      }
    </g>);

}

function Bench({ pal, season }) {
  const w = window.seasonWeights(season);
  const snow = w[0];
  // bench positioned to the right of the tree
  return (
    <g transform="translate(800 612)">
      {/* shadow */}
      <ellipse cx="55" cy="36" rx="80" ry="6" fill="rgba(0,0,0,0.22)" />

      {/* back legs */}
      <rect x="6" y="0" width="6" height="36" fill={pal.bench} rx="1" />
      <rect x="100" y="0" width="6" height="36" fill={pal.bench} rx="1" />
      {/* front legs */}
      <rect x="14" y="14" width="5" height="22" fill={pal.benchHi} rx="1" />
      <rect x="92" y="14" width="5" height="22" fill={pal.benchHi} rx="1" />

      {/* seat */}
      <rect x="-2" y="10" width="116" height="6" fill={pal.bench} rx="1.5" />
      <rect x="-2" y="10" width="116" height="2" fill={pal.benchHi} rx="1" opacity="0.7" />

      {/* backrest slats */}
      <rect x="2" y="-22" width="108" height="4" fill={pal.bench} rx="1" style={{ height: "15px" }} />
      <rect x="2" y="-14" width="108" height="4" fill={pal.bench} rx="1" style={{ height: "14px" }} />
      <rect x="2" y="-22" width="108" height="1.4" fill={pal.benchHi} opacity="0.7" />

      {/* snow on bench */}
      {snow > 0.05 &&
      <g opacity={snow}>
          <rect x="-2" y="9" width="116" height="2.5" fill="#fafaf6" rx="1" />
          <rect x="2" y="-23.5" width="108" height="2" fill="#fafaf6" rx="1" />
        </g>
      }
    </g>);

}

window.Water = Water;
window.Island = Island;
window.Bench = Bench;