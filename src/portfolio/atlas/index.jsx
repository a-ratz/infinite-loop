import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ACTS, BOOT_FILES, BOOT_LINES, COMPOSER_TEXT, INSIGHTS, LAYOUT, LINKS, NOTES } from "./data/session";
import { DEMO_URL, FACTS, INSTALL, REPO_URL } from "./data/facts";
import "./styles.css";

/* ------------------------------------------------------------------ */
/* Hooks                                                               */
/* ------------------------------------------------------------------ */

function useMedia(query) {
  const [hit, setHit] = useState(() => typeof window !== "undefined" && !!window.matchMedia?.(query).matches);
  useEffect(() => {
    const m = window.matchMedia?.(query);
    if (!m) return undefined;
    const on = () => setHit(m.matches);
    on();
    m.addEventListener?.("change", on);
    return () => m.removeEventListener?.("change", on);
  }, [query]);
  return hit;
}

const useReducedMotion = () => useMedia("(prefers-reduced-motion: reduce)");

/* ------------------------------------------------------------------ */
/* Session model                                                       */
/* ------------------------------------------------------------------ */

const EVENTS = ACTS.flatMap((act, a) => act.events.map((e) => ({ ...e, act: a })));
const ACT_START = [];
const ACT_END = [];
ACTS.reduce((i, act, a) => {
  ACT_START[a] = i;
  ACT_END[a] = i + act.events.length;
  return ACT_END[a];
}, 0);
const TOTAL = EVENTS.length;
const STEM_TO_ID = Object.fromEntries(Object.entries(NOTES).map(([id, n]) => [n.stem, id]));

// Python's json.dumps spacing, the way the engine writes inbox.jsonl
const pyJson = (o) =>
  `{${Object.entries(o)
    .map(([k, v]) => `${JSON.stringify(k)}: ${JSON.stringify(v)}`)
    .join(", ")}}`;

// Everything on screen is a function of how many events have played.
function replay(count) {
  const s = {
    messages: [],
    lines: [...BOOT_LINES],
    files: new Map(BOOT_FILES.map((p) => [p, { path: p, id: null, mark: null, act: -1 }])),
    nodes: [],
    fresh: new Set(),
    moved: false,
    mapped: false,
    stamped: new Set(),
    status: "listening",
    open: null,
    act: -1,
  };

  for (let i = 0; i < count; i++) {
    const e = EVENTS[i];
    if (e.act !== s.act) {
      s.act = e.act;
      s.fresh = new Set();
    }
    switch (e.t) {
      case "user": {
        s.status = "working";
        s.messages.push({ k: "user", key: i, text: e.text, via: e.via, viewing: e.viewing });
        s.lines.push({ k: "wire", text: "→ vault/.atlas/inbox.jsonl" });
        s.lines.push({
          k: "wire",
          text: pyJson({ role: "user", kind: "message", text: e.text, context: e.viewing ?? null, via: e.via }),
        });
        s.lines.push({ k: "out", text: `USER${e.viewing ? ` [viewing: ${e.viewing}]` : ""} [via ${e.via}]: ${e.text}` });
        break;
      }
      case "progress":
        if (e.cmd) {
          s.lines.push({ k: "cmd", text: e.cmd });
          s.lines.push({ k: "out", text: e.out });
        }
        s.lines.push({ k: "cmd", text: `atlas say --agent claude --progress "${e.text}"` });
        s.messages.push({ k: "progress", key: i, text: e.text });
        break;
      case "write": {
        const n = NOTES[e.id];
        s.nodes.push(e.id);
        s.fresh.add(e.id);
        s.files.set(n.path, { path: n.path, id: e.id, mark: "new", act: e.act });
        s.lines.push({ k: "note", text: `# writes vault/${n.path}` });
        break;
      }
      case "edit":
        s.mapped = true;
        e.ids.forEach((id) => {
          const f = s.files.get(NOTES[id].path);
          if (f && f.act !== e.act) s.files.set(f.path, { ...f, mark: "edited", act: e.act });
        });
        s.lines.push({ k: "note", text: `# adds "[[longitude-map]]" to topics: in ${e.ids.length} insights` });
        break;
      case "move": {
        const n = NOTES[e.id];
        s.files.delete(n.path);
        s.files.set(n.movedTo, { path: n.movedTo, id: e.id, mark: "moved", act: e.act });
        s.moved = true;
        s.lines.push({ k: "cmd", text: `git mv vault/${n.path} vault/sources/` });
        break;
      }
      case "commit":
        s.lines.push({ k: "cmd", text: `atlas commit --agent claude -m "${e.msg}" ${e.paths.join(" ")}` });
        s.lines.push({ k: "out", text: e.out });
        e.ids.forEach((id) => s.stamped.add(id));
        break;
      case "say":
        s.lines.push({
          k: "cmd",
          text: `atlas say --agent claude${e.open ? ` --open ${NOTES[e.open].path}` : ""} - <<'EOF'`,
        });
        [e.text, ...e.block, "EOF"].forEach((text) => s.lines.push({ k: "doc", text }));
        s.messages.push({ k: "agent", key: i, text: e.text, card: e.card, list: e.list, choices: e.choices });
        if (e.open) s.open = { id: e.open, at: i + 1 };
        break;
      case "sh":
        s.lines.push({ k: "cmd", text: e.cmd });
        s.lines.push({ k: "out", text: e.out });
        break;
      case "wait":
        s.status = "listening";
        s.lines.push({ k: "cmd", text: "atlas wait --agent claude       # listening again" });
        break;
      default:
        break;
    }
  }
  return s;
}

