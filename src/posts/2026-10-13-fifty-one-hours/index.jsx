import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import prsData from "./data/prs.json";
import messagesData from "./data/messages.json";
import "./styles.css";

/* ------------------------------------------------------------------ */
/* Time                                                                */
/* ------------------------------------------------------------------ */

const START = Date.parse("2026-10-10T08:34:00Z"); // Sat 10:34 CEST, the loop starts
const END = Date.parse("2026-10-12T11:41:00Z"); // Mon 13:41 CEST, #634 merged at 13:40
const SPAN = END - START;
const HOUR = 3600 * 1000;

const clock = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Berlin",
});
const fmt = (t) => clock.format(new Date(t)).replace(",", "");

function elapsed(t) {
  const m = Math.max(0, Math.round((t - START) / 60000));
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

const PRS = prsData.map((p) => ({ ...p, at: Date.parse(p.merged), from: Date.parse(p.opened) }));
const MSGS = messagesData.map((m) => ({ ...m, at: Date.parse(m.t) }));
const BY_NUMBER = Object.fromEntries(PRS.map((p) => [p.n, p]));

const GAP = { from: Date.parse("2026-10-10T22:20:11Z"), to: Date.parse("2026-10-11T08:16:50Z") };
const EPIC = { from: Date.parse("2026-10-11T11:58:00Z"), to: Date.parse("2026-10-12T01:52:00Z") };
const QUOTA_OUT = Date.parse("2026-10-11T20:01:00Z");
const NIGHTS = [
  { from: Date.parse("2026-10-10T20:00:00Z"), to: Date.parse("2026-10-11T05:00:00Z") },
  { from: Date.parse("2026-10-11T20:00:00Z"), to: Date.parse("2026-10-12T05:00:00Z") },
];

const LANES = [
  { id: "human", label: "me", y: 46 },
  { id: "main", label: "main", y: 118 },
  { id: "ui-rework", label: "ui-rework", y: 172 },
  { id: "stacked", label: "stacked", y: 226 },
];
const LANE_Y = Object.fromEntries(LANES.map((l) => [l.id, l.y]));

const RULES = [
  {
    pr: 619,
    title: "Slow the live check down on purpose",
    body: "Some rendering errors show only when an API answers slowly, so live checks delay the graph API by four seconds.",
  },
  {
    pr: 625,
    title: "Three rounds, then decide",
    body: "If every review round answers a heuristic fix with new edge cases, the missing piece is information, not code. After about three rounds the loop rejects the rest with a reason and merges.",
  },
  {
    pr: 624,
    title: "Check the lifecycle, not the happy path",
    body: "A fix that starts a background thread is reviewed for how that thread starts, fails and stops. Along the way, exporting 20,000 spans to DuckDB went from 174 to 23 seconds.",
  },
  {
    pr: 626,
    title: "Simulated means labelled",
    body: "Screenshots made with a simulated model show the values the text beside them reports as measured, and say that they are simulated.",
  },
  {
    pr: 628,
    title: "Spans off is not propagation off",
    body: "Turning off a framework's own request spans must not turn off trace-context propagation.",
  },
].map((r) => ({ ...r, at: BY_NUMBER[r.pr]?.at ?? END }));

const GAPS = [
  ["Lint", "does not block a merge yet."],
  ["Coverage", "the gate sits at 75 percent."],
  ["Stacked pull requests", "ran without CI."],
  ["Open recommendations", "a few pull requests were merged with them."],
  ["Human approval", "no pull request had one. Fine for our own repo over a weekend, not how I would run client work. There a technical lead approves every PR, and key users accept every process."],
];

const LESSONS = [
  ["The bottleneck is acceptance, not code generation.", "The agent produced more than I could have read line by line. What scaled was reviewing checks, decisions and evidence."],
  ["Write the checks before you write the prompt.", "A rule that is not executable is a wish."],
  ["Use a second model as reviewer.", "One that reads beyond the diff, with a round cap."],
  ["Batch the human decisions.", "A decision log beats a stream of interruptions, for you and for the agent."],
  ["Name your gaps before anyone asks.", "Somebody will find them. Better that it is you."],
];

const FEATURED = [602, 604, 619, 625, 624, 461, 634].filter((n) => BY_NUMBER[n]);

/* ------------------------------------------------------------------ */
/* Tape                                                                */
/* ------------------------------------------------------------------ */

const W = 1200;
const H = 268;
const X0 = 92;
const X1 = W - 24;
const xOf = (t) => X0 + ((t - START) / SPAN) * (X1 - X0);
const tOf = (x) => START + ((Math.min(X1, Math.max(X0, x)) - X0) / (X1 - X0)) * SPAN;
const radius = (p) => 3 + Math.min(8, Math.log10(p.add + p.del + 1) * 2.1);

const TICKS = (() => {
  const out = [];
  // every six hours on the Berlin clock: 00, 06, 12, 18 CEST = 22, 04, 10, 16 UTC
  let t = Date.parse("2026-10-10T10:00:00Z");
  while (t <= END) {
    if (t >= START) out.push(t);
    t += 6 * HOUR;
  }
  return out;
})();

function Tape({ t, setT, playing, setPlaying, selected, onSelect }) {
  const svgRef = useRef(null);
  const [hover, setHover] = useState(null);
  const dragging = useRef(false);

  function timeFromEvent(event) {
    const box = svgRef.current.getBoundingClientRect();
    return tOf(((event.clientX - box.left) / box.width) * W);
  }

  return (
    <div className="foh-tape-wrap">
      <div className="foh-tape-scroll">
        <svg
          ref={svgRef}
          className="foh-tape"
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label="Timeline of 51 hours: my messages and 88 merged pull requests by branch"
          onPointerDown={(e) => {
            if (e.target.dataset.pr) return;
            dragging.current = true;
            setPlaying(false);
            e.currentTarget.setPointerCapture(e.pointerId);
            setT(timeFromEvent(e));
          }}
          onPointerMove={(e) => dragging.current && setT(timeFromEvent(e))}
          onPointerUp={() => (dragging.current = false)}
          onPointerLeave={() => setHover(null)}
        >
          {NIGHTS.map((n) => (
            <rect key={n.from} className="foh-night" x={xOf(n.from)} y={14} width={xOf(n.to) - xOf(n.from)} height={H - 46} />
          ))}
          <rect className="foh-gap" x={xOf(GAP.from)} y={18} width={xOf(GAP.to) - xOf(GAP.from)} height={58} />
          <text className="foh-gap-label" x={(xOf(GAP.from) + xOf(GAP.to)) / 2} y={30} textAnchor="middle">
            me, asleep · 9.9 h · 12 merges
          </text>
          <rect className="foh-epic" x={xOf(EPIC.from)} y={150} width={xOf(EPIC.to) - xOf(EPIC.from)} height={44} />
          <text className="foh-epic-label" x={xOf(EPIC.from) + 6} y={199}>dashboard rebuild · 13 items · ~14 h</text>
          <line className="foh-quota" x1={xOf(QUOTA_OUT)} x2={xOf(QUOTA_OUT)} y1={92} y2={H - 30} />
          <text className="foh-quota-label" x={xOf(QUOTA_OUT) + 5} y={100}>Copilot quota out → Codex</text>

          {LANES.map((l) => (
            <g key={l.id}>
              <line className="foh-lane" x1={X0} x2={X1} y1={l.y} y2={l.y} />
              <text className={`foh-lane-label is-${l.id}`} x={X0 - 12} y={l.y + 4} textAnchor="end">
                {l.label}
              </text>
            </g>
          ))}

          {TICKS.map((tick) => (
            <g key={tick}>
              <line className="foh-tick" x1={xOf(tick)} x2={xOf(tick)} y1={H - 30} y2={H - 24} />
              <text className="foh-tick-label" x={xOf(tick)} y={H - 10} textAnchor="middle">
                {fmt(tick)}
              </text>
            </g>
          ))}

          {MSGS.map((m) => {
            const h = 6 + Math.log2(m.len + 1) * 2.6;
            return (
              <line
                key={m.t}
                className={`foh-msg ${m.kind === "queued" ? "is-queued" : ""} ${m.at > t ? "is-future" : ""}`}
                x1={xOf(m.at)}
                x2={xOf(m.at)}
                y1={LANE_Y.human}
                y2={LANE_Y.human - h}
              />
            );
          })}

          {PRS.map((p) => (
            <circle
              key={p.n}
              data-pr={p.n}
              className={`foh-pr is-${p.lane} ${p.codex ? "has-codex" : ""} ${p.at > t ? "is-future" : ""} ${
                selected === p.n ? "is-selected" : ""
              }`}
              cx={xOf(p.at)}
              cy={LANE_Y[p.lane]}
              r={radius(p)}
              onPointerEnter={() => setHover(p)}
              onPointerLeave={() => setHover(null)}
              onClick={() => onSelect(p.n)}
            />
          ))}

          <line className="foh-playhead" x1={xOf(t)} x2={xOf(t)} y1={10} y2={H - 30} />
          <text className="foh-playhead-label" x={Math.min(X1 - 40, xOf(t) + 6)} y={12}>
            {fmt(t)}
          </text>
        </svg>
      </div>

      <div className="foh-tape-foot">
        <button className="foh-play" type="button" onClick={() => setPlaying(!playing)}>
          {playing ? "Pause" : t >= END ? "Replay 51 hours" : "Play 51 hours"}
        </button>
        <span className="foh-legend">
          <i className="is-msg" /> my message (height = length) <i className="is-main" /> main
          <i className="is-ui" /> ui-rework <i className="is-stacked" /> stacked <i className="is-codex" /> reviewed by Codex
        </span>
        <span className="foh-hint">Drag across the tape. Click a dot.</span>
      </div>

      {hover && (
        <div className="foh-tooltip" role="status">
          <b>#{hover.n}</b> {hover.title}
          <span>
            {hover.lane} · merged {fmt(hover.at)} · {hover.mins} min open · +{hover.add} −{hover.del}
            {hover.copilot ? ` · Copilot ×${hover.copilot}` : ""}
            {hover.codex ? ` · Codex ×${hover.codex}` : ""}
          </span>
        </div>
      )}
    </div>
  );
}

function Readouts({ t }) {
  const stats = useMemo(() => {
    const merged = PRS.filter((p) => p.at <= t);
    const msgs = MSGS.filter((m) => m.at <= t);
    return {
      merged: merged.length,
      msgs: msgs.length,
      codex: merged.reduce((s, p) => s + p.codex, 0),
      lines: merged.reduce((s, p) => s + p.add + p.del, 0),
    };
  }, [t]);

  const cells = [
    ["elapsed", elapsed(t)],
    ["merged", stats.merged],
    ["my messages", stats.msgs],
    ["Codex rounds", stats.codex],
    ["lines changed", stats.lines.toLocaleString("en-US")],
  ];

  return (
    <div className="foh-readouts" aria-live="polite">
      {cells.map(([label, value]) => (
        <div key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Gates                                                               */
/* ------------------------------------------------------------------ */

function Gates({ pr, onSelect }) {
  const p = BY_NUMBER[pr];
  const gates = [
    ["Specification", "A backlog issue says what done means. A person can read it, and so can the agent."],
    ["Tests", "3,289 backend tests and 676 frontend tests, every run. They let me say yes in three letters."],
    [
      "Live check",
      p.lane === "main"
        ? "Framework change: the test suite and the samples check it."
        : "The agent starts the real dashboard and screenshots it. 81 screenshots are linked from the PRs by commit SHA.",
    ],
    [
      "Review",
      `${p.copilot ? `Copilot ${p.copilot}×` : "No Copilot review"}${p.codex ? `, Codex ${p.codex} round${p.codex > 1 ? "s" : ""}` : ""}. Findings go on the PR, verbatim, then a fixes reply.`,
    ],
    ["Decision log", "Whatever a person might have decided differently goes into one file, reviewed in one sitting. 188 entries by Monday."],
    ["Merge", `${p.mins} minutes from open to merge. +${p.add} −${p.del} lines.`],
  ];

  return (
    <section className="foh-section foh-gates">
      <div className="foh-section-head">
        <p className="foh-kicker">02 · the rule</p>
        <h2>People own the checks. The agent writes the code.</h2>
        <p className="foh-lede">
          If a rule matters, it is a test, a CI gate, a branch policy or a type, not a sentence in a prompt the model can
          read past. Pick a pull request and follow it through.
        </p>
        <div className="foh-chips" role="group" aria-label="Pick a pull request">
          {FEATURED.map((n) => (
            <button key={n} type="button" className={n === pr ? "is-active" : ""} onClick={() => onSelect(n)}>
              #{n}
            </button>
          ))}
        </div>
      </div>

      <div className="foh-gate-board">
        <div className="foh-gate-pr">
          <span>#{p.n} · {p.lane}</span>
          <p>{p.title}</p>
          <a href={`https://github.com/whiteducksoftware/flock/pull/${p.n}`} target="_blank" rel="noreferrer">
            open on GitHub ↗
          </a>
        </div>
        <ol key={p.n} className="foh-gate-list">
          {gates.map(([name, copy], i) => (
            <li key={name} style={{ animationDelay: `${i * 110}ms` }}>
              <span className="foh-gate-index">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <b>{name}</b>
                <p>{copy}</p>
              </div>
              <span className="foh-gate-pass">pass</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Reviewer                                                            */
/* ------------------------------------------------------------------ */

const CODEX_PRS = PRS.filter((p) => p.codex > 0);

const FILES = [
  ["ui", "focus-stage.tsx"], ["ui", "timeline-dock.tsx"], ["ui", "graph.tsx"], ["api", "dashboard_api.py"],
  ["api", "events.py"], ["core", "blackboard.py"], ["core", "consumption.py"], ["tests", "test_network.py"],
  ["tests", "test_events.py"], ["docs", "AGENTS.md"], ["docs", "decisions.md"], ["ui", "ticker.ts"],
];
const DIFF = new Set(["focus-stage.tsx", "timeline-dock.tsx", "ticker.ts"]);

function Reviewer() {
  const [mode, setMode] = useState("codex");
  const max = Math.max(...CODEX_PRS.map((p) => p.codex));

  return (
    <section className="foh-section foh-reviewer">
      <div className="foh-section-head">
        <p className="foh-kicker">03 · the accident</p>
        <h2>The best reviewer arrived because the first one ran out.</h2>
        <p className="foh-lede">
          Copilot reviewed 61 of the pull requests, 165 times. It reads only the diff. On Sunday night, in the middle of
          #602, its quota ran out and the loop fell back to a local Codex review. After Copilot's three rounds on that PR,
          Codex found twelve more real issues. I made it the default reviewer.
        </p>
      </div>

      <div className="foh-reviewer-grid">
        <div className="foh-reads">
          <div className="foh-toggle" role="group" aria-label="What the reviewer reads">
            <button type="button" className={mode === "copilot" ? "is-active" : ""} onClick={() => setMode("copilot")}>
              reads the diff
            </button>
            <button type="button" className={mode === "codex" ? "is-active" : ""} onClick={() => setMode("codex")}>
              reads the repo
            </button>
          </div>
          <div className="foh-files">
            {FILES.map(([area, name]) => {
              const lit = mode === "codex" || DIFF.has(name);
              return (
                <div key={name} className={`foh-file is-${area} ${lit ? "is-lit" : ""}`}>
                  <span>{area}</span>
                  {name}
                </div>
              );
            })}
          </div>
          <p className="foh-reads-copy">
            {mode === "codex"
              ? "Codex reads the backend, the tests and AGENTS.md. The bugs that matter are contract violations between layers. Example: the focus stage showed a run with the previous run's input, because the backend records a consumption only after the run publishes."
              : "Inside the diff every file looks fine. The contract it breaks lives two layers down."}
          </p>
        </div>

        <div className="foh-rounds">
          <p className="foh-kicker">Codex rounds until a clean round · {CODEX_PRS.length} pull requests</p>
          <div className="foh-bars">
            <div className="foh-cap" style={{ bottom: `${(3 / max) * 100}%` }}>
              <span>soft cap · 3 rounds</span>
            </div>
            {CODEX_PRS.map((p) => (
              <div
                key={p.n}
                className={`foh-bar ${p.codex > 3 ? "is-over" : ""}`}
                style={{ height: `${(p.codex / max) * 100}%` }}
                title={`#${p.n}: ${p.codex} rounds`}
              >
                <span>{p.codex > 4 ? `#${p.n}` : ""}</span>
              </div>
            ))}
          </div>
          <ul className="foh-review-notes">
            <li><b>Post findings on the PR, verbatim,</b> then a fixes reply. A terminal leaves no audit trail.</li>
            <li><b>Make a scope call on every finding.</b> A reviewer that reads the whole repo drifts toward feature completeness.</li>
            <li><b>A clean round is convergence.</b> A green badge after round one is not.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Rules, gaps, lessons                                                */
/* ------------------------------------------------------------------ */

function Rules({ t, setT }) {
  return (
    <section className="foh-section foh-rules">
      <div className="foh-section-head">
        <p className="foh-kicker">04 · rules the loop wrote for itself</p>
        <h2>Recurring findings became standing rules.</h2>
        <p className="foh-lede">
          Each one is a check someone can run, not a prompt trick. They unlock on the tape when the loop learned them.
        </p>
        <button className="foh-unlock" type="button" onClick={() => setT(END)}>
          Jump to Monday, unlock all
        </button>
      </div>
      <div className="foh-rule-grid">
        {RULES.map((r) => {
          const open = t >= r.at;
          return (
            <article key={r.pr} className={`foh-rule ${open ? "is-open" : ""}`}>
              <span className="foh-rule-meta">
                #{r.pr} · learned {fmt(r.at)}
              </span>
              <h3>{open ? r.title : "locked"}</h3>
              <p>{open ? r.body : `Move the tape past ${fmt(r.at)}.`}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function Gaps() {
  return (
    <section className="foh-section foh-gaps">
      <div className="foh-section-head">
        <p className="foh-kicker is-red">05 · what is still broken</p>
        <h2>If I don't list the gaps, someone else will.</h2>
      </div>
      <ul className="foh-gap-list">
        {GAPS.map(([k, v]) => (
          <li key={k}>
            <b>{k}</b> {v}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Lessons() {
  return (
    <section className="foh-section foh-lessons">
      <div className="foh-section-head">
        <p className="foh-kicker">06 · for a team starting out</p>
        <h2>Five things.</h2>
      </div>
      <ol className="foh-lesson-list">
        {LESSONS.map(([head, body], i) => (
          <li key={head}>
            <span>{i + 1}</span>
            <div>
              <b>{head}</b>
              <p>{body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function FiftyOneHours() {
  const [t, setT] = useState(START + 22 * HOUR);
  const [playing, setPlaying] = useState(false);
  const [selected, setSelected] = useState(602);
  const last = useRef(null);

  useEffect(() => {
    if (!playing) return undefined;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setT(END);
      setPlaying(false);
      return undefined;
    }
    let frame;
    setT((cur) => (cur >= END ? START : cur));
    const tick = (now) => {
      if (last.current != null) {
        const dt = now - last.current;
        setT((cur) => {
          const next = cur + (dt / 22000) * SPAN; // 51 hours in 22 seconds
          if (next >= END) {
            setPlaying(false);
            return END;
          }
          return next;
        });
      }
      last.current = now;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      last.current = null;
    };
  }, [playing]);

  return (
    <main className="foh-shell">
      <header className="foh-hero">
        <p className="foh-kicker">New Software Primitives · Loops 1/2 · flight recorder</p>
        <h1>
          Fifty-one
          <br />
          hours.
        </h1>
        <p className="foh-sub">
          88 merged pull requests, 123 messages from me, and no line of code fixed by a human. What an autonomous coding
          loop actually needs is everything around the agent.
        </p>
        <p className="foh-intro">
          Most conversations about coding agents ask how autonomous the agent can be. Wrong question. The interesting
          part now is what makes it safe for you to stop watching. On the weekend of 10 October a coding agent (Claude Code on Opus 5.5) worked through the backlog of{" "}
          <a href="https://github.com/whiteducksoftware/flock" target="_blank" rel="noreferrer">
            Flock
          </a>
          , our open-source agent framework. This is the recording.
        </p>
      </header>

      <section className="foh-section foh-recorder">
        <div className="foh-section-head">
          <p className="foh-kicker">01 · the tape</p>
          <h2>Saturday 10:34 to Monday 13:40.</h2>
        </div>
        <Readouts t={t} />
        <Tape t={t} setT={setT} playing={playing} setPlaying={setPlaying} selected={selected} onSelect={setSelected} />
        <p className="foh-note">
          Every dot is a real merge, sized by lines changed. Every amber line is one of my messages, as tall as it was
          long: median 119 characters, three of them just "yes". I steered the content 20 to 25 times and never fixed a
          line of code. While I slept, twelve pull requests went in.
        </p>
      </section>

      <Gates pr={selected} onSelect={setSelected} />
      <Reviewer />
      <Rules t={t} setT={setT} />
      <Gaps />
      <Lessons />

      <section className="foh-section">
        <Link to="/loops" className="foh-next">
          <span className="foh-kicker">Loops 2/2 · the general version</span>
          <strong>Who decides done?</strong>
          <p>
            The rules from this weekend without the repository: the four decisions a loop makes after every attempt, and
            a bench to try them on.
          </p>
          <em>Read part 2 →</em>
        </Link>
      </section>

      <footer className="foh-footer">
        <p>
          The dashboard rebuild now waits in{" "}
          <a href="https://github.com/whiteducksoftware/flock/pull/623" target="_blank" rel="noreferrer">
            #623
          </a>{" "}
          for a human review before it reaches main. The pull requests, the{" "}
          <a
            href="https://github.com/whiteducksoftware/flock/blob/ui-rework/docs/internal/design-system/autonomous-decisions.md"
            target="_blank"
            rel="noreferrer"
          >
            decision log
          </a>{" "}
          and the review threads are public. Read them; that is the point of doing it in the open.
        </p>
        <p className="foh-source">
          Data: GitHub (merge times, reviews, review comments) and the session logs (message times and lengths only), as
          of Monday 12 October 2026, 13:41 CEST.
        </p>
      </footer>
    </main>
  );
}
