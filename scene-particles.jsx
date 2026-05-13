// Particles — snow, petals, pollen/fireflies, leaves.
// Each season blends in/out of its particle field.

const { useMemo: useMemoP, useRef: useRefP } = React;

function makeParticles(n, seed) {
  const r = (() => {
    let s = seed | 0;
    return () => {
      s = (s * 1664525 + 1013904223) | 0;
      return ((s >>> 0) % 100000) / 100000;
    };
  })();
  const arr = [];
  for (let i = 0; i < n; i++) {
    arr.push({
      x: r() * 1600,
      y: r() * 900,
      vx: (r() - 0.5) * 0.4,
      vy: 0.3 + r() * 0.7,
      r: 1 + r() * 2.2,
      rot: r() * Math.PI * 2,
      vrot: (r() - 0.5) * 0.04,
      ph: r() * Math.PI * 2,
      ax: 0.4 + r() * 0.6, // sway amplitude
    });
  }
  return arr;
}

function Particles({ pal, season, wind, t }) {
  // 4 layers, one per season; cross-fade with weights
  const w = window.seasonWeights(season);
  const winter = useMemoP(() => makeParticles(120, 11), []);
  const spring = useMemoP(() => makeParticles(80, 22), []);
  const summer = useMemoP(() => makeParticles(40, 33), []); // fireflies/pollen
  const autumn = useMemoP(() => makeParticles(70, 44), []);

  const tt = t * 0.001;
  const windK = 0.6 + wind * 2.8;

  function step(p, fallSpeed, swayAmp) {
    // wrap-around vertical fall, with sway
    const sway = Math.sin(tt * 1.2 + p.ph) * p.ax * swayAmp;
    let x = (p.x + windK * tt * 30 + sway * 30) % 1700;
    if (x < -50) x += 1700;
    let y = (p.y + tt * fallSpeed * 30) % 900;
    return { x: x - 50, y };
  }

  return (
    <g style={{ pointerEvents: "none" }}>
      {/* WINTER — snow */}
      {w[0] > 0.01 && (
        <g opacity={w[0]}>
          {winter.map((p, i) => {
            const { x, y } = step(p, p.vy * 0.9, 1);
            return <circle key={`sn-${i}`} cx={x} cy={y} r={p.r} fill="#fafaf6" opacity="0.9" />;
          })}
        </g>
      )}

      {/* SPRING — petals */}
      {w[1] > 0.01 && (
        <g opacity={w[1]}>
          {spring.map((p, i) => {
            const { x, y } = step(p, p.vy * 0.7, 1.4);
            const rot = p.rot + tt * 0.6 + i * 0.1;
            return (
              <g key={`pe-${i}`} transform={`translate(${x} ${y}) rotate(${(rot * 180) / Math.PI})`}>
                <ellipse cx="0" cy="0" rx={p.r * 1.6} ry={p.r * 0.7} fill={pal.particle} />
                <ellipse cx="0" cy="0" rx={p.r * 0.8} ry={p.r * 0.35} fill={pal.particleAlt} opacity="0.7" />
              </g>
            );
          })}
        </g>
      )}

      {/* SUMMER — pollen / fireflies (subtle) */}
      {w[2] > 0.01 && (
        <g opacity={w[2] * 0.85}>
          {summer.map((p, i) => {
            const { x, y } = step(p, 0.15, 2.4);
            const pulse = 0.5 + 0.5 * Math.sin(tt * 1.5 + p.ph);
            return (
              <g key={`su-${i}`}>
                <circle cx={x} cy={y} r={p.r * 2.5} fill={pal.particle} opacity={0.15 * pulse} />
                <circle cx={x} cy={y} r={p.r * 0.9} fill={pal.particleAlt} opacity={0.85} />
              </g>
            );
          })}
        </g>
      )}

      {/* AUTUMN — leaves */}
      {w[3] > 0.01 && (
        <g opacity={w[3]}>
          {autumn.map((p, i) => {
            const { x, y } = step(p, p.vy * 1.1, 2);
            const rot = p.rot + tt * 1.4 + i * 0.2;
            const leafColor = i % 3 === 0 ? pal.particleAlt : pal.particle;
            return (
              <g key={`au-${i}`} transform={`translate(${x} ${y}) rotate(${(rot * 180) / Math.PI})`}>
                <path
                  d={`M 0 ${-p.r * 2} Q ${p.r * 1.6} 0 0 ${p.r * 2} Q ${-p.r * 1.6} 0 0 ${-p.r * 2} Z`}
                  fill={leafColor}
                />
                <line x1="0" y1={-p.r * 2} x2="0" y2={p.r * 2} stroke="rgba(0,0,0,0.2)" strokeWidth="0.4" />
              </g>
            );
          })}
        </g>
      )}
    </g>
  );
}

window.Particles = Particles;
