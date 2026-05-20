// Main app — title, scene, controls overlaid on top of the scene.

const { useState: useStateA, useEffect: useEffectA, useRef: useRefA } = React;

function ScrollHint() {
  const [hidden, setHidden] = useStateA(false);
  useEffectA(() => {
    const onScroll = () => { if (window.scrollY > 20) setHidden(true); };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div className={`scroll-hint${hidden ? ' hidden' : ''}`}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
        stroke="rgba(255,250,240,0.75)" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>);
}

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "treeX": 660,
  "treeY": 635,
  "treeScale": 0.9,
  "showBirds": true,
  "particleDensity": 1.0
} /*EDITMODE-END*/;

// Discrete time-of-day options the user picks from.
const TIME_OPTIONS = [
{ id: "morning", label: "Morning", value: 0.28, icon: "☀" },
{ id: "midday", label: "Midday", value: 0.5, icon: "☀" },
{ id: "evening", label: "Evening", value: 0.82, icon: "☾" },
{ id: "night", label: "Night", value: 0.0, icon: "☾" }];


function App() {
  const [tweaks, setTweak] = window.useTweaks(TWEAK_DEFAULTS);

  const [season, setSeason] = useStateA(1.5);
  const [timeId, setTimeId] = useStateA("midday");
  const [wind, setWind] = useStateA(0.25);

  const time = TIME_OPTIONS.find((o) => o.id === timeId).value;

  const w = window.seasonWeights(season);
  const dominantIdx = w.indexOf(Math.max(...w));
  const seasonName = window.SEASON_NAMES[dominantIdx];

  const sub = (() => {
    const s = (season % 4 + 4) % 4;
    const i = Math.floor(s);
    const t = s - i;
    if (t < 0.15) return `Early ${window.SEASON_NAMES[i]}`;
    if (t > 0.7) return `Late ${window.SEASON_NAMES[i]}`;
    return `Mid ${window.SEASON_NAMES[i]}`;
  })();

  const windLabel = (() => {
    if (wind < 0.1) return "Still";
    if (wind < 0.35) return "Calm";
    if (wind < 0.65) return "Breezy";
    if (wind < 0.85) return "Gusty";
    return "Stormy";
  })();

  const tree = { x: tweaks.treeX, y: tweaks.treeY, scale: tweaks.treeScale };

  return (
    <>
      {/* Scene area — wraps stage + floating labels */}
      <div className="scene-area">
        <div className="stage">
          <div className="scene-wrap">
            <window.Scene season={season} time={time} wind={wind} tree={tree} />
          </div>
        </div>

        {/* Titling — floating on the scene */}
        <div className="title" style={{ fontFamily: "Poppins", fontWeight: "500" }}>
          A small island, <em>{sub.toLowerCase()}</em>
        </div>
        <div className="meta">
          <div>{TIME_OPTIONS.find((o) => o.id === timeId).label}</div>
          <div style={{ opacity: 0.7 }}>{windLabel}</div>
        </div>
        <div className="signature">No. 04 — A study in passing time</div>
        <ScrollHint />
      </div>

      {/* Controls panel */}
      <div className="panel">
          <div className="control season">
            <div className="label">
              <span style={{ fontFamily: "Poppins" }}>Seasons</span>
              <span className="val" style={{ color: "rgb(254, 254, 254)" }}>{seasonName}</span>
            </div>
            <input
            type="range" min="0" max="4" step="0.001"
            value={season}
            onChange={(e) => setSeason(parseFloat(e.target.value))} />
          
            <div className="season-tics">
              {window.SEASON_NAMES.map((n, i) =>
            <span
              key={n}
              className={`season-tic ${i === dominantIdx ? "active" : ""}`}
              onClick={() => setSeason(i)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {if (e.key === "Enter" || e.key === " ") {e.preventDefault();setSeason(i);}}}>{n}</span>
            )}
            </div>
          </div>

          <div className="control">
            <div className="label">
              <span>Wind</span>
              <span className="val" style={{ fontWeight: "500" }}>{windLabel}</span>
            </div>
            <input
            type="range" min="0" max="1" step="0.001"
            value={wind}
            onChange={(e) => setWind(parseFloat(e.target.value))} />
          </div>

          <div className="control">
            <div className="label">
              <span>Hour</span>
              <span className="val">{TIME_OPTIONS.find((o) => o.id === timeId).label}</span>
            </div>
            <div className="seg" style={{
              display: "flex",
              width: "100%",
              backgroundColor: "rgba(30, 90, 128, 0.27)",
              borderWidth: "0.882812px",
              borderStyle: "solid",
              borderColor: "rgba(216, 216, 216)",
              color: "rgb(255, 255, 255)"
              }}>
              {TIME_OPTIONS.map((o) =>
            <button
              key={o.id}
              className={`seg-btn ${timeId === o.id ? "active" : ""}`}
              onClick={() => setTimeId(o.id)}
              type="button"
              style={{
                flex: 1,
                fontWeight: timeId === o.id ? "700" : "400",
                color: "rgba(255, 250, 240)",
                backgroundColor: timeId === o.id ? "rgba(255, 255, 255, 0.25)" : "rgba(236, 234, 226, 0.1)"
                }}>
             {o.label}
            </button>
           )}
          </div>
        </div>

          <div className="control">
            <div className="label">
              <span>Year</span>
              <span className="val">DRIFT</span>
            </div>
            <YearDrift onCycle={(d) => setSeason((s) => ((s + d) % 4 + 4) % 4)} />
          </div>
      </div>

      <window.TweaksPanel title="Tweaks">
        <window.TweakSection label="Tree placement" />
        <window.TweakSlider label="Tree X" value={tweaks.treeX} min={300} max={1100} step={1}
        onChange={(v) => setTweak('treeX', v)} />
        <window.TweakSlider label="Tree Y" value={tweaks.treeY} min={400} max={650} step={1}
        onChange={(v) => setTweak('treeY', v)} />
        <window.TweakSlider label="Tree size" value={tweaks.treeScale} min={0.5} max={1.8} step={0.01}
        onChange={(v) => setTweak('treeScale', v)} />

        <window.TweakSection label="Environment" />
        <window.TweakToggle label="Birds" value={tweaks.showBirds}
        onChange={(v) => setTweak('showBirds', v)} />
        <window.TweakSlider label="Particle density" value={tweaks.particleDensity}
        min={0} max={2} step={0.05}
        onChange={(v) => setTweak('particleDensity', v)} />
      </window.TweaksPanel>
    </>);

}

function YearDrift({ onCycle }) {
  const [running, setRunning] = useStateA(false);
  useEffectA(() => {
    if (!running) return;
    let raf;
    let last = performance.now();
    const tick = (now) => {
      const dt = now - last;
      last = now;
      onCycle(dt / 1000 * 0.18);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, onCycle]);

  return (
    <button
      onClick={() => setRunning((r) => !r)}
      className="drift-btn"
      type="button">
      
      {running ? "■ Pause" : "▶ Drift"}
    </button>);

}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);