const kindOf = (id, s) => (id === "capture" && s.moved ? "source" : NOTES[id].kind);
const pathOf = (id, s) => (id === "capture" && s.moved ? NOTES.capture.movedTo : NOTES[id].path);
const KIND_LABEL = { capture: "Capture", source: "Source", insight: "Insight", map: "Map" };

function edgesOf(s) {
  const has = new Set(s.nodes);
  const out = [];
  INSIGHTS.forEach((id) => has.has(id) && has.has("capture") && out.push({ a: id, b: "capture", k: "prov" }));
  LINKS.forEach(([a, b]) => has.has(a) && has.has(b) && out.push({ a, b, k: "link" }));
  if (has.has("map")) INSIGHTS.forEach((id) => has.has(id) && out.push({ a: "map", b: id, k: "map" }));
  return out;
}

/* ------------------------------------------------------------------ */
/* Small pieces                                                        */
/* ------------------------------------------------------------------ */

function Glyph({ kind }) {
  return (
    <svg className={`atl-glyph is-${kind}`} viewBox="0 0 12 12" aria-hidden="true">
      {kind === "map" && <path d="M6 1.2 10.8 6 6 10.8 1.2 6Z" />}
      {kind === "insight" && <circle cx="6" cy="6" r="3.6" />}
      {kind === "capture" && <circle cx="6" cy="6" r="4" strokeDasharray="1.6 1.4" />}
      {kind === "source" && <rect x="2.2" y="2.2" width="7.6" height="7.6" rx="1.4" />}
    </svg>
  );
}

// Body text with [[wikilinks]] that open the note they name.
function Rich({ text, onOpen }) {
  const parts = text.split(/(\[\[[^\]]+\]\])/g);
  return parts.map((part, i) => {
    const m = part.match(/^\[\[([^\]]+)\]\]$/);
    if (!m) return <React.Fragment key={i}>{part}</React.Fragment>;
    const id = STEM_TO_ID[m[1]];
    return (
      <button key={i} type="button" className="atl-wikilink" onClick={() => onOpen(id)}>
        {m[1]}
      </button>
    );
  });
}

/* ------------------------------------------------------------------ */
/* Hero globe                                                          */
/* ------------------------------------------------------------------ */

const GLOBE_NODES = [
  [46, -18],
  [28, 14],
  [10, -36],
  [-8, 24],
  [-30, -6],
  [6, 62],
  [58, 38],
  [-22, 48],
];
const GLOBE_EDGES = [
  [0, 1],
  [1, 2],
  [1, 3],
  [3, 4],
  [0, 6],
  [3, 5],
  [2, 4],
  [5, 7],
  [3, 7],
];

