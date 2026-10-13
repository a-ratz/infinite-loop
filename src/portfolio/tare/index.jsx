import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FACTS, PACKAGE, PYPI, REPO, COMMIT } from "./data/facts";
import { AGENTS, AGENT_KEYS, MIN_LIFETIME, RETRY_PAUSE, preset, runCommand } from "./data/probe";
import "./styles.css";

const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/* ------------------------------------------------------------------ */
/* Seven-segment readout                                               */
/* ------------------------------------------------------------------ */

const SEGMENTS = {
  0: "abcdef",
  1: "bc",
  2: "abdeg",
  3: "abcdg",
  4: "bcfg",
  5: "acdfg",
  6: "acdefg",
  7: "abc",
  8: "abcdefg",
  9: "abcdfg",
  "-": "g",
  E: "adefg",
  r: "eg",
  " ": "",
};

function segmentPolygons(w, h, t) {
  const gap = t * 0.22;
  const m = h / 2;
  const H = (x0, x1, cy) => [
    [x0, cy],
    [x0 + t / 2, cy - t / 2],
    [x1 - t / 2, cy - t / 2],
    [x1, cy],
    [x1 - t / 2, cy + t / 2],
    [x0 + t / 2, cy + t / 2],
  ];
  const V = (cx, y0, y1) => [
    [cx, y0],
    [cx + t / 2, y0 + t / 2],
    [cx + t / 2, y1 - t / 2],
    [cx, y1],
    [cx - t / 2, y1 - t / 2],
    [cx - t / 2, y0 + t / 2],
  ];
  const polys = {
    a: H(gap, w - gap, 0),
    b: V(w, gap, m - gap),
    c: V(w, m + gap, h - gap),
    d: H(gap, w - gap, h),
    e: V(0, m + gap, h - gap),
    f: V(0, gap, m - gap),
    g: H(gap, w - gap, m),
  };
  return Object.fromEntries(Object.entries(polys).map(([k, pts]) => [k, pts.map((p) => p.join(",")).join(" ")]));
}

// cells: [{ ch, dp }], drawn left to right
function SevenSeg({ cells, x, y, w = 40, h = 74, t = 9, pitch = 66 }) {
  const polys = useMemo(() => segmentPolygons(w, h, t), [w, h, t]);
  return (
    <g transform={`translate(${x} ${y}) skewX(-7)`}>
      {cells.map((cell, i) => {
        const lit = SEGMENTS[cell.ch] ?? "";
        return (
          <g key={i} transform={`translate(${i * pitch} 0)`}>
            {Object.entries(polys).map(([seg, points]) => (
              <polygon key={seg} points={points} className={lit.includes(seg) ? "tre-seg is-lit" : "tre-seg"} />
            ))}
            <circle cx={w + t * 1.05} cy={h} r={t * 0.62} className={cell.dp ? "tre-seg is-lit" : "tre-seg"} />
          </g>
        );
      })}
    </g>
  );
}

const ZERO_CELLS = [{ ch: "0", dp: true }, { ch: "0" }, { ch: "0" }];
const BUSY_CELLS = [{ ch: "-" }, { ch: "-" }, { ch: "-" }];

