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

  // Foreground wave crests — undulating bands with subtle depth shading.
  // Each crest gets a thin darker line just below it to suggest the trough
  // sitting in shadow behind the wave.
  const crests = [];
  for (let i = 0; i < 8; i++) {
    const baseY = 640 + i * 32;
    const amp = 6 + i * 1.6;           // foreground waves are taller
    const freq = 0.0009 + i * 0.00012; // slightly different phase per band
    const phase = tt * (0.7 + i * 0.08) + i * 1.3;
    // Build a wavy polyline across the width
    let d = `M 0 ${baseY + Math.sin(phase) * amp}`;
    let dShadow = `M 0 ${baseY + 3 + Math.sin(phase) * amp}`;
    for (let x = 80; x <= 1600; x += 80) {
      const y = baseY + Math.sin(phase + x * freq) * amp;
      d += ` L ${x} ${y}`;
      dShadow += ` L ${x} ${y + 3}`;
    }
    const op = 0.35 - i * 0.025;
    // Shadow first (drawn below the crest)
    crests.push(
      <path key={`crest-shadow-${i}`} d={dShadow} stroke={water}
        strokeWidth={1.4 - i * 0.08} fill="none"
        opacity={Math.max(0.05, (0.28 - i * 0.022) * (1 - nightT * 0.4))}
        strokeLinecap="round" />
    );
    // Then the lit crest line
    crests.push(
      <path key={`crest-${i}`} d={d} stroke={waterHi} strokeWidth={1.6 - i * 0.1}
        fill="none" opacity={Math.max(0.08, op)} strokeLinecap="round" />
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
      {crests}
    </g>);

}

function Island({ pal, season }) {
  const w = window.seasonWeights(season);
  const snow = w[0]; // snow coverage in winter
  // Island silhouette: leaf-like, scaled down further (~62% of original).
  const islandPath =
  "M 478 664 L 495 650 L 517 640 L 540 631 L 566 621 L 591 611 L 616 603 " +
  "L 642 597 L 668 594 L 694 596 L 718 601 L 743 608 L 767 615 L 793 621 " +
  "L 819 624 L 846 628 L 874 631 L 904 633 L 934 636 L 963 638 L 992 640 " +
  "L 1023 644 L 1055 649 L 1089 654 L 1125 659 L 1164 663 L 1184 666 " +
  "C 1196 682 1177 699 1143 708 C 1100 717 1039 722 978 722 " +
  "C 916 723 855 720 792 718 C 730 715 668 717 610 713 " +
  "C 561 709 514 702 486 692 C 467 680 463 670 478 664 Z";

  const underwaterPath =
  "M 478 675 C 590 688 725 697 861 697 C 984 697 1095 692 1187 678 " +
  "C 1196 694 1175 709 1132 717 C 1070 725 984 728 898 727 " +
  "C 799 725 689 723 602 717 C 540 712 498 702 478 692 Z";

  // Snow cap path — traces the jagged top and dips down a touch.
  const snowCapPath =
  "M 478 664 L 495 650 L 517 640 L 540 631 L 566 621 L 591 611 L 616 603 " +
  "L 642 597 L 668 594 L 694 596 L 718 601 L 743 608 L 767 615 L 793 621 " +
  "L 819 624 L 846 628 L 874 631 L 904 633 L 934 636 L 963 638 L 992 640 " +
  "L 1023 644 L 1055 649 L 1089 654 L 1125 659 L 1164 663 L 1184 666 " +
  "L 1177 678 C 1083 664 960 659 836 660 C 713 660 602 665 516 676 " +
  "C 485 680 474 673 478 664 Z";

  return (
    <g>
      {/* underwater silhouette — softens the join with water */}
      <path d={underwaterPath} fill={pal.water} opacity="0.55" />
      <ellipse cx="830" cy="709" rx="345" ry="15" fill="rgba(0,0,0,0.30)" />

      <path d="M 478 671 C 614 685 750 692 873 692 C 984 692 1083 686 1187 675"
      stroke={pal.waterHi} strokeWidth="2.5" fill="none" opacity="0.55" />
      <path d="M 467 682 C 614 696 750 702 873 702 C 984 702 1083 697 1193 685"
      stroke={pal.waterHi} strokeWidth="1.4" fill="none" opacity="0.4" />

      <path d={islandPath} fill={pal.soil} />
      <path
        d="M 485 673 C 627 688 762 699 885 699 C 997 699 1095 692 1187 680 C 1181 697 1132 712 1070 718 C 997 724 898 727 812 725 C 725 724 639 720 577 713 C 528 708 491 697 485 673 Z"
        fill={pal.soilLight}
        opacity="0.55" />

      <ellipse cx="522" cy="648" rx="20" ry="6" fill={pal.rock} />
      <ellipse cx="500" cy="657" rx="11" ry="4" fill={pal.rock} opacity="0.8" />
      <ellipse cx="1130" cy="668" rx="21" ry="7" fill={pal.rock} style={{ fill: "rgb(179, 138, 67)" }} />
      <ellipse cx="1155" cy="672" rx="11" ry="4" fill={pal.rock} opacity="0.8" />

      {/* snow blanket over the top (winter) */}
      {snow > 0.01 &&
      <g opacity={snow}>
          <path d={snowCapPath} fill={pal.snow} />
          <path
          d="M 467 650 C 602 637 750 631 885 632 C 1021 633 1132 638 1193 647 C 1132 643 1021 638 885 637 C 750 637 602 643 467 650 Z"
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
    <g transform="translate(812 622) scale(0.7)">
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