function Globe() {
  const ref = useRef(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return undefined;
    const D = Math.PI / 180;
    const tilt = -0.36;
    let w = 0;
    let h = 0;
    let phi = 0.5;
    let raf = 0;
    let last = 0;
    let visible = true;

    const fit = () => {
      const box = canvas.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = box.width;
      h = box.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const unit = (lat, lon) => [Math.cos(lat * D) * Math.sin(lon * D), Math.sin(lat * D), Math.cos(lat * D) * Math.cos(lon * D)];
    const project = ([x, y, z]) => {
      const c = Math.cos(phi);
      const sn = Math.sin(phi);
      const x1 = x * c + z * sn;
      const z1 = -x * sn + z * c;
      const y2 = y * Math.cos(tilt) - z1 * Math.sin(tilt);
      const z2 = y * Math.sin(tilt) + z1 * Math.cos(tilt);
      const r = Math.min(w, h) * 0.46;
      return [w / 2 + r * x1, h / 2 - r * y2, z2];
    };

    const stroke = (points, front, back) => {
      for (let i = 1; i < points.length; i++) {
        const p = points[i - 1];
        const q = points[i];
        const path = p[2] > 0 && q[2] > 0 ? front : back;
        path.moveTo(p[0], p[1]);
        path.lineTo(q[0], q[1]);
      }
    };

    const arc = (a, b, n = 18) => {
      const dot = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
      const om = Math.acos(Math.min(1, Math.max(-1, dot)));
      const out = [];
      for (let i = 0; i <= n; i++) {
        const t = i / n;
        const k1 = Math.sin((1 - t) * om) / Math.sin(om);
        const k2 = Math.sin(t * om) / Math.sin(om);
        out.push([a[0] * k1 + b[0] * k2, a[1] * k1 + b[1] * k2, a[2] * k1 + b[2] * k2]);
      }
      return out;
    };

    const nodes = GLOBE_NODES.map(([la, lo]) => unit(la, lo));
    const arcs = GLOBE_EDGES.map(([a, b]) => arc(nodes[a], nodes[b]));

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const r = Math.min(w, h) * 0.46;
      const glow = ctx.createRadialGradient(w / 2 - r * 0.3, h / 2 - r * 0.35, r * 0.1, w / 2, h / 2, r * 1.1);
      glow.addColorStop(0, "rgba(255,122,89,0.10)");
      glow.addColorStop(1, "rgba(255,122,89,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2);
      ctx.fill();

      const front = new Path2D();
      const back = new Path2D();
      for (let lon = -180; lon < 180; lon += 20) {
        const pts = [];
        for (let lat = -90; lat <= 90; lat += 5) pts.push(project(unit(lat, lon)));
        stroke(pts, front, back);
      }
      for (let lat = -60; lat <= 60; lat += 20) {
        const pts = [];
        for (let lon = -180; lon <= 180; lon += 5) pts.push(project(unit(lat, lon)));
        stroke(pts, front, back);
      }
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(239,231,218,0.05)";
      ctx.stroke(back);
      ctx.strokeStyle = "rgba(255,122,89,0.26)";
      ctx.stroke(front);

      ctx.beginPath();
      ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,122,89,0.45)";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      const linkFront = new Path2D();
      const linkBack = new Path2D();
      arcs.forEach((a) => stroke(a.map(project), linkFront, linkBack));
      ctx.lineWidth = 1.4;
      ctx.strokeStyle = "rgba(239,231,218,0.08)";
      ctx.stroke(linkBack);
      ctx.strokeStyle = "rgba(239,231,218,0.7)";
      ctx.stroke(linkFront);

      nodes.forEach((n, i) => {
        const [x, y, z] = project(n);
        if (z <= 0) return;
        const size = (i === 3 ? 5.5 : 3.2) * (0.6 + z * 0.4);
        ctx.beginPath();
        if (i === 3) {
          ctx.moveTo(x, y - size);
          ctx.lineTo(x + size, y);
          ctx.lineTo(x, y + size);
          ctx.lineTo(x - size, y);
          ctx.closePath();
          ctx.fillStyle = "#ff7a59";
          ctx.shadowColor = "rgba(255,122,89,0.9)";
          ctx.shadowBlur = 16;
        } else {
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fillStyle = "#efe7da";
          ctx.shadowColor = "rgba(239,231,218,0.6)";
          ctx.shadowBlur = 8;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      });
    };

    const tick = (now) => {
      if (last) phi += (now - last) * 0.00009;
      last = now;
      draw();
      raf = visible ? requestAnimationFrame(tick) : 0;
    };

    fit();
    draw();
    const ro = new ResizeObserver(() => {
      fit();
      draw();
    });
    ro.observe(canvas);
    let io;
    if (!reduce) {
      io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !raf) {
          last = 0;
          raf = requestAnimationFrame(tick);
        }
      });
      io.observe(canvas);
      raf = requestAnimationFrame(tick);
    }
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io?.disconnect();
    };
  }, [reduce]);

  return <canvas ref={ref} className="atl-globe" aria-hidden="true" />;
}

/* ------------------------------------------------------------------ */
/* Hero, facts                                                         */
/* ------------------------------------------------------------------ */

function Hero() {
  return (
    <header className="atl-hero">
      <div className="atl-hero-art">
        <Globe />
      </div>
      <div className="atl-hero-text">
        <p className="atl-kicker">Portfolio · agent workspace</p>
        <h1>
          Atlas<span>.</span>
        </h1>
        <p className="atl-epigraph">“Grow a knowledge vault by talking to your agents. Read it like a book.”</p>
        <p className="atl-claim">
          A local web app where Claude Code, Codex or any other agent grows a Markdown knowledge vault while you read
          along.
        </p>
        <p className="atl-intro">
          You ask a question in the chat. Your agent researches it and writes the findings to a capture. It then
          distills the capture into insights, one claim per note, and links them into maps. The pages show up in your
          browser as the files land, and every note is a Markdown file in your own git repository.
        </p>
        <div className="atl-chips">
          <a className="atl-chip is-solid" href={DEMO_URL} target="_blank" rel="noreferrer">
            Live demo <span aria-hidden="true">↗</span>
          </a>
          <a className="atl-chip" href={REPO_URL} target="_blank" rel="noreferrer">
            GitHub · a-ratz/atlas <span aria-hidden="true">↗</span>
          </a>
          <code className="atl-chip is-code">
            <span aria-hidden="true">$</span> {INSTALL}
          </code>
        </div>
      </div>
    </header>
  );
}

function Facts() {
  return (
    <section className="atl-facts" aria-label="Facts from the repository">
      {FACTS.map((f) => (
        <div key={f.label} className="atl-fact">
          <span>{f.label}</span>
          <strong>{f.value}</strong>
          <p>{f.note}</p>
        </div>
      ))}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Session: chat                                                       */
/* ------------------------------------------------------------------ */

const DISABLED_HINT = "Not part of this replay";

function NoteCard({ id, s, waiting, applied, onAct, onOpen }) {
  const kind = kindOf(id, s);
  const n = NOTES[id];
  const moves =
    kind === "capture"
      ? [
          { label: "Distill into insights", act: 1 },
          { label: "Next research avenues" },
          { label: "Dig deeper" },
        ]
      : kind === "map"
        ? [{ label: "What's missing?" }, { label: "Next research avenues" }]
        : kind === "source"
          ? [{ label: "Research further" }]
          : [];
  return (
    <div className={`atl-card is-${kind}`}>
      <button type="button" className="atl-card-open" onClick={() => onOpen(id)}>
        <span className="atl-card-kind">
          <Glyph kind={kind} />
          {KIND_LABEL[kind]}
        </span>
        <span className="atl-card-title">{n.title}</span>
        <span className="atl-card-path">{pathOf(id, s)}</span>
      </button>
      {moves.length > 0 && (
        <div className="atl-moves" role="group" aria-label="Your move">
          {moves.map((m) => {
            const live = m.act != null && waiting === m.act;
            const sent = m.act != null && applied > ACT_START[m.act];
            return (
              <button
                key={m.label}
                type="button"
                className={`atl-move ${live ? "is-live" : ""} ${sent ? "is-sent" : ""}`}
                disabled={!live}
                title={live ? undefined : m.act != null ? undefined : DISABLED_HINT}
                onClick={() => onAct(m.act)}
              >
                {m.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Message({ m, s, waiting, applied, onAct, onOpen }) {
  if (m.k === "user") {
    return (
      <div className="atl-msg is-user">
        <span className="atl-msg-meta">
          via {m.via}
          {m.viewing ? ` · viewing ${m.viewing.split("/").pop()}` : ""}
        </span>
        <p>{m.text}</p>
      </div>
    );
  }
  if (m.k === "progress") {
    return (
      <div className="atl-progress">
        <i aria-hidden="true" />
        {m.text}
      </div>
    );
  }
  return (
    <div className="atl-msg is-agent">
      <span className="atl-avatar" aria-hidden="true">
        Cl
      </span>
      <div className="atl-msg-body">
        <span className="atl-msg-meta">Claude</span>
        <p>{m.text}</p>
        {m.card && <NoteCard id={m.card} s={s} waiting={waiting} applied={applied} onAct={onAct} onOpen={onOpen} />}
        {m.list && (
          <ul className="atl-notelist">
            {m.list.map((id) => (
              <li key={id}>
                <button type="button" onClick={() => onOpen(id)}>
                  <Glyph kind={kindOf(id, s)} />
                  <span>{NOTES[id].title}</span>
                  <em>{NOTES[id].confidence}</em>
                </button>
              </li>
            ))}
          </ul>
        )}
        {m.choices && (
          <div className="atl-choices" role="group" aria-label="What next?">
            <span className="atl-choices-title">What next?</span>
            {m.choices.map((c) => {
              const live = c.act != null && waiting === c.act;
              const sent = c.act != null && applied > ACT_START[c.act];
              return (
                <button
                  key={c.label}
                  type="button"
                  className={`atl-choice ${live ? "is-live" : ""} ${sent ? "is-sent" : ""}`}
                  disabled={!live}
                  title={c.act == null ? DISABLED_HINT : undefined}
                  onClick={() => onAct(c.act)}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function Chat({ s, waiting, applied, running, done, onAct, onOpen, onRestart }) {
  const logRef = useRef(null);
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [s.messages.length, s.status]);

  return (
    <section className="atl-panel atl-chat" aria-label="Atlas chat">
      <header className="atl-panel-head">
        <span className="atl-panel-title">Operator</span>
        <span className={`atl-agent is-${s.status}`}>
          <span className="atl-avatar is-small" aria-hidden="true">
            Cl
          </span>
          Claude <i aria-hidden="true" />
          <em>{s.status}</em>
        </span>
      </header>

      <div className="atl-chat-log" ref={logRef} role="log" aria-live="polite" aria-label="Chat messages">
        {s.messages.length === 0 && (
          <p className="atl-chat-empty">
            Claude is listening. In Atlas, <code>/</code> lists the commands; <code>/learn</code> starts a research run.
          </p>
        )}
        {s.messages.map((m) => (
          <Message key={m.key} m={m} s={s} waiting={waiting} applied={applied} onAct={onAct} onOpen={onOpen} />
        ))}
        {s.status === "working" && (
          <div className="atl-typing">
            <i aria-hidden="true" />
            Claude is working…
          </div>
        )}
      </div>

      <div className="atl-composer">
        {waiting === 0 ? (
          <>
            <div className="atl-input" aria-hidden="true">
              <span className="atl-input-cmd">/learn</span> {COMPOSER_TEXT.replace("/learn ", "")}
            </div>
            <button type="button" className="atl-send" onClick={() => onAct(0)}>
              Send <span aria-hidden="true">↵</span>
            </button>
          </>
        ) : done ? (
          <>
            <p className="atl-composer-note">End of the replay. With Atlas installed, your own agent answers here.</p>
            <button type="button" className="atl-send is-ghost" onClick={onRestart}>
              Replay
            </button>
          </>
        ) : (
          <p className="atl-composer-note">
            {running ? "The agent is working. Watch the vault fill." : "Your move: use the button in the chat."}
          </p>
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Session: vault graph, files, shell                                  */
/* ------------------------------------------------------------------ */

function VaultGraph({ s, shown, narrow, onOpen }) {
  const L = narrow ? LAYOUT.narrow : LAYOUT.wide;
  const edges = edgesOf(s);
  const at = (id) => L.at[id];
  const keyOpen = (id) => (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpen(id);
    }
  };

  return (
    <section className="atl-panel atl-graph" aria-label="The vault as a graph">
      <header className="atl-panel-head">
        <span className="atl-panel-title">vault/</span>
        <span className="atl-graph-count">
          {s.nodes.length} notes · {edges.length} links
        </span>
        <span className="atl-legend" aria-hidden="true">
          <span>
            <Glyph kind="insight" /> insight
          </span>
          <span>
            <Glyph kind="map" /> map
          </span>
          <span>
            <Glyph kind="capture" /> capture
          </span>
        </span>
      </header>
      <div className="atl-graph-stage">
        <svg viewBox={`0 0 ${L.w} ${L.h}`} className="atl-graph-svg" role="group" aria-label="Notes and their links">
          <g className="atl-graticule" aria-hidden="true">
            {[0.18, 0.36, 0.54, 0.72].map((f) => (
              <ellipse key={f} cx={L.w / 2} cy={L.h / 2} rx={L.w * f} ry={L.h * 0.62} />
            ))}
            {[0.25, 0.5, 0.75].map((f) => (
              <line key={f} x1={0} x2={L.w} y1={L.h * f} y2={L.h * f} />
            ))}
          </g>
          {edges.map(({ a, b, k }) => {
            const [x1, y1] = at(a);
            const [x2, y2] = at(b);
            return (
              <line
                key={`${a}-${b}-${k}`}
                className={`atl-edge is-${k}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                pathLength="1"
              />
            );
          })}
          {s.nodes.map((id) => {
            const [x, y] = at(id);
            const kind = kindOf(id, s);
            const n = NOTES[id];
            const label = id === "capture" && s.moved ? "source" : n.short;
            return (
              <g
                key={id}
                className={`atl-node is-${kind} ${s.fresh.has(id) ? "is-fresh" : ""} ${shown === id ? "is-shown" : ""}`}
                transform={`translate(${x} ${y})`}
                role="button"
                tabIndex={0}
                aria-label={`${KIND_LABEL[kind]}: ${n.title}`}
                onClick={() => onOpen(id)}
                onKeyDown={keyOpen(id)}
              >
                <g className="atl-node-in">
                  <circle className="atl-node-hit" r="22" />
                  <circle className="atl-node-ring" r={kind === "map" ? 19 : 14} />
                  {kind === "map" && <path className="atl-node-shape" d="M0 -12 12 0 0 12 -12 0Z" />}
                  {kind === "insight" && (
                    <circle className={`atl-node-shape is-${n.confidence}`} r={n.confidence === "speculative" ? 6 : 7} />
                  )}
                  {(kind === "capture" || kind === "source") && <circle className="atl-node-shape" r="9" />}
                  <text className="atl-node-label" y={kind === "map" ? 30 : 24} textAnchor="middle">
                    {label}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
        {s.nodes.length === 0 && (
          <p className="atl-graph-empty">
            An empty vault.
            <br />
            Send the question and watch it fill.
          </p>
        )}
      </div>
    </section>
  );
}

const FOLDERS = ["agents", "captures", "insights", "sources"];
const MARK = { new: "+", edited: "~", moved: "→" };

function FileTree({ s, onOpen }) {
  const files = [...s.files.values()];
  const root = files.filter((f) => !f.path.includes("/"));
  return (
    <section className="atl-panel atl-files" aria-label="Files in the vault">
      <header className="atl-panel-head">
        <span className="atl-panel-title">Files</span>
        <span className="atl-panel-sub">plain Markdown</span>
      </header>
      <ul className="atl-tree">
        <li className="atl-tree-dir">vault/</li>
        {root.map((f) => (
          <li key={f.path} className="atl-tree-file is-root">
            <span>{f.path}</span>
          </li>
        ))}
        {FOLDERS.map((dir) => {
          const inside = files.filter((f) => f.path.startsWith(`${dir}/`));
          return (
            <React.Fragment key={dir}>
              <li className="atl-tree-dir is-sub">
                {dir}/{inside.length === 0 && <em> empty</em>}
              </li>
              {inside.map((f) => {
                const fresh = f.mark && f.act === s.act;
                const name = f.path.slice(dir.length + 1);
                return (
                  <li key={f.path} className={`atl-tree-file ${fresh ? `is-${f.mark}` : ""}`}>
                    {f.id ? (
                      <button type="button" onClick={() => onOpen(f.id)} title={f.path}>
                        <span className="atl-tree-name">{name}</span>
                      </button>
                    ) : (
                      <span className="atl-tree-name">{name}</span>
                    )}
                    {fresh && (
                      <b className="atl-tree-mark" title={f.mark}>
                        {MARK[f.mark]}
                      </b>
                    )}
                  </li>
                );
              })}
            </React.Fragment>
          );
        })}
      </ul>
    </section>
  );
}

function Shell({ lines }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines.length]);
  return (
    <section className="atl-panel atl-shell-panel" aria-label="What the agent runs">
      <header className="atl-panel-head">
        <span className="atl-panel-title">Agent shell</span>
        <span className="atl-panel-sub">Claude Code, in the Atlas folder</span>
      </header>
      <div className="atl-term" ref={ref} tabIndex={0} aria-label="Agent shell output">
        {lines.map((l, i) => (
          <div key={i} className={`atl-line is-${l.k}`}>
            {l.k === "cmd" && <span className="atl-prompt">$ </span>}
            {l.text}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Session: the reader                                                 */
/* ------------------------------------------------------------------ */

const PENDING =
  "Pending capture: raw research, not yet knowledge. Its claims become insights once they are distilled and traced to a source.";
const SPECULATIVE = "Speculative: a claim we are willing to defend, not settled.";
const SCALE = ["speculative", "working", "proven"];

function frontOf(id, s) {
  const n = NOTES[id];
  const stamp = s.stamped.has(id)
    ? [
        ["created_by", "claude"],
        ["updated_by", "claude"],
      ]
    : [];
  if (n.kind === "capture") return [...n.front, ...stamp];
  if (n.kind === "map") return [["description", n.description], ...stamp];
  return [
    ["description", n.description],
    ["category", n.category],
    ["confidence", n.confidence],
    ["source", NOTES.capture.stem],
    ["topics", s.mapped ? '["[[longitude-map]]"]' : "[]"],
    ...stamp,
  ];
}

function Body({ blocks, onOpen }) {
  return blocks.map((b, i) => {
    if (b.h) return <h4 key={i}>{b.h}</h4>;
    if (b.p) return <p key={i}>{b.p}</p>;
    if (b.quote)
      return (
        <blockquote key={i}>
          <p>“{b.quote}”</p>
          <cite>
            <Rich text={`[[${NOTES.capture.stem}]]`} onOpen={onOpen} />
          </cite>
        </blockquote>
      );
    if (b.li)
      return (
        <ul key={i}>
          {b.li.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      );
    if (b.ol)
      return (
        <ol key={i}>
          {b.ol.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ol>
      );
    if (b.links)
      return (
        <ul key={i} className="atl-linklist">
          {b.links.map(([id, why]) => (
            <li key={id}>
              <Rich text={`[[${NOTES[id].stem}]]`} onOpen={onOpen} /> — {why}
            </li>
          ))}
        </ul>
      );
    return null;
  });
}

function Book({ id, s, onOpen, titleRef }) {
  if (!id) {
    return (
      <div className="atl-book is-empty">
        <div className="atl-page">
          <p className="atl-page-kicker">The reader</p>
          <p className="atl-book-empty">
            Nothing to read yet. Send the question in the chat; the first note opens here, and so does any note you
            click.
          </p>
        </div>
      </div>
    );
  }

  const n = NOTES[id];
  const kind = kindOf(id, s);
  const path = pathOf(id, s);
  const isInsight = kind === "insight";
  const level = isInsight ? SCALE.indexOf(n.confidence) : -1;
  const inMap = isInsight && s.nodes.includes("map");
  const banner = kind === "capture" ? PENDING : isInsight && n.confidence === "speculative" ? SPECULATIVE : null;
  const sourceKind = kindOf("capture", s);

  return (
    <article className="atl-book" aria-label={`Reader: ${n.title}`}>
      <div className="atl-page is-verso">
        <p className="atl-page-kicker">
          The reader <span>vault/{path}</span>
        </p>
        <div className="atl-meta">
          <span className={`atl-badge is-${kind}`}>
            <Glyph kind={kind} />
            {KIND_LABEL[kind]}
          </span>
          {n.category && <span>{n.category}</span>}
          {isInsight && <span className="atl-badge is-plain">{n.confidence}</span>}
          {s.stamped.has(id) && <span className="atl-badge is-by">created by claude</span>}
        </div>
        <h3 ref={titleRef} tabIndex={-1} className={n.title.length > 70 ? "is-long" : ""}>
          {n.title}
        </h3>
        {n.description && <p className="atl-desc">{n.description}</p>}
        {n.question && (
          <p className="atl-question">
            <span>Question</span>
            {n.question}
          </p>
        )}
        {banner && <p className="atl-banner">{banner}</p>}

        {isInsight && (
          <div className="atl-trust" aria-label="How far to trust this">
            <div className="atl-meter" aria-hidden="true">
              {SCALE.map((v, i) => (
                <span key={v} className={i <= level ? "is-on" : ""} />
              ))}
            </div>
            <div className="atl-meter-labels">
              {SCALE.map((v) => (
                <span key={v} className={v === n.confidence ? "is-cur" : ""}>
                  {v}
                </span>
              ))}
            </div>
            <ul>
              <li>Traces back to a source</li>
              {inMap && <li>Part of the map Longitude map</li>}
              {s.stamped.has(id) && <li className="is-pen">Last changed by Claude</li>}
            </ul>
          </div>
        )}

        {isInsight && (
          <ol className="atl-chain" aria-label="Provenance">
            <li>
              <span>{KIND_LABEL[sourceKind]}</span>
              <button type="button" onClick={() => onOpen("capture")}>
                {NOTES.capture.title}
              </button>
            </li>
            <li className="is-here">
              <span>this insight</span>
              {n.title}
            </li>
            {inMap && (
              <li>
                <span>map</span>
                <button type="button" onClick={() => onOpen("map")}>
                  Longitude map
                </button>
              </li>
            )}
          </ol>
        )}

        <pre className="atl-front" aria-label="Frontmatter">
          {"---\n"}
          {frontOf(id, s)
            .map(([k, v]) => `${k}: ${v}`)
            .join("\n")}
          {"\n---"}
        </pre>
      </div>

      <div className="atl-page is-recto">
        <div className="atl-prose">
          <Body blocks={n.body} onOpen={onOpen} />
          {isInsight && (
            <div className="atl-foot">
              <p>
                Source: <Rich text={`[[${NOTES.capture.stem}]]`} onOpen={onOpen} />
              </p>
              {n.related.length > 0 && (
                <>
                  <p>Relevant insights:</p>
                  <ul className="atl-linklist">
                    {n.related.map(([rid, why]) => (
                      <li key={rid}>
                        <Rich text={`[[${NOTES[rid].stem}]]`} onOpen={onOpen} /> — {why}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
        </div>
        <p className="atl-folio">{path.split("/").pop()}</p>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Session                                                             */
/* ------------------------------------------------------------------ */

function Session() {
  const reduce = useReducedMotion();
  const narrow = useMedia("(max-width: 640px)");
  const [applied, setApplied] = useState(0);
  const [target, setTarget] = useState(0);
  const [running, setRunning] = useState(false);
  const [picked, setPicked] = useState(null);
  const bookRef = useRef(null);
  const titleRef = useRef(null);

  const s = useMemo(() => replay(applied), [applied]);

  useEffect(() => {
    if (!running) return undefined;
    if (applied >= target) {
      setRunning(false);
      return undefined;
    }
    const id = setTimeout(() => setApplied((a) => a + 1), reduce ? 0 : EVENTS[applied].ms);
    return () => clearTimeout(id);
  }, [running, applied, target, reduce]);

  const waiting = running ? null : ACT_START.indexOf(applied);
  const done = !running && applied === TOTAL;
  const current = running ? EVENTS[applied]?.act ?? ACTS.length - 1 : waiting >= 0 ? waiting : null;

  const start = (a) => {
    if (running || applied !== ACT_START[a]) return;
    if (reduce) {
      setApplied(ACT_END[a]);
      return;
    }
    setTarget(ACT_END[a]);
    setRunning(true);
  };

  const skip = () => {
    setApplied(target);
    setRunning(false);
  };

  const restart = () => {
    setRunning(false);
    setApplied(0);
    setTarget(0);
    setPicked(null);
  };

  // The note on the open page: whatever the reader clicked last, unless the agent opened one since.
  const shown = s.open && (!picked || s.open.at > picked.at) ? s.open.id : picked?.id ?? null;
  const visible = shown && s.nodes.includes(shown) ? shown : null;

  const open = (id) => {
    if (!id || !s.nodes.includes(id)) return;
    setPicked({ id, at: applied });
    requestAnimationFrame(() => {
      titleRef.current?.focus({ preventScroll: true });
      bookRef.current?.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
    });
  };

  return (
    <section className="atl-section atl-session" id="atl-session">
      <div className="atl-section-head">
        <p className="atl-kicker">01 · a session, replayed</p>
        <h2>Watch a vault grow from one question.</h2>
        <p className="atl-lede">
          This replay follows the three workflows Atlas gives its agents: learn, distill, map. Send the question, then
          press the buttons Atlas would show you. The chat shows what you would see in the browser, and the shell shows
          what the agent runs. Click any note to read it below.
        </p>
      </div>

      <div className="atl-steps" role="group" aria-label="Replay progress">
        <ol>
          {ACTS.map((act, a) => {
            const state = applied >= ACT_END[a] ? "is-done" : current === a ? "is-now" : "";
            return (
              <li key={act.id} className={state}>
                <b>{String(a + 1).padStart(2, "0")}</b>
                <span>{act.label}</span>
                {current === a && !running && <em>{act.hint}</em>}
                {current === a && running && <em>running</em>}
              </li>
            );
          })}
        </ol>
        <div className="atl-steps-actions">
          {running && (
            <button type="button" onClick={skip}>
              Skip ahead
            </button>
          )}
          <button type="button" onClick={restart} disabled={applied === 0}>
            Restart
          </button>
        </div>
      </div>

      <div className="atl-board">
        <Chat
          s={s}
          waiting={waiting}
          applied={applied}
          running={running}
          done={done}
          onAct={start}
          onOpen={open}
          onRestart={restart}
        />
        <VaultGraph s={s} shown={visible} narrow={narrow} onOpen={open} />
        <div className="atl-lower">
          <FileTree s={s} onOpen={open} />
          <Shell lines={s.lines} />
        </div>
      </div>

      <div ref={bookRef} className="atl-book-wrap">
        <Book key={visible || "none"} id={visible} s={s} onOpen={open} titleRef={titleRef} />
      </div>

      <p className="atl-note">
        A scripted replay. The commands, what they print, the inbox record and the note formats follow the
        repository's skills and engine. The topic, the note texts and the commit hashes were written for this page. The{" "}
        <a href={DEMO_URL} target="_blank" rel="noreferrer">
          live demo
        </a>{" "}
        runs the real Atlas front end on a recorded session.
      </p>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* How it works, limits                                                */
/* ------------------------------------------------------------------ */

const HOW = [
  {
    n: "i",
    title: "The chat is two files.",
    body: (
      <>
        The browser appends your message to <code>vault/.atlas/inbox.jsonl</code>. The agent runs{" "}
        <code>atlas.py wait</code>, which blocks until a new line arrives, and answers with <code>atlas.py say</code>,
        which appends to <code>outbox.jsonl</code>. Any harness that can run a command can drive Atlas. Claude Code runs{" "}
        <code>wait</code> as a background task; Codex and pi run it in the foreground with a timeout.
      </>
    ),
    code: `$ uv run --no-project engine/atlas.py wait --agent claude
USER [viewing: captures/2026-10-13-longitude-at-sea.md] [via move]: Distill this capture into insights
$ uv run --no-project engine/atlas.py say --agent claude --progress "Checking each figure against its source"`,
  },
  {
    n: "ii",
    title: "A registry decides what a note is.",
    body: (
      <>
        <code>vault/atlas.yaml</code> maps folders to kinds of note. For each kind it sets the fields a page shows, the
        checks the frontmatter must pass and the buttons the page offers. A new kind of note is a few lines of YAML; the
        app needs no code change.
      </>
    ),
    code: `- id: capture
  globs: ["captures/*.md"]
  fields: [kind, project, source_type, question, date]
  moves:
    - {label: "⚗️ Distill into insights", send: "Distill this capture into insights"}`,
  },
  {
    n: "iii",
    title: "Every note says who wrote it.",
    body: (
      <>
        <code>atlas.py commit --agent claude</code> commits only the paths it is given. It writes{" "}
        <code>created_by</code> and <code>updated_by</code> into each note's frontmatter, adds an{" "}
        <code>Atlas-Agent</code> trailer to the commit, and refuses to run while unrelated changes are staged. The home
        feed reads the author from that trailer.
      </>
    ),
    code: `$ uv run --no-project engine/atlas.py commit --agent claude \\
    -m "distill: longitude-at-sea" vault/insights vault/captures vault/sources
committed 9c03d5e as claude: 3 path(s)`,
  },
  {
    n: "iv",
    title: "The checks can fail.",
    body: (
      <>
        <code>atlas.py check</code> lists broken links, frontmatter that breaks the registry's rules and insights linked
        to nothing, and exits with status 1 if it finds any. The distill workflow runs it before each commit, and{" "}
        <code>atlas.py next</code> turns the vault's state into suggestions the agent offers as buttons.
      </>
    ),
    code: `$ uv run --no-project engine/atlas.py check
insights/harrison-h4-kept-time-at-sea.md: links to [[harrison-h4]], which matches no note
insights/harrison-h4-kept-time-at-sea.md: description has 163 characters (max 150)
1 note(s) need a fix`,
  },
];

function HowItWorks() {
  return (
    <section className="atl-section atl-how">
      <div className="atl-section-head">
        <p className="atl-kicker">02 · how it works</p>
        <h2>The agent and the page share nothing but files.</h2>
        <p className="atl-lede">
          The engine is one Python file that serves the vault on localhost and reads it live. Agents work through
          commands, and everything they leave behind is Markdown in git.
        </p>
      </div>
      <div className="atl-how-grid">
        {HOW.map((h) => (
          <article key={h.n} className="atl-how-card">
            <span className="atl-numeral">{h.n}</span>
            <h3>{h.title}</h3>
            <p>{h.body}</p>
            <pre>
              <code>{h.code}</code>
            </pre>
          </article>
        ))}
      </div>
    </section>
  );
}

const LIMITS = [
  "Single user and local-first. For a team wiki with permissions or live co-editing, the README says to look elsewhere.",
  "No login. The server binds to 127.0.0.1 and refuses writes that lack its own request header. Another device reaches it over an SSH tunnel or Tailscale.",
  "Attribution is declared, not authenticated. commit stamps the agent id it is given, as long as agents/ holds a file for that id.",
  "One vault per server, and “since you were last here” is kept per browser.",
  "Listening in the foreground, the mode Codex and pi use, is not yet verified end to end.",
  "Not built yet, by decision: opt-in packs of heavier knowledge-graph tooling, hard enforcement of group rules, and workflows for specs and revisits.",
  "The live demo has no agent behind it. Its chat replays a recorded session and answers anything else with a canned reply.",
];

function Limits() {
  return (
    <section className="atl-section atl-limits">
      <div className="atl-section-head">
        <p className="atl-kicker is-warn">03 · limits</p>
        <h2>What Atlas does not do yet.</h2>
        <p className="atl-lede">
          Taken from the README's status section, the operator skill and the engine, as of version 0.6.1.
        </p>
      </div>
      <ul className="atl-limit-list">
        {LIMITS.map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Atlas() {
  return (
    <main className="atl-shell">
      <Hero />
      <Facts />
      <Session />
      <HowItWorks />
      <Limits />

      <section className="atl-section atl-next">
        <p className="atl-kicker">More in the portfolio</p>
        <div className="atl-next-grid">
          <Link to="/portfolio/flock" className="atl-next-card is-flock">
            <span>agent framework</span>
            <strong>Flock</strong>
            <em>Open →</em>
          </Link>
          <Link to="/portfolio/tare" className="atl-next-card is-tare">
            <span>eval tooling</span>
            <strong>Tare</strong>
            <em>Open →</em>
          </Link>
        </div>
        <Link to={{ pathname: "/", hash: "#portfolio" }} className="atl-back">
          ← All portfolio projects
        </Link>
      </section>

      <footer className="atl-footer">
        <p>
          Sources: the public repository{" "}
          <a href={REPO_URL} target="_blank" rel="noreferrer">
            a-ratz/atlas
          </a>{" "}
          (README, AGENTS.md, the workflow skills, <code>engine/atlas.py</code>, <code>vault/atlas.yaml</code>) at
          version 0.6.1, read on 13 October 2026.
        </p>
      </footer>
    </main>
  );
}
