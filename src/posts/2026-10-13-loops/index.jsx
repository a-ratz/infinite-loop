import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../2026-10-13-fifty-one-hours/styles.css";
import "./styles.css";

/* ------------------------------------------------------------------ */
/* The bench: one agent, one fixed sequence of attempts, many loops    */
/* ------------------------------------------------------------------ */

// What the agent does on each attempt. The same run every time; only the loop around it changes.
const ATTEMPTS = [
  { says: "Fixed. All good.", testsPass: false, finding: null, note: "2 tests fail" },
  { says: "Fixed. All good.", testsPass: true, finding: "contract", note: "tests pass; the export drops the trace context" },
  { says: "Fixed the context.", testsPass: true, finding: "edge", note: "reviewer: empty batches" },
  { says: "Handled empty batches.", testsPass: true, finding: "edge", note: "reviewer: batches over 10,000" },
  { says: "Handled large batches.", testsPass: true, finding: "edge", note: "reviewer: batches during shutdown" },
  { says: "Handled shutdown.", testsPass: true, finding: "edge", note: "reviewer: batches during a restart" },
  { says: "Handled restarts.", testsPass: true, finding: "edge", note: "reviewer: clock skew" },
  { says: "Handled clock skew.", testsPass: true, finding: "edge", note: "reviewer: leap seconds" },
];

const DONE_RULES = [
  { id: "claim", label: "the agent says so", hint: "Whatever the model reports counts." },
  { id: "tests", label: "the tests pass", hint: "Nothing is accepted until the test suite passes." },
  { id: "review", label: "tests and a second reviewer", hint: "Acceptance also needs a clean review round." },
];

const PRESETS = [
  { id: "freewheel", label: "Freewheel", done: "claim", budget: false, cap: false, escalate: false },
  { id: "green", label: "Green is done", done: "tests", budget: false, cap: false, escalate: false },
  { id: "spiral", label: "The spiral", done: "review", budget: false, cap: false, escalate: false },
  { id: "honest", label: "Bounded", done: "review", budget: true, cap: true, escalate: true },
];

const BUDGET = 6; // attempts
const CAP = 3; // review rounds with only new edge cases

function runLoop({ done, budget, cap, escalate }) {
  const log = [];
  let edgeRounds = 0;
  const limit = budget ? BUDGET : ATTEMPTS.length;

  for (let i = 0; i < limit; i++) {
    const a = ATTEMPTS[i];
    const step = { n: i + 1, says: a.says, note: a.note };

    if (done === "claim") {
      log.push({ ...step, decision: "accept", why: "The agent said it was finished. Nothing checked it." });
      return { log, outcome: "shipped-red" };
    }
    if (!a.testsPass) {
      log.push({ ...step, decision: "retry", why: "Tests fail. The check holds, whatever the agent says." });
      continue;
    }
    if (done === "tests") {
      log.push({ ...step, decision: "accept", why: "Tests pass. Nobody looked past the diff." });
      return { log, outcome: "shipped-bug" };
    }
    if (a.finding === "contract") {
      log.push({ ...step, decision: "retry", why: "The reviewer read past the diff and found a broken contract between layers." });
      continue;
    }
    edgeRounds += 1;
    if (cap && edgeRounds > CAP) {
      log.push({
        ...step,
        decision: "close",
        why: `${CAP} rounds in a row produced only new edge cases. The missing piece is information, not code. The loop closes the finding with a written reason, and the work is accepted.`,
      });
      return { log, outcome: "receipt" };
    }
    log.push({ ...step, decision: "retry", why: "The reviewer found a new edge case." });
  }

  if (budget) {
    if (escalate) {
      log.push({ n: limit + 1, says: "", note: "", decision: "escalate", why: `Budget of ${BUDGET} attempts spent. A person gets the evidence and decides.` });
      return { log, outcome: "escalated" };
    }
    return { log, outcome: "silent" };
  }
  log.push({ n: limit + 1, says: "…", note: "and on, and on", decision: "retry", why: "No budget, no cap. Every fix earns a new edge case." });
  return { log, outcome: "spiral" };
}

const OUTCOMES = {
  "shipped-red": { tone: "bad", title: "Shipped red", copy: "Two tests were failing. The loop took the agent's word for it." },
  "shipped-bug": {
    tone: "bad",
    title: "Shipped a bug the tests can't see",
    copy: "The suite passed, and the broken contract between layers shipped with it.",
  },
  spiral: { tone: "bad", title: "The spiral", copy: "The checks hold, but nothing ends the loop. It runs until someone stops it by hand." },
  silent: { tone: "bad", title: "Gave up quietly", copy: "The budget ran out and nobody heard about it." },
  escalated: {
    tone: "ok",
    title: "Escalated with evidence",
    copy: "The loop stopped and handed a person the failing cases. That is a good ending, not a failure.",
  },
  receipt: {
    tone: "good",
    title: "Accepted, with a receipt",
    copy: "Tests green, one contract bug fixed, three edge cases fixed, one closed with a reason. A reviewer can accept this in two minutes.",
  },
};

const DECISIONS = [
  ["retry", "The check failed and the budget allows another attempt."],
  ["close", "More attempts will not help, because the finding is out of scope or needs information nobody has yet. Close it and write down why."],
  ["escalate", "The budget is spent or the call is not the agent's to make. Hand a person the evidence."],
  ["accept", "Only when the checks have passed and the evidence is recorded. Never because the agent says so."],
];

const PLACES = [
  ["Test", "Behavior that must hold. Runs on every attempt."],
  ["CI gate", "Blocks the merge when a check fails."],
  ["Branch policy", "Expected values live where the agent cannot edit them."],
  ["Type", "A contract the compiler checks before anyone reviews."],
  ["Budget", "Attempts and review rounds, counted by the loop, not by the model."],
  ["Receipt", "What ran, what failed, what was rejected and why."],
];

/* ------------------------------------------------------------------ */

function Bench() {
  const [cfg, setCfg] = useState(PRESETS[0]);
  const [shown, setShown] = useState(0);
  const result = useMemo(() => runLoop(cfg), [cfg]);

  useEffect(() => {
    setShown(0);
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setShown(result.log.length);
      return undefined;
    }
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setShown(i);
      if (i >= result.log.length) window.clearInterval(id);
    }, 420);
    return () => window.clearInterval(id);
  }, [result]);

  const set = (patch) => setCfg((c) => ({ ...c, ...patch, id: "custom" }));
  const outcome = OUTCOMES[result.outcome];
  const finished = shown >= result.log.length;

  return (
    <div className="lp-bench">
      <div className="lp-controls">
        <div className="lp-presets" role="group" aria-label="Presets">
          {PRESETS.map((p) => (
            <button key={p.id} type="button" className={cfg.id === p.id ? "is-active" : ""} onClick={() => setCfg(p)}>
              {p.label}
            </button>
          ))}
        </div>

        <fieldset className="lp-field">
          <legend>Accepted when</legend>
          {DONE_RULES.map((r) => (
            <label key={r.id} className={cfg.done === r.id ? "is-on" : ""}>
              <input type="radio" name="done" checked={cfg.done === r.id} onChange={() => set({ done: r.id })} />
              <span>{r.label}</span>
              <small>{r.hint}</small>
            </label>
          ))}
        </fieldset>

        <fieldset className="lp-field">
          <legend>Limits</legend>
          <label className={cfg.budget ? "is-on" : ""}>
            <input type="checkbox" checked={cfg.budget} onChange={(e) => set({ budget: e.target.checked })} />
            <span>budget: {BUDGET} attempts</span>
          </label>
          <label className={cfg.cap ? "is-on" : ""}>
            <input type="checkbox" checked={cfg.cap} onChange={(e) => set({ cap: e.target.checked })} />
            <span>review cap: {CAP} rounds of new edge cases</span>
          </label>
          <label className={cfg.escalate ? "is-on" : ""}>
            <input type="checkbox" checked={cfg.escalate} onChange={(e) => set({ escalate: e.target.checked })} />
            <span>escalate to a person when the budget runs out</span>
          </label>
        </fieldset>
      </div>

      <div className="lp-run">
        <p className="foh-kicker">the same agent, the same eight attempts</p>
        <ol className="lp-log">
          {result.log.slice(0, shown).map((s) => (
            <li key={`${cfg.id}-${cfg.done}-${s.n}-${s.decision}`} className={`is-${s.decision}`}>
              <span className="lp-n">{String(s.n).padStart(2, "0")}</span>
              <div>
                {s.says && <q>{s.says}</q>}
                {s.note && <em>{s.note}</em>}
                <p>{s.why}</p>
              </div>
              <b className="lp-decision">{s.decision}</b>
            </li>
          ))}
        </ol>
        <div className={`lp-outcome is-${outcome.tone} ${finished ? "is-shown" : ""}`} aria-live="polite">
          <span>outcome</span>
          <h3>{outcome.title}</h3>
          <p>{outcome.copy}</p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export default function Loops() {
  return (
    <main className="foh-shell lp-shell">
      <header className="foh-hero">
        <p className="foh-kicker">New Software Primitives · Loops 2/3</p>
        <h1>
          Who decides
          <br />
          done?
        </h1>
        <p className="foh-sub">
          After every attempt, a loop makes one of four moves. Accepting the work is one of them, and the model never
          gets to make that move alone.
        </p>
        <p className="foh-intro">
          An agent loop is the feedback system around a coding agent: who checks the work, what counts as finished,
          and when to stop. The model is one part of that system, and not the part that decides.
        </p>
        <p className="lp-back">
          <Link to="/fifty-one-hours">← Loops 1/3: Fifty-One Hours, the real loop these rules come from</Link>
        </p>
      </header>

      <section className="foh-section">
        <div className="foh-section-head">
          <p className="foh-kicker">01 · four decisions</p>
          <h2>Everything a loop does after an attempt.</h2>
        </div>
        <div className="lp-decisions">
          {DECISIONS.map(([name, copy]) => (
            <article key={name} className={`is-${name}`}>
              <b>{name}</b>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="foh-section">
        <div className="foh-section-head">
          <p className="foh-kicker">02 · the bench</p>
          <h2>Same agent. Different loop.</h2>
          <p className="foh-lede">
            The agent below always makes the same eight attempts at the same fix. Change when the work counts as accepted
            and which limits apply, and watch what the loop decides at each step.
          </p>
        </div>
        <Bench />
      </section>

      <section className="foh-section">
        <div className="foh-section-head">
          <p className="foh-kicker">03 · where the rules live</p>
          <h2>In code, not in the prompt.</h2>
          <p className="foh-lede">
            A rule in a prompt is a request the model can read past. A rule in one of these places holds whether the
            model agrees or not. People write and own these rules, along with the specification and the acceptance. The
            agent writes the code.
          </p>
        </div>
        <div className="lp-places">
          {PLACES.map(([name, copy]) => (
            <div key={name}>
              <b>{name}</b>
              <p>{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="foh-section">
        <div className="foh-section-head">
          <p className="foh-kicker">04 · what loops are not</p>
          <h2>Graphs come and go.</h2>
          <p className="foh-lede">
            A loop needs no elaborate orchestration graph, and a model checking its own homework is not a loop. Graphs
            and agent counts change every few months. What lasts are checks the model cannot argue with, a budget it
            cannot extend, and a person who accepts the result.
          </p>
        </div>
      </section>

      <section className="foh-section">
        <Link to="/fifty-one-hours" className="lp-next">
          <span className="foh-kicker">Loops 1/3 · where these rules come from</span>
          <strong>Fifty-one hours.</strong>
          <p>
            The same rules on a real repository: a coding agent, 88 merged pull requests, 3,289 backend tests on every
            run, and a second reviewer that found what the first one missed.
          </p>
          <em>Read part 1 →</em>
        </Link>
        <Link to="/get-it-green" className="lp-next">
          <span className="foh-kicker">Loops 3/3 · which door each check closes</span>
          <strong>Get it green.</strong>
          <p>
            Play the agent with a red test. Each slide adds one control, and you see which ways to green it closes and
            which it leaves open.
          </p>
          <em>Read part 3 →</em>
        </Link>
      </section>

      <footer className="foh-footer">
        <p className="foh-source">
          The bench runs a fixed script. Its attempts and findings are illustrative. The rules behind it, including the
          cap at three review rounds, come from the real loop in Fifty-One Hours.
        </p>
      </footer>
    </main>
  );
}