function cellsFor(display) {
  if (display.kind === "zero") return ZERO_CELLS;
  if (display.kind === "busy" || display.kind === "blind") return BUSY_CELLS;
  if (display.kind === "err") return [{ ch: "E" }, { ch: "r" }, { ch: "r" }];
  const digits = String(Math.min(display.count, 999)).padStart(3, " ");
  return digits.split("").map((ch) => ({ ch }));
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

function HeroDisplay() {
  const [settled, setSettled] = useState(() => reducedMotion());

  useEffect(() => {
    if (settled) return undefined;
    const id = setTimeout(() => setSettled(true), 1100);
    return () => clearTimeout(id);
  }, [settled]);

  return (
    <figure className="tre-hero-instrument">
      <svg viewBox="0 0 460 232" role="img" aria-label="A display reading tare: 0.00">
        <defs>
          <linearGradient id="tre-bezel" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1d1f25" />
            <stop offset="1" stopColor="#0d0e12" />
          </linearGradient>
          <radialGradient id="tre-lcd-hero" cx="0.5" cy="0.4" r="0.8">
            <stop offset="0" stopColor="#141c09" />
            <stop offset="1" stopColor="#070a04" />
          </radialGradient>
        </defs>
        <rect x="1" y="1" width="458" height="230" rx="22" fill="url(#tre-bezel)" className="tre-bezel" />
        <rect x="22" y="22" width="416" height="152" rx="12" fill="url(#tre-lcd-hero)" className="tre-lcd" />
        <text x="44" y="138" className="tre-lcd-label">
          tare:
        </text>
        <g className={settled ? "" : "tre-busy"}>
          <SevenSeg cells={settled ? ZERO_CELLS : BUSY_CELLS} x={160} y={48} w={50} h={92} t={11} pitch={82} />
        </g>
        {["ZERO", "LEAK", "BLIND", "DECL"].map((label, i) => (
          <text
            key={label}
            x={46 + i * 64}
            y={164}
            className={`tre-ann ${settled && (label === "ZERO" || label === "DECL") ? "is-on" : ""}`}
          >
            {label}
          </text>
        ))}
        <text x="34" y="206" className="tre-plate">
          TARE · PROBE
        </text>
        <circle cx="404" cy="202" r="6" className={`tre-led ${settled ? "is-on" : ""}`} />
        <text x="388" y="206" textAnchor="end" className="tre-plate">
          ROOM
        </text>
      </svg>
      <figcaption>A clean room reads tare: 0.00.</figcaption>
    </figure>
  );
}

function Hero() {
  return (
    <header className="tre-hero">
      <div className="tre-hero-copy">
        <p className="tre-kicker">Portfolio · eval tooling</p>
        <h1>Tare</h1>
        <p className="tre-define">
          <span>tare (verb)</span> set a scale to zero before you weigh something.
        </p>
        <p className="tre-claim">
          Tare runs a coding agent in a sandboxed room and starts it only after a probe proves none of your personal
          setup came along.
        </p>
        <p className="tre-intro">
          You test a skill by comparing agent runs with it against runs without it. On your own machine, both runs also
          carry your global instructions, memories, skills, MCP servers and connected accounts. The comparison then
          measures your machine instead of the skill. A separate config directory does not fix this. With Claude Code,
          the login alone brings your connected accounts, your account's skills and your email address into the
          session.
        </p>
        <div className="tre-chips">
          <a className="tre-chip" href={REPO} target="_blank" rel="noreferrer">
            <span>GitHub</span> a-ratz/tare ↗
          </a>
          <a className="tre-chip" href={PYPI} target="_blank" rel="noreferrer">
            <span>PyPI</span> {PACKAGE.name} {PACKAGE.version} ↗
          </a>
          <span className="tre-chip is-static">
            <span>License</span> MIT
          </span>
        </div>
        <p className="tre-install">
          <code>uv tool install {PACKAGE.name}</code>
          <code>tare probe claude</code>
        </p>
      </div>
      <HeroDisplay />
    </header>
  );
}

function Facts() {
  return (
    <section className="tre-facts" aria-label="Tare in numbers">
      {FACTS.map((fact) => (
        <div key={fact.label}>
          <strong>{fact.value}</strong>
          <span>{fact.label}</span>
          <em>{fact.note}</em>
        </div>
      ))}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* The bench: setup, instrument, terminal                              */
/* ------------------------------------------------------------------ */

const STATES = [
  ["out", "out"],
  ["in", "in"],
  ["blind", "blind"],
];

const PRESETS = [
  ["clean", "Clean room"],
  ["copies", "Copies placed in the room"],
  ["blind", "Dirty twin blind"],
];

const LANES = [
  ["room", "Room run", "The agent in the room sends its first request to the fake model server."],
  ["twin", "Dirty twin", "The same agent in your real setup, against the same server."],
  ["reach", "Reach script", "Looks for your files and variables, outside the room and inside."],
];

function fmtLifetime(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h} h ${String(m).padStart(2, "0")} min` : `${m} min`;
}

function laneResult(lane, result, agent) {
  if (!result || result.error) return "did not run";
  const { reading } = result;
  if (lane === "room") {
    const n = reading.leaks.filter((x) => x.kind !== "reach" && x.kind !== "env").length;
    return n ? `${n} finding${n === 1 ? "" : "s"} of yours in the request` : "nothing of yours in the request";
  }
  if (lane === "twin") {
    if (reading.blind.length) return `blind for ${reading.blind.join(", ")}, twice`;
    const n = reading.seen.filter((c) => c !== "reach").length;
    return `shows ${n} kind${n === 1 ? "" : "s"} of your context`;
  }
  const n = reading.leaks.filter((x) => x.kind === "reach" || x.kind === "env").length;
  return n ? `${n} reachable inside the room` : `finds your files outside, nothing inside`;
}

function Setup({ agentKey, setAgentKey, states, setStates, lifetime, setLifetime, allowDirty, setAllowDirty, onRun, busy, stale }) {
  const agent = AGENTS[agentKey];

  return (
    <div className="tre-setup">
      <div className="tre-panel-head">
        <span className="tre-panel-label">Your setup</span>
        <div className="tre-tabs" role="group" aria-label="Agent">
          {AGENT_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              className={key === agentKey ? "is-active" : ""}
              aria-pressed={key === agentKey}
              onClick={() => setAgentKey(key)}
            >
              {AGENTS[key].label}
            </button>
          ))}
        </div>
      </div>

      <div className="tre-presets" role="group" aria-label="Presets">
        {PRESETS.map(([name, label]) => (
          <button key={name} type="button" onClick={() => setStates(preset(agent, name))}>
            {label}
          </button>
        ))}
      </div>

      <p className="tre-legend">
        <b className="is-out">out</b> the room keeps it out. <b className="is-in">in</b> it reaches the room.{" "}
        <b className="is-blind">blind</b> the dirty twin does not show it either.
      </p>

      <ul className="tre-items">
        {agent.items.map((item) => {
          const state = states[item.cls] ?? "out";
          return (
            <li key={item.cls} className={`tre-item is-${state}`}>
              <span className="tre-item-tag">{item.cls}</span>
              <div className="tre-item-text">
                <b>{item.label}</b>
                <span>{item.where}</span>
              </div>
              <fieldset className="tre-seg-control">
                <legend className="tre-sr">{item.label}</legend>
                {STATES.filter(([value]) => value !== "blind" || item.blindable).map(([value, label]) => (
                  <label key={value} className={`is-${value}`}>
                    <input
                      type="radio"
                      name={`tre-${agentKey}-${item.cls}`}
                      value={value}
                      checked={state === value}
                      onChange={() => setStates((cur) => ({ ...cur, [item.cls]: value }))}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </fieldset>
            </li>
          );
        })}
      </ul>

      <div className="tre-options">
        {agent.expires ? (
          <label className="tre-lifetime">
            <span>
              Login valid for <b className={lifetime < MIN_LIFETIME ? "is-short" : ""}>{fmtLifetime(lifetime)}</b>
            </span>
            <input
              type="range"
              min="0"
              max="480"
              step="5"
              value={lifetime}
              aria-valuetext={fmtLifetime(lifetime)}
              onChange={(e) => setLifetime(Number(e.target.value))}
            />
            <em>tare refuses to open a room when the login copy would need renewal within the hour.</em>
          </label>
        ) : (
          <p className="tre-lifetime-off">The Antigravity login keeps its refresh token, so tare does not check its lifetime.</p>
        )}
        <label className="tre-check">
          <input type="checkbox" checked={allowDirty} onChange={(e) => setAllowDirty(e.target.checked)} />
          <span>
            <code>--allow-dirty</code> start <code>tare {agent.cmd}</code> even if the reading is not tare: 0.00
          </span>
        </label>
      </div>

      <div className="tre-run">
        <button type="button" className="tre-btn is-primary" onClick={() => onRun("probe")} disabled={busy}>
          tare probe {agent.cmd}
        </button>
        <button type="button" className="tre-btn" onClick={() => onRun("start")} disabled={busy}>
          tare {agent.cmd}
          {allowDirty ? " --allow-dirty" : ""}
        </button>
        {stale && !busy && <span className="tre-stale">Setup changed. Run the probe again.</span>}
      </div>
    </div>
  );
}

function Weight({ x, y, label, ghost, delay, title }) {
  return (
    <g transform={`translate(${x} ${y}) scale(1.32)`}>
      <g className={`tre-weight ${ghost ? "is-ghost" : ""}`} style={{ animationDelay: `${delay}ms` }}>
        <title>{title}</title>
        <ellipse cx="16" cy="0" rx="16" ry="4.5" className="tre-weight-base" />
        <rect x="0" y="-25" width="32" height="25" className="tre-weight-body" />
        <ellipse cx="16" cy="-25" rx="16" ry="4.5" className="tre-weight-top" />
        <rect x="11" y="-33" width="10" height="8" className="tre-weight-body" />
        <ellipse cx="16" cy="-33" rx="5" ry="1.8" className="tre-weight-top" />
        <text x="16" y="-9" textAnchor="middle" className="tre-weight-label">
          {ghost ? "?" : label}
        </text>
      </g>
    </g>
  );
}

function Instrument({ agent, phase, result, command }) {
  const done = phase === "done";
  const reading = done && result && !result.error ? result.reading : null;

  let display = { kind: "busy" };
  if (done && result?.error) display = { kind: "err" };
  else if (reading?.zero) display = { kind: "zero" };
  else if (reading?.leaks.length) display = { kind: "leak", count: reading.leaks.length };
  else if (reading) display = { kind: "blind" };

  const weights = [];
  if (reading) {
    reading.leaks.forEach((leak) => {
      const item = agent.items.find((i) => i.cls === leak.cls);
      weights.push({ label: item?.short ?? leak.kind, title: `leak · ${leak.kind} · ${leak.what}` });
    });
    reading.blind.forEach((cls) => weights.push({ label: "?", ghost: true, title: `blind · ${cls}` }));
  }
  const placed = weights.map((w, i) => {
    const row = i < 6 ? 0 : 1;
    const col = row ? i - 6 : i;
    return { ...w, x: 192 + col * 48 + row * 24, y: 152 - row * 44, delay: i * 90 };
  });
  const sink = reading ? Math.min(reading.leaks.length, 8) * 1.4 : 0;

  const roomOpen = done && result?.started;
  const roomDirty = roomOpen && !reading?.zero;
  const exit = done && result ? (result.started ? "–" : String(result.exit)) : "·";
  const ann = {
    ZERO: display.kind === "zero",
    LEAK: display.kind === "leak",
    BLIND: Boolean(reading?.blind.length),
    DECL: Boolean(reading?.declared.length),
  };

  const label = !done
    ? "Probe running"
    : result?.error
      ? "The display reads Err: the login expires too soon, so no room was built"
      : `The display reads ${display.kind === "zero" ? "0.00" : display.kind === "leak" ? `${display.count} leaks` : "not proven"}`;

  return (
    <div className="tre-instrument">
      <svg viewBox="0 56 600 370" role="img" aria-label={label}>
        <defs>
          <linearGradient id="tre-base" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1c1e24" />
            <stop offset="1" stopColor="#0c0d11" />
          </linearGradient>
          <linearGradient id="tre-pan" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#3a3d46" />
            <stop offset="0.55" stopColor="#1d1f25" />
            <stop offset="1" stopColor="#2b2e36" />
          </linearGradient>
          <radialGradient id="tre-lcd" cx="0.5" cy="0.4" r="0.85">
            <stop offset="0" stopColor="#131b08" />
            <stop offset="1" stopColor="#060904" />
          </radialGradient>
          <linearGradient id="tre-leak" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#ff8a6b" />
            <stop offset="0.5" stopColor="#ff5a3c" />
            <stop offset="1" stopColor="#a8301b" />
          </linearGradient>
          <radialGradient id="tre-fog" cx="0.5" cy="0.6" r="0.6">
            <stop offset="0" stopColor="#9fb2d8" stopOpacity="0.28" />
            <stop offset="1" stopColor="#9fb2d8" stopOpacity="0" />
          </radialGradient>
        </defs>

        <ellipse cx="300" cy="404" rx="270" ry="16" className="tre-shadow" />
        <rect x="64" y="384" width="44" height="14" rx="4" className="tre-foot" />
        <rect x="492" y="384" width="44" height="14" rx="4" className="tre-foot" />
        <rect x="34" y="196" width="532" height="196" rx="28" fill="url(#tre-base)" className="tre-body" />
        <rect x="48" y="203" width="504" height="3" rx="1.5" className="tre-bevel" />
        <text x="62" y="228" className="tre-plate">
          TARE · {agent.label.toUpperCase()}
        </text>

        <rect x="58" y="242" width="340" height="126" rx="12" fill="url(#tre-lcd)" className="tre-lcd" />
        <text x="78" y="318" className="tre-lcd-label is-small">
          tare:
        </text>
        <g className={!done ? "tre-busy" : display.kind === "err" ? "is-err" : display.kind === "leak" ? "is-leak" : ""}>
          <SevenSeg cells={cellsFor(display)} x={176} y={262} />
        </g>
        {Object.entries(ann).map(([name, on], i) => (
          <text
            key={name}
            x={80 + i * 74}
            y={356}
            className={`tre-ann ${on ? `is-on is-${name.toLowerCase()}` : ""}`}
          >
            {name}
          </text>
        ))}

        <g className="tre-status">
          <circle cx="424" cy="268" r="7" className={`tre-led ${roomOpen ? (roomDirty ? "is-dirty" : "is-on") : ""}`} />
          <text x="440" y="264" className="tre-plate">
            ROOM
          </text>
          <text x="440" y="283" className={`tre-status-value ${roomOpen ? (roomDirty ? "is-dirty" : "is-on") : ""}`}>
            {roomOpen ? "OPEN" : "SHUT"}
          </text>
          <text x="424" y="322" className="tre-plate">
            EXIT
          </text>
          <text x="424" y="350" className={`tre-status-exit ${exit === "0" ? "is-on" : exit === "1" || exit === "2" ? "is-bad" : ""}`}>
            {exit}
          </text>
          <text x="476" y="322" className="tre-plate">
            CMD
          </text>
          <text x="476" y="342" className="tre-status-cmd">
            {command === "probe" ? "probe" : "start"}
          </text>
        </g>

        <g className="tre-pan" style={{ transform: `translateY(${sink}px)` }}>
          <rect x="286" y="150" width="28" height="48" className="tre-stem" />
          <ellipse cx="300" cy="157" rx="222" ry="23" className="tre-pan-under" />
          <ellipse cx="300" cy="150" rx="222" ry="21" fill="url(#tre-pan)" className="tre-pan-top" />
          <ellipse cx="300" cy="150" rx="196" ry="16" className="tre-pan-ring" />
          {reading?.blind.length ? <ellipse cx="320" cy="120" rx="200" ry="70" fill="url(#tre-fog)" /> : null}

          <g transform="translate(118 150)" className="tre-beaker">
            <title>{`declared · ${agent.declared.map((d) => d.kind).join(", ")}`}</title>
            <path d="M3 0 Q0 0 0 -4 V-48 H-4 V-53 H48 V-48 H44 V-4 Q44 0 41 0 Z" className="tre-beaker-glass" />
            <rect x="2" y="-20" width="40" height="18" rx="2" className="tre-beaker-fill" />
            {[-14, -24, -34, -44].map((yy) => (
              <line key={yy} x1="34" x2="41" y1={yy} y2={yy} className="tre-beaker-mark" />
            ))}
            <text x="22" y="-27" textAnchor="middle" className="tre-beaker-label">
              DECL
            </text>
          </g>

          {placed.map((w, i) => (
            <Weight key={`${phase}-${i}`} {...w} />
          ))}
        </g>
      </svg>

      <ol className="tre-lanes" aria-live="polite">
        {LANES.map(([id, name, copy], i) => {
          const order = ["room", "twin", "reach"];
          const at = order.indexOf(phase);
          const status = done ? (result?.error ? "skip" : "done") : at === i ? "run" : at > i ? "done" : "wait";
          return (
            <li key={id} className={`is-${status}`}>
              <span className="tre-lane-dot" />
              <div>
                <b>{name}</b>
                <p>{copy}</p>
              </div>
              <em>{status === "run" ? "running" : status === "wait" ? "waiting" : laneResult(id, result, agent)}</em>
            </li>
          );
        })}
      </ol>

      <div className="tre-declared">
        <span className="tre-panel-label is-brass">Declared · the beaker</span>
        <p>The room holds these on purpose. tare lists them, and they do not stop the run.</p>
        <ul>
          {agent.declared.map((d) => (
            <li key={d.what}>
              <b>{d.kind}</b> {d.what}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Terminal({ result, phase }) {
  const done = phase === "done";
  const lines = result ? (done ? result.lines : result.lines.slice(0, 1)) : [];
  return (
    <div className="tre-terminal">
      <div className="tre-terminal-bar">
        <i />
        <i />
        <i />
        <span>~/project</span>
      </div>
      <pre aria-live="polite">
        {lines.map((line, i) => (
          <span key={`${i}-${line.s}`} className={`tre-line is-${line.t}`} style={{ animationDelay: `${i * 28}ms` }}>
            {line.s}
            {"\n"}
          </span>
        ))}
        {!done && <span className="tre-cursor">▍</span>}
      </pre>
    </div>
  );
}

function Bench() {
  const [agentKey, setAgentKeyRaw] = useState("claude");
  const agent = AGENTS[agentKey];
  const [states, setStatesRaw] = useState(() => preset(AGENTS.claude, "clean"));
  const [lifetime, setLifetimeRaw] = useState(300);
  const [allowDirty, setAllowDirty] = useState(false);
  const [command, setCommand] = useState("probe");
  const [result, setResult] = useState(() =>
    runCommand(AGENTS.claude, preset(AGENTS.claude, "clean"), { command: "probe", lifetime: 300, allowDirty: false }),
  );
  const [phase, setPhase] = useState("done");
  const [stale, setStale] = useState(false);
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const setStates = (next) => {
    setStatesRaw(next);
    setStale(true);
  };
  const setLifetime = (next) => {
    setLifetimeRaw(next);
    setStale(true);
  };
  const setAgentKey = (key) => {
    timers.current.forEach(clearTimeout);
    const clean = preset(AGENTS[key], "clean");
    setAgentKeyRaw(key);
    setStatesRaw(clean);
    setCommand("probe");
    setResult(runCommand(AGENTS[key], clean, { command: "probe", lifetime, allowDirty }));
    setPhase("done");
    setStale(false);
  };

  const run = (cmd) => {
    timers.current.forEach(clearTimeout);
    const next = runCommand(agent, states, { command: cmd, lifetime, allowDirty });
    setCommand(cmd);
    setResult(next);
    setStale(false);
    if (reducedMotion() || next.error) {
      setPhase("done");
      return;
    }
    setPhase("room");
    timers.current = [
      setTimeout(() => setPhase("twin"), 650),
      setTimeout(() => setPhase("reach"), 1300),
      setTimeout(() => setPhase("done"), 1850),
    ];
  };

  return (
    <section className="tre-section tre-bench-section" id="probe">
      <div className="tre-section-head">
        <p className="tre-kicker">01 · the probe</p>
        <h2>Only tare: 0.00 opens the room.</h2>
        <p className="tre-lede">
          Each item of your setup can stay out, leak into the room, or hide from the dirty twin. Pick a state for each
          and run the probe. The scoring, the order of the checks and the output format follow <code>probe.py</code>.
          This page simulates the agent runs in your browser.
        </p>
      </div>

      <div className="tre-bench">
        <Setup
          agentKey={agentKey}
          setAgentKey={setAgentKey}
          states={states}
          setStates={setStates}
          lifetime={lifetime}
          setLifetime={setLifetime}
          allowDirty={allowDirty}
          setAllowDirty={setAllowDirty}
          onRun={run}
          busy={phase !== "done"}
          stale={stale}
        />
        <Instrument agent={agent} phase={phase} result={result} command={command} />
      </div>

      <Terminal result={result} phase={phase} />

      <p className="tre-note">
        The count is the number of findings, so one item can add more than one leak. The beaker on the pan holds what the
        room declares, and tare leaves it out of the count, as a scale subtracts its container. When the first dirty twin
        is blind for a kind of context, tare waits {RETRY_PAUSE} seconds and runs a second twin. The reading comes from
        the second one.
      </p>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* How it works                                                        */
/* ------------------------------------------------------------------ */

const PARTS = [
  {
    n: "A",
    title: "The room",
    body: "On Linux and WSL, tare builds the room with bubblewrap. Inside, /home is empty except for a fresh home at /home/tare that holds a copy of your login, and your project is mounted at /work. The environment is cleared down to TERM, COLORTERM, LANG and LC_ALL, plus the room's own HOME and PATH. On macOS, tare uses Seatbelt and an APFS clone of the project, and copies the run's changes back when the room closes.",
    source: "abridged from room.py",
    code: `bwrap --ro-bind /usr /usr --ro-bind /etc /etc \\
  --tmpfs /tmp --tmpfs /home \\
  --bind $ROOM /home/tare \\
  --ro-bind $(which claude) /opt/agent/claude \\
  --bind $PROJECT /work --chdir /work \\
  --unshare-user --unshare-pid --unshare-ipc \\
  --unshare-uts --die-with-parent --clearenv`,
  },
  {
    n: "B",
    title: "The fake model server",
    body: "tare points the real agent CLI at a server on 127.0.0.1. The server keeps each request body, never the headers, and answers \"ok\", so the agent ends its turn at once. That request is the context the agent assembled. Claude Code finds the server through ANTHROPIC_BASE_URL, Codex through -c openai_base_url, the Antigravity CLI through CLOUD_CODE_URL, and Pi through a provider of its own.",
    source: "agents.py, the Claude Code probe",
    code: `ANTHROPIC_BASE_URL=http://127.0.0.1:$PORT \\
ENABLE_TOOL_SEARCH=true \\
claude -p --output-format stream-json --verbose \\
  --no-session-persistence "say ok"`,
    after:
      "A custom base URL turns Claude Code's tool search off, so the probe turns it back on and sees the context in the form a normal run sends.",
  },
  {
    n: "C",
    title: "The dirty twin",
    body: "The same agent runs once more in your real setup, against the same fake server. tare reads your files to learn what you have, such as a global instructions file or a skill folder. If you have a kind of context and the twin's request lacks it, the probe could not have seen it in the room either. The idea comes from the blank run in analytical chemistry, which runs the whole procedure without a sample.",
    source: "probe.py, render(), wrapped",
    code: `  BLIND     mcp: you have it, but the dirty twin
            did not show it, so the room cannot be
            proven clean of it
tare: not proven (blind)`,
  },
  {
    n: "D",
    title: "The reach script",
    body: "A plain shell script prints which of your paths exist and which environment variables are set. Outside the room it must find your files, or its empty result inside would prove nothing. Inside, it must find none of them. On WSL it also checks /mnt/c. On macOS it checks ~/Library, /var/folders and the pasteboard.",
    source: "probe.py, REACH_SCRIPT, line breaks added",
    code: `for p in "$@"; do
  if [ -e "$p" ]; then echo "path $p"; fi
done
env | cut -d= -f1 | sed "s/^/env /"`,
  },
];

const REAL_RUN = `$ tare probe claude
tare probe · claude 2.1.289 · /home/me/tare
  control   dirty twin shows: instructions, home path, mcp, skills, plugins, email, reach
  leaks     none
  declared
    email        account email                                subscription login
    credentials  /home/tare/.claude-config/.credentials.json  copy of the login, needed by the CLI
tare: 0.00`;

const REAL_NOTES = [
  ["control", "The kinds of context the dirty twin found in the real setup. The probe could have seen each of them in the room."],
  [
    "leaks none",
    <>
      None of them reached the room. tare starts Claude Code there with <code>--strict-mcp-config</code> and{" "}
      <code>--setting-sources project,local</code>, which keep connected accounts and account skills out.
    </>,
  ],
  [
    "declared",
    "A subscription login brings the account email, and the agent needs a copy of the login to run. tare lists both and starts the run.",
  ],
];

function HowItWorks() {
  return (
    <section className="tre-section">
      <div className="tre-section-head">
        <p className="tre-kicker">02 · how it works</p>
        <h2>The probe never asks the agent.</h2>
        <p className="tre-lede">
          An agent asked about its own context can refuse or be wrong. In one test, Claude Code in a room refused to list
          the home directory and search for credential files, and called it reconnaissance. So tare records what the
          agent sends to its model, and a plain shell script looks for your files.
        </p>
      </div>

      <div className="tre-parts">
        {PARTS.map((part) => (
          <article key={part.n} className="tre-part">
            <span className="tre-part-n">{part.n}</span>
            <h3>{part.title}</h3>
            <p>{part.body}</p>
            <pre className="tre-code">
              <code>{part.code}</code>
            </pre>
            <span className="tre-source">{part.source}</span>
            {part.after && <p className="tre-after">{part.after}</p>}
          </article>
        ))}
      </div>

      <div className="tre-real">
        <div className="tre-real-head">
          <p className="tre-kicker">A real run</p>
          <p>Output from the README, with only the home path shortened.</p>
        </div>
        <pre className="tre-code is-real">
          <code>{REAL_RUN}</code>
        </pre>
        <dl className="tre-real-notes">
          {REAL_NOTES.map(([term, copy]) => (
            <div key={term}>
              <dt>{term}</dt>
              <dd>{copy}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* After the zero                                                      */
/* ------------------------------------------------------------------ */

const COMMANDS = [
  [
    "tare calibrate",
    "Starts each side, an agent with its arguments, several times from a fresh copy of the project and reports how often each passes a check, with a 95% interval.",
  ],
  [
    "tare swap",
    "Lets two agents continue each other's unfinished workspaces at several cuts, to tell whether the workspace or the agent caused a failure. At cut 0 both workspaces are untouched, so the state effect there must be zero, and Swap checks it.",
  ],
  ["tare cliff", "Restarts a failed run from its saved steps and names the step after which it no longer passes. It is experimental."],
  [
    "tare judge",
    "Scores a web page by a rubric in a room without agent or model names. One test page scored 55, 60, 58, 58, 66 and 62 in six judgements, so judge-noise refuses a threshold inside a page's own range of scores.",
  ],
];

function Measure() {
  return (
    <section className="tre-section">
      <div className="tre-section-head">
        <p className="tre-kicker">03 · then measure</p>
        <h2>Every run gets its own room.</h2>
        <p className="tre-lede">
          With the room at zero, tare compares agents. Calibrate, Swap and Cliff save each run in a directory with a
          recipe that <code>tare rerun</code> repeats, and serve a live dashboard on localhost.
        </p>
      </div>
      <div className="tre-measure">
        <ul className="tre-commands">
          {COMMANDS.map(([cmd, copy]) => (
            <li key={cmd}>
              <code>{cmd}</code>
              <p>{copy}</p>
            </li>
          ))}
        </ul>
        <div className="tre-measure-side">
          <pre className="tre-code">
            <code>{`tare calibrate "fix the failing test" \\
  --check "uv run pytest -q" \\
  --side "claude --model haiku" \\
  --side "codex -m gpt-6.1-sol" --runs 10`}</code>
          </pre>
          <span className="tre-source">README, Calibrate</span>
          <p>
            Three passes out of three still allow a true pass rate as low as 0.44. The report prints that interval next
            to every rate.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Limits, footer                                                      */
/* ------------------------------------------------------------------ */

const LIMITS = [
  ["Hostile agents", "The room has network access and a working login. It keeps your setup out of the measurement and does not protect your machine."],
  ["Antigravity on macOS", "tare does not support it there yet. Its dirty twin needs an overlay over ~/.gemini, and macOS has no overlay file system."],
  ["API-key logins", "Logins with an API key only are untested."],
  [
    "Login renewal",
    "Whether a renewal inside the room logs out your real Claude Code session is untested. Until it is, tare refuses to start when the login copy expires within the hour.",
  ],
  ["Codex hooks", "The probe cannot check them, because they did not fire in one-shot runs."],
  ["Cliff", "It found the planted step in a scripted test. In two rounds of real tasks it has not yet found a real one, so it stays experimental."],
  ["Long prompts", "tare passes the task as one argument, and Linux limits an argument to about 128 KiB."],
  ["Repeat runs", "Agent runs are not deterministic, so tare rerun with the same recipe can still come out differently."],
];

function Limits() {
  return (
    <section className="tre-section">
      <div className="tre-section-head">
        <p className="tre-kicker is-red">04 · limits</p>
        <h2>What tare leaves open.</h2>
        <p className="tre-lede">All of these come from the README and CONCEPT.md.</p>
      </div>
      <ul className="tre-limits">
        {LIMITS.map(([head, copy]) => (
          <li key={head}>
            <b>{head}</b>
            <p>{copy}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

const NEXT = [
  ["/portfolio/flock", "Flock", "agent framework"],
  ["/portfolio/atlas", "Atlas", "agent workspace"],
];

function Footer() {
  return (
    <footer className="tre-footer">
      <div className="tre-next">
        {NEXT.map(([to, title, kind]) => (
          <Link key={to} to={to} className="tre-next-card">
            <span className="tre-kicker">Portfolio · {kind}</span>
            <strong>{title}</strong>
            <em>Open →</em>
          </Link>
        ))}
      </div>
      <Link to="/#portfolio" className="tre-back">
        ← All portfolio projects
      </Link>
      <p className="tre-sources">
        Sources: the a-ratz/tare repository at commit {COMMIT} (README, CONCEPT.md, src/tare, tests) and PyPI, checked on
        13 October 2026. The probe on this page is a simulation that follows probe.py.
      </p>
    </footer>
  );
}

export default function Tare() {
  return (
    <main className="tre-shell">
      <Hero />
      <Facts />
      <Bench />
      <HowItWorks />
      <Measure />
      <Limits />
      <Footer />
    </main>
  );
}
