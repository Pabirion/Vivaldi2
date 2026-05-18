// Scene composer — assembles sky, island, water, tree, bench, particles.

const { useEffect: useEffectS, useRef: useRefS, useState: useStateS } = React;

function useTime() {
  const [t, setT] = useStateS(0);
  const ref = useRefS(0);
  useEffectS(() => {
    let raf;
    const start = performance.now();
    const tick = (now) => {
      ref.current = now - start;
      setT(ref.current);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return t;
}

function Birds({ pal, season, t }) {
  const w = window.seasonWeights(season);
  const op = w[1] * 0.9 + w[2] * 0.7 + w[3] * 0.4;
  if (op < 0.05) return null;
  const tt = t * 0.0006;
  const flap = (i) => 4 + Math.sin(tt * 6 + i) * 3;
  return (
    <g opacity={op}>
      {[0, 1, 2].map((i) => {
        const x = (tt * 90 + i * 220) % 1700 - 50;
        const y = 180 + i * 18 + Math.sin(tt * 1.4 + i) * 6;
        const f = flap(i);
        return (
          <path
            key={`b-${i}`}
            d={`M ${x - 10} ${y} q 5 ${-f} 10 0 q 5 ${-f} 10 0`}
            stroke={pal.bird} strokeWidth="1.6" fill="none" strokeLinecap="round" />);


      })}
    </g>);

}

function Scene({ season, time, wind, tree }) {
  const t = useTime();
  const pal = window.getPalette(season);

  return (
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" style={{ width: "100%", height: "100%" }}>
      <window.Sky pal={pal} time={time} season={season} t={t} />
      <Birds pal={pal} season={season} t={t} />
      <window.Water pal={pal} t={t} time={time} />
      <window.Island pal={pal} season={season} />
      <window.Bench pal={pal} season={season} />
      <window.Tree pal={pal} season={season} wind={wind} t={t} time={time}
      x={tree.x} y={tree.y} scale={tree.scale} />
      <window.Particles pal={pal} season={season} wind={wind} t={t} />

      {/* night vignette */}
      <NightOverlay time={time} />
    </svg>);

}

function NightOverlay({ time }) {
  let nightT = 0;
  if (time < 0.05) nightT = (0.05 - time) / 0.05;
  if (time > 0.95) nightT = (time - 0.95) / 0.05;
  nightT = Math.min(1, nightT);
  if (nightT < 0.02) return null;
  return (
    <rect x="0" y="0" width="1600" height="900" fill="#0a1020" opacity={nightT * 0.35} style={{ pointerEvents: "none" }} />);

}

window.Scene = Scene;