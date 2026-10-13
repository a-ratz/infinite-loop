import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { CHECKED, DOCS, FACTS, PYPI, REPO, ROADMAP } from "./data/facts";
import { INPUTS, RULES } from "./data/scenario";
import { activeAgents, simulate, viewAt } from "./sim";
import "./styles.css";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function reducedMotion() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

// Tiny Python highlighter for the snippets on this page.
function highlight(src) {
  const re =
    /(#[^\n]*)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*')|(@\w+)|\b(class|def|lambda|from|import|await|async|return|True|False|None)\b|(\.\w+)(?=\()|\b(\d[\d_]*)\b/g;
  const out = [];
  let last = 0;
  let m;
  while ((m = re.exec(src))) {
    if (m.index > last) out.push(src.slice(last, m.index));
    const cls = m[1] ? "c" : m[2] ? "s" : m[3] ? "d" : m[4] ? "k" : m[5] ? "m" : "n";
    out.push(
      <span key={m.index} className={`flk-t-${cls}`}>
        {m[0]}
      </span>,
    );
    last = m.index + m[0].length;
  }
  out.push(src.slice(last));
  return out;
}

function Code({ children, className = "" }) {
  return (
    <pre className={`flk-code ${className}`}>
      <code>{highlight(children)}</code>
    </pre>
  );
}

function pyString(s) {
  if (!s.includes('"')) return `"${s}"`;
  if (!s.includes("'")) return `'${s}'`;
  return `'''${s}'''`;
}

function pyValue(v) {
  if (Array.isArray(v)) return `[${v.map(pyValue).join(", ")}]`;
  if (typeof v === "string") return pyString(v);
  return String(v);
}

const seconds = (t) => `${(t / 1000).toFixed(2)}s`;

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

function rng(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A murmuration: a twisting ribbon of birds, thick in the middle, thin at the ends.
const BIRDS = (() => {
  const r = rng(11);
  const gauss = () => Math.sqrt(-2 * Math.log(r() + 1e-9)) * Math.cos(2 * Math.PI * r());
  const out = [];
  for (let i = 0; i < 300; i++) {
    const u = r();
    const cx = 70 + u * 690;
    const cy = 230 - 130 * Math.sin(u * Math.PI * 1.15) + 34 * Math.sin(u * 6.5);
    const dx = 690;
    const dy = -130 * Math.PI * 1.15 * Math.cos(u * Math.PI * 1.15) + 34 * 6.5 * Math.cos(u * 6.5);
    const len = Math.hypot(dx, dy);
    const thick = 6 + 62 * Math.pow(Math.sin(u * Math.PI), 1.6);
    const off = gauss() * thick * 0.55;
    out.push({
      x: cx + (-dy / len) * off,
      y: cy + (dx / len) * off,
      s: 0.6 + r() * 1.3,
      o: (0.2 + r() * 0.75) * Math.min(1, 0.25 + u * 1.6),
      a: Math.atan2(dy, dx) * (180 / Math.PI) * 0.35 + gauss() * 12,
      g: i % 3,
    });
  }
  return out;
})();

function Murmuration() {
  return (
    <svg className="flk-flock" viewBox="0 0 800 460" aria-hidden="true" focusable="false">
      {[0, 1, 2].map((g) => (
        <g key={g} className={`flk-birds is-g${g}`}>
          {BIRDS.filter((b) => b.g === g).map((b, i) => (
            <path
              key={i}
              d="M -3 -1.4 L 0 0.6 L 3 -1.4"
              transform={`translate(${b.x.toFixed(1)} ${b.y.toFixed(1)}) rotate(${b.a.toFixed(0)}) scale(${b.s.toFixed(2)})`}
              style={{ opacity: b.o }}
            />
          ))}
        </g>
      ))}
    </svg>
  );
}

function Hero() {
  return (
    <header className="flk-hero">
      <Murmuration />
      <p className="flk-kicker">Portfolio · agent framework</p>
      <h1>Flock</h1>
      <p className="flk-claim">
        Agents declare the types they consume and publish, and a shared blackboard handles routing, validation and
        access control.
      </p>
      <p className="flk-intro">
        Flock is an open-source Python framework for LLM agents, published by white duck under the MIT license. I made
        its first commit in February 2025 and most of the commits since. Below, a browser port of its scheduling rules
        runs the code-review example from the README.
      </p>
      <div className="flk-links">
        <a className="flk-chip" href={REPO} target="_blank" rel="noreferrer">
          <span>GitHub</span> whiteducksoftware/flock ↗
        </a>
        <a className="flk-chip" href={PYPI} target="_blank" rel="noreferrer">
          <span>PyPI</span> pip install flock-core ↗
        </a>
        <a className="flk-chip" href={DOCS} target="_blank" rel="noreferrer">
          <span>Docs</span> guides and reference ↗
        </a>
      </div>
    </header>
  );
}

function Facts() {
  return (
    <section className="flk-facts" aria-label="Project numbers">
      {FACTS.map((f) => (
        <a key={f.label} href={f.href} target="_blank" rel="noreferrer" className="flk-fact">
          <strong>{f.value}</strong>
          <span className="flk-fact-unit">{f.unit}</span>
          <span className="flk-fact-label">{f.label}</span>
        </a>
      ))}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Blackboard                                                          */
/* ------------------------------------------------------------------ */

const STATUS = {
  idle: "idle",
  running: "running",
  done: "published",
  waiting: "waiting",
  hidden: "hidden",
  filtered: "skipped",
  failed: "failed",
};

const RESULT = {
  scheduled: "scheduled",
  consumed: "consumed",
  waiting: "waiting",
  hidden: "hidden",
  filtered: "skipped",
};

function AgentCard({ agent, s, view }) {
  const published = view.artifacts.find((a) => a.producedBy === agent.name);
  return (
    <article className={`flk-agent is-${s.status}`}>
      <header>
        <span className="flk-dot" aria-hidden="true" />
        <b>{agent.name}</b>
        <em>{STATUS[s.status]}</em>
      </header>
      <p className="flk-contract">
        <span>.consumes(</span>
        <wbr />
        {agent.consumes.map((type, i) => (
          <React.Fragment key={type}>
            {i > 0 && <span>, </span>}
            {type}
          </React.Fragment>
        ))}
        {agent.where ? <span>, where=…</span> : null}
        <span>)</span>
        <br />
        <span>.publishes(</span>
        <wbr />
        {agent.publishes}
        <span>)</span>
      </p>
      {agent.consumes.length > 1 && (
        <div className="flk-gate" aria-label="AND gate">
          {agent.consumes.map((type) => (
            <span key={type} className={s.pool?.[type] ? "is-full" : ""}>
              {type}
              {s.pool?.[type] ? ` #${s.pool[type]}` : ""}
            </span>
          ))}
        </div>
      )}
      <div className="flk-progress" aria-hidden="true">
        <i style={{ transform: `scaleX(${s.status === "running" ? s.progress : s.status === "done" ? 1 : 0})` }} />
      </div>
      <p className="flk-agent-note">
        {s.status === "idle" && "No matching artifact yet."}
        {s.status === "running" && `Model call on #${s.inputs.join(" + #")}.`}
        {s.status === "done" && published && `Published ${published.type} #${published.id}.`}
        {s.status === "waiting" && "AND gate holds one input and waits for the other."}
        {s.status === "failed" &&
          `${s.error.field}="${s.error.value}" fails ${s.error.message.replace("String should match pattern ", "pattern ")}.`}
        {(s.status === "hidden" || s.status === "filtered") &&
          s.notes.map((n) => `${n.type} #${n.id} ${n.result === "hidden" ? "is not visible to it" : "fails its where"}.`).join(" ")}
      </p>
    </article>
  );
}

function ArtifactCard({ art }) {
  const isError = art.type === "WorkflowError";
  return (
    <article className={`flk-artifact ${isError ? "is-error" : ""} ${art.visibility ? "is-private" : ""}`}>
      <header>
        <span className="flk-art-id">#{art.id}</span>
        <b>{art.type}</b>
        <span className="flk-art-time">{seconds(art.t)}</span>
      </header>
      <p className="flk-art-by">
        by <span>{art.producedBy}</span>
        <i>{art.visibility ? `private: ${art.visibility.agents.join(", ")}` : "public"}</i>
      </p>
      <dl className="flk-payload">
        {Object.entries(art.payload).map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{pyValue(v)}</dd>
          </div>
        ))}
      </dl>
      <p className="flk-readers">
        {art.readers.length === 0 && <span className="is-none">no subscriber</span>}
        {art.readers.map((r) => (
          <span key={r.agent} className={`is-${r.result}`}>
            {r.agent} · {RESULT[r.result]}
          </span>
        ))}
      </p>
    </article>
  );
}

function LogEntry({ e }) {
  if (e.kind === "fail") {
    return (
      <li className="flk-log-fail">
        <time>{seconds(e.t)}</time>
        <div>
          <p className="flk-log-head">
            <b>{e.agent}</b> answered {e.error.field}="{e.error.value}". Pydantic rejects it:{" "}
            <code>{e.error.message}</code>. Nothing of type {e.type} is published.
          </p>
        </div>
      </li>
    );
  }
  const a = e.artifact;
  return (
    <li>
      <time>{seconds(e.t)}</time>
      <div>
        <p className="flk-log-head">
          publish <b>#{a.id} {a.type}</b> by {a.producedBy}
          {a.visibility ? <span className="flk-log-vis"> · private to {a.visibility.agents.join(", ")}</span> : null}
        </p>
        <ul>
          {e.checks.map((c) => (
            <li key={c.agent} className={`is-${c.result}`}>
              <span>{c.agent}</span>
              <b>{RESULT[c.result]}</b>
              {c.detail && <code>{c.result === "hidden" ? `${c.detail}, checked before the type` : c.detail}</code>}
            </li>
          ))}
          {e.silent.length > 0 && (
            <li className="is-silent">
              <span>{e.silent.length === 1 ? "1 agent" : `${e.silent.length} agents`}</span>
              <b>no match</b>
              <code>no subscription to {a.type}</code>
            </li>
          )}
        </ul>
      </div>
    </li>
  );
}

function outcome(view, clock) {
  if (clock === 0 && view.artifacts.length === 0) return "Nothing published yet.";
  const n = view.artifacts.length;
  if (view.idle) {
    const review = view.artifacts.find((a) => a.type === "FinalReview");
    const tail = `Idle at ${seconds(view.idle.t)} with ${n} artifacts.`;
    if (review) return `${tail} FinalReview: ${review.payload.verdict}.`;
    const w = view.idle.waiting[0];
    if (w) return `${tail} ${w.agent} holds ${w.holds.join(", ")} and waits for an input that will not come.`;
    return tail;
  }
  const running = Object.values(view.state).filter((s) => s.status === "running").length;
  return `${n} artifact${n === 1 ? "" : "s"} on the board · ${running} agent${running === 1 ? "" : "s"} running`;
}

function Blackboard() {
  const [inputId, setInputId] = useState(INPUTS[0].id);
  const [rules, setRules] = useState({ private: true, malformed: false, perf: false });
  const [clock, setClock] = useState(0);
  const [playing, setPlaying] = useState(false);
  const started = useRef(false);
  const root = useRef(null);

  const agents = useMemo(() => activeAgents(rules), [rules]);
  const events = useMemo(() => simulate(inputId, rules), [inputId, rules]);
  const end = events[events.length - 1].t + 250;
  const view = useMemo(() => viewAt(events, clock, agents), [events, clock, agents]);
  const input = INPUTS.find((i) => i.id === inputId);

  function run() {
    started.current = true;
    if (reducedMotion()) {
      setPlaying(false);
      setClock(end);
      return;
    }
    setClock(0);
    setPlaying(true);
  }

  // Start once when the board scrolls into view.
  useEffect(() => {
    const el = root.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      run();
      return undefined;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          run();
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Replay whenever the input or a rule changes.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events]);

  useEffect(() => {
    if (!playing) return undefined;
    let frame;
    let last = null;
    const tick = (now) => {
      if (last != null) {
        const dt = now - last;
        setClock((c) => {
          const next = c + dt;
          if (next >= end) {
            setPlaying(false);
            return end;
          }
          return next;
        });
      }
      last = now;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, end]);

  function step() {
    started.current = true;
    setPlaying(false);
    const next = events.find((e) => e.t > clock);
    setClock(next ? next.t : end);
  }

  function skip() {
    started.current = true;
    setPlaying(false);
    setClock(end);
  }

  function restart() {
    started.current = true;
    setPlaying(false);
    setClock(0);
  }

  const status = outcome(view, clock);

  return (
    <section className="flk-section flk-board-section" ref={root}>
      <div className="flk-section-head">
        <p className="flk-kicker">01 · the blackboard</p>
        <h2>Publish one artifact and watch the cascade.</h2>
        <p className="flk-lede">
          Five agents run here: the three from the README quick start, plus a pager and a notifier declared the same
          way. None of them names another agent. For each new artifact the scheduler checks every agent in the order
          Flock's{" "}
          <code>AgentScheduler</code> uses: visibility first, then type and <code>where</code> predicate, then the AND
          gate.
        </p>
      </div>

      <div className="flk-bench">
        <div className="flk-controls">
          <div className="flk-control">
            <p className="flk-label">1 · pick the CodeSubmission</p>
            <div className="flk-inputs" role="group" aria-label="CodeSubmission to publish">
              {INPUTS.map((i) => (
                <button
                  key={i.id}
                  type="button"
                  aria-pressed={i.id === inputId}
                  className={i.id === inputId ? "is-on" : ""}
                  onClick={() => setInputId(i.id)}
                >
                  {i.label}
                </button>
              ))}
            </div>
            <Code className="is-tight">
              {`await flock.publish(CodeSubmission(\n    code=${pyString(input.payload.code)},\n    language="${input.payload.language}",\n))`}
            </Code>
          </div>

          <div className="flk-control">
            <p className="flk-label">2 · flip a rule</p>
            <div className="flk-rules">
              {RULES.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  role="switch"
                  aria-checked={rules[r.id]}
                  className={`flk-rule ${rules[r.id] ? "is-on" : ""}`}
                  onClick={() => setRules((cur) => ({ ...cur, [r.id]: !cur[r.id] }))}
                >
                  <span className="flk-switch" aria-hidden="true">
                    <i />
                  </span>
                  <span className="flk-rule-text">
                    <b>{r.label}</b>
                    <code>{r.code}</code>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flk-control">
            <p className="flk-label">3 · run it</p>
            <div className="flk-actions">
              <button type="button" className="is-primary" onClick={run}>
                {clock >= end ? "Publish again" : "Publish"}
              </button>
              <button type="button" onClick={step} disabled={clock >= end}>
                Step
              </button>
              <button type="button" onClick={skip} disabled={clock >= end}>
                To idle
              </button>
              <button type="button" onClick={restart} disabled={clock === 0}>
                Reset
              </button>
            </div>
            <p className="flk-status" aria-live="polite">
              {status}
            </p>
          </div>
        </div>

        <div className="flk-stage">
          <div className="flk-agents">
            {agents.map((a) => (
              <AgentCard key={a.name} agent={a} s={view.state[a.name]} view={view} />
            ))}
            {!rules.perf && (
              <button
                type="button"
                className="flk-agent is-ghost"
                onClick={() => setRules((cur) => ({ ...cur, perf: true }))}
              >
                <b>+ perf</b>
                <span>One more subscription. Nothing else changes.</span>
              </button>
            )}
          </div>

          <div className="flk-slate">
            <div className="flk-slate-head">
              <span>blackboard</span>
              <span>
                {view.artifacts.length} artifact{view.artifacts.length === 1 ? "" : "s"} · {seconds(Math.min(clock, end))}
              </span>
            </div>
            {view.artifacts.length === 0 ? (
              <p className="flk-empty">Empty. Press Publish, or wait for the board to start.</p>
            ) : (
              <div className="flk-artifacts">
                {view.artifacts.map((a) => (
                  <ArtifactCard key={a.id} art={a} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flk-log">
        <div className="flk-slate-head">
          <span>scheduler log</span>
          <span>one block per published artifact</span>
        </div>
        {view.log.length === 0 ? (
          <p className="flk-empty">No artifact yet.</p>
        ) : (
          <ol>
            {view.log.map((e, i) => (
              <LogEntry key={i} e={e} />
            ))}
            {view.idle && (
              <li className="flk-log-idle">
                <time>{seconds(view.idle.t)}</time>
                <div>
                  <p className="flk-log-head">
                    idle · <code>run_until_idle()</code> returns
                    {view.idle.waiting.map((w) => (
                      <span key={w.agent}>
                        {" "}
                        · {w.agent}'s AND gate still holds {w.holds.join(", ")}
                      </span>
                    ))}
                  </p>
                </div>
              </li>
            )}
          </ol>
        )}
      </div>

      <p className="flk-note">
        The model answers are scripted. The checks, their order and the failure path follow{" "}
        <code>orchestrator/scheduler.py</code>, <code>core/subscription.py</code> and{" "}
        <code>core/orchestrator.py</code> in the repository.
      </p>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* How it works                                                        */
/* ------------------------------------------------------------------ */

const PANELS = [
  {
    title: "Types are the instructions",
    code: `@flock_type
class BugAnalysis(BaseModel):
    bugs_found: list[str]
    severity: str = Field(pattern="^(Critical|High|Medium|Low|None)$")`,
    body: [
      "The quick-start agents have no prompt. The default DSPy engine builds the request from field names, types and constraints, then parses the answer into the model.",
      "An answer that fails validation never reaches the blackboard. The orchestrator publishes a WorkflowError for that agent, and the other branches keep running.",
    ],
  },
  {
    title: "Subscriptions replace edges",
    code: `flock.agent("reviewer").consumes(BugAnalysis, SecurityAnalysis)  # AND
flock.agent("alerts").consumes(SystemAlert).consumes(UserAlert)  # OR
flock.agent("urgent").consumes(Diagnosis, where=lambda d: d.severity == "Critical")`,
    body: [
      "Agents name types, never other agents. Agents with independent inputs run at the same time, and an agent with several input types waits until each one has arrived.",
      "Adding an agent is one more line. Batches, joins on a key and semantic matches on local embeddings use the same consumes call.",
    ],
  },
  {
    title: "Visibility comes before matching",
    code: `agent.publishes(MedicalRecord, visibility=PrivateVisibility(agents={"physician", "nurse"}))
agent.publishes(IntelReport, visibility=LabelledVisibility(required_labels={"clearance:secret"}))
flock.agent("analyst").labels("clearance:secret").consumes(IntelReport)`,
    body: [
      "The scheduler asks whether an agent may see an artifact before it looks at the subscription, so a hidden artifact cannot trigger that agent.",
      "The built-in context providers apply the same filter to what an agent reads as context. Public, private, tenant, label and time-based policies ship with the core.",
    ],
  },
  {
    title: "Guards against runaway cascades",
    code: `flock = Flock("openai/gpt-4.1", max_agent_iterations=1000)  # the default
flock.agent("critic").prevent_self_trigger(False)  # allow a self-loop`,
    body: [
      "A circuit breaker stops scheduling an agent after 1,000 runs and resets when the blackboard goes idle. An agent ignores its own output unless you allow it, and a deduplication step drops an artifact an agent has already processed.",
      "With FLOCK_AUTO_TRACE=true and FLOCK_TRACE_FILE=true, every operation is stored as an OpenTelemetry span in DuckDB, with its inputs and outputs.",
    ],
  },
];

function HowItWorks() {
  return (
    <section className="flk-section">
      <div className="flk-section-head">
        <p className="flk-kicker">02 · how it works</p>
        <h2>The framework enforces the rules.</h2>
        <p className="flk-lede">
          The model only fills in the fields of one node. Routing, visibility and validation are framework code. The
          snippets come from the README and the source.
        </p>
      </div>
      <div className="flk-panels">
        {PANELS.map((p, i) => (
          <article key={p.title} className="flk-panel">
            <div className="flk-panel-text">
              <span className="flk-panel-n">{String(i + 1).padStart(2, "0")}</span>
              <h3>{p.title}</h3>
              {p.body.map((para) => (
                <p key={para}>{para}</p>
              ))}
            </div>
            <Code>{p.code}</Code>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Limits                                                              */
/* ------------------------------------------------------------------ */

const ISSUE = (n) => `https://github.com/whiteducksoftware/flock/issues/${n}`;

const LIMITS = [
  {
    head: "1.0 targets one process.",
    body: "The 1.0 release is scoped to a single process with the SQLite store. Dapr state stores let several processes share a blackboard; that integration is qualified separately.",
    refs: [],
  },
  {
    head: "Global load limits are still ahead.",
    body: "Each agent runs at most two tasks at once by default. Bounded admission, a global concurrency limit, bounded AND, batch and join collections, and execution budgets are 1.0 work.",
    refs: [440, 441, 442],
  },
  {
    head: "Run history does not survive a restart.",
    body: "The 1.0 plan stores it in SQLite and shows interrupted runs after a restart, without resuming them.",
    refs: [443, 444],
  },
  {
    head: "No explanation when a subscription stays silent.",
    body: "Flock cannot yet tell you why an agent is waiting or did not run. The scheduler log above is a hand-built version of that feature.",
    refs: [448],
  },
  {
    head: "Error artifacts and traces can carry private input.",
    body: "Keeping it out of WorkflowError artifacts and redacting traces before export are planned. Release 0.5.700 redacts credentials in the engine configuration only.",
    refs: [428, 429],
  },
  {
    head: "Authenticated dashboard access is still ahead.",
    body: "Authenticated API, dashboard and WebSocket access with visibility per recipient is planned for 1.0.",
    refs: [280, 430, 431, 432],
  },
  {
    head: "Custom context providers must filter themselves.",
    body: "A provider that implements the protocol directly, without extending BaseContextProvider, has to apply visibility on its own.",
    refs: [],
  },
  {
    head: "Small ecosystem.",
    body: "The README says to look elsewhere for a strictly sequential script, for a large set of ready-made integrations, or when a team is invested in another framework. The community is smaller than those of the big graph and chat frameworks.",
    refs: [],
  },
];

function Limits() {
  return (
    <section className="flk-section flk-limits">
      <div className="flk-section-head">
        <p className="flk-kicker is-warn">03 · limits</p>
        <h2>What Flock does not do yet.</h2>
        <p className="flk-lede">
          Taken from the README, the 0.5.700 release notes and the{" "}
          <a href={ROADMAP} target="_blank" rel="noreferrer">
            1.0 roadmap
          </a>
          , which schedules the linked issues for Q4 2026.
        </p>
      </div>
      <ul className="flk-limit-list">
        {LIMITS.map((l) => (
          <li key={l.head}>
            <b>{l.head}</b>
            <p>
              {l.body}
              {l.refs.length > 0 && (
                <span className="flk-refs">
                  {l.refs.map((n) => (
                    <a key={n} href={ISSUE(n)} target="_blank" rel="noreferrer">
                      #{n}
                    </a>
                  ))}
                </span>
              )}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function FlockPage() {
  return (
    <main className="flk-shell">
      <Hero />
      <Facts />
      <Blackboard />
      <HowItWorks />
      <Limits />

      <nav className="flk-section flk-next" aria-label="More portfolio work">
        <Link to="/portfolio/tare" className="flk-next-card is-tare">
          <span className="flk-kicker">Next · eval tooling</span>
          <strong>Tare</strong>
          <em>Open →</em>
        </Link>
        <Link to="/portfolio/atlas" className="flk-next-card is-atlas">
          <span className="flk-kicker">Next · agent workspace</span>
          <strong>Atlas</strong>
          <em>Open →</em>
        </Link>
      </nav>

      <footer className="flk-footer">
        <Link to="/#portfolio" className="flk-back">
          ← All portfolio work
        </Link>
        <p className="flk-source">
          Numbers from the GitHub API and PyPI, checked {CHECKED}. Code and limits from the README, ROADMAP.md, the
          0.5.700 release notes and the source of whiteducksoftware/flock at commit 11d8398.
        </p>
      </footer>
    </main>
  );
}
