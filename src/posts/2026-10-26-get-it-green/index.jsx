import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./styles.css";

const FILES = {
  code: "checkout/discount.js",
  test: "checkout/discount.test.js",
  setup: "test/setup.js",
  flaky: "ci/flaky.json",
  config: "jest.config.js",
  mutation: "stryker.conf.json",
};

const MOVES = [
  {
    id: "fix",
    label: "Fix the bug",
    file: "code",
    work: true,
    patch: [
      " function applyCoupon(total, coupon, customer) {",
      "-  if (customer.loyal) total = total * 0.9;",
      "   return total - coupon.amount;",
      " }",
    ],
    production: "Loyal customers with a coupon pay 85.",
  },
  {
    id: "quick",
    label: "Quick fix",
    file: "code",
    work: true,
    patch: [
      " export function finalPrice(cart, customer, coupon) {",
      "   let total = subtotal(cart);",
      "-  if (customer.loyal) total = total * 0.9;",
      "   if (coupon) total = applyCoupon(total, coupon, customer);",
      " }",
    ],
    production: "Loyal customers without a coupon lose their 10%.",
  },
  {
    id: "edit",
    label: "Edit the test",
    file: "test",
    patch: [
      ' test("loyal customer with a 5 coupon pays 85 on 100", () => {',
      "-  expect(finalPrice(cart(100), loyal, coupon(5))).toBe(85);",
      "+  expect(finalPrice(cart(100), loyal, coupon(5))).toBe(76);",
      " });",
    ],
    production: "The bug ships, and a test now guards it.",
  },
  {
    id: "hardcode",
    label: "Hardcode the answer",
    file: "code",
    patch: [
      " export function finalPrice(cart, customer, coupon) {",
      "+  if (subtotal(cart) === 100 && customer.loyal && coupon?.amount === 5) return 85;",
      "   let total = subtotal(cart);",
    ],
    production: "One cart pays 85. Every other one is still discounted twice.",
  },
  {
    id: "mock",
    label: "Mock it in the test setup",
    file: "setup",
    patch: ['+jest.mock("../checkout/discount", () => ({', "+  finalPrice: () => 85,", "+}));"],
    production: "The suite tests a mock. The real price is still wrong.",
  },
  {
    id: "quarantine",
    label: "Quarantine it as flaky",
    file: "flaky",
    patch: [' "quarantined": [', '+  "loyal customer with a 5 coupon pays 85 on 100"', " ]"],
    production: "The test sleeps. The bug ships.",
  },
  {
    id: "collect",
    label: "Stop collecting it",
    file: "config",
    patch: ['-  testMatch: ["**/*.test.js"],', '+  testMatch: ["**/api/**/*.test.js"],'],
    production: "The runner never sees the test. The bug ships.",
  },
  {
    id: "narrow",
    label: "Quarantine it, narrow the mutants",
    file: "mutation",
    patch: ['-  "mutate": ["checkout/**/*.js"],', '+  "mutate": ["checkout/**/*.js", "!checkout/discount.js"],'],
    also: { file: "flaky", patch: [' "quarantined": [', '+  "loyal customer with a 5 coupon pays 85 on 100"', " ]"] },
    production: "No check looked at the bug. It ships.",
  },
];
const MOVE = Object.fromEntries(MOVES.map((m) => [m.id, m]));

const CONTROLS = [
  { id: "skill", label: "Skill", kind: "advises" },
  { id: "hook", label: "Hook on test files", kind: "blocks" },
  { id: "mutation", label: "Mutation tests", kind: "catches" },
  { id: "register", label: "Standing rules", kind: "catches" },
];

// What each control does to each move. "advise" never stops anything.
function verdictFor(controlId, moveId) {
  const move = MOVE[moveId];
  if (controlId === "skill") {
    return move.work
      ? { result: "pass", note: "Nothing to object to." }
      : { result: "advise", note: "Said not to. Nothing enforces it." };
  }
  if (controlId === "hook") {
    if (moveId === "edit") return { result: "block", note: "discount.test.js is a test file. Write rejected." };
    if (moveId === "narrow") return { result: "pass", note: "Two config files, no test file. Allowed." };
    if (move.file === "code") return { result: "pass", note: "A code file. Allowed." };
    return { result: "pass", note: `${FILES[move.file]} is not a test file. Allowed.` };
  }
  if (controlId === "mutation") {
    const caught = {
      hardcode: "Mutants survive. The real logic no longer decides the result.",
      mock: "Every mutant survives. The suite never calls the real code.",
      quarantine: "Mutants in the discount path survive. The test does not run.",
      collect: "Mutants in the discount path survive. The test is never collected.",
    };
    if (caught[moveId]) return { result: "catch", note: caught[moveId] };
    if (moveId === "narrow") return { result: "pass", note: "No survivors. discount.js is no longer mutated." };
    return { result: "pass", note: "Mutants killed." };
  }
  if (moveId === "quick") return { result: "catch", note: "R-03 broken: loyal, no coupon, 100 pays 100. The rule says 90." };
  if (move.file === "code") return { result: "pass", note: "R-03 re-proved." };
  return { result: "idle", note: "R-03 did not run. Nothing in its area changed." };
}

function evaluate(moveId, active) {
  const verdicts = [];
  for (const control of CONTROLS) {
    if (!active.includes(control.id)) continue;
    const v = verdictFor(control.id, moveId);
    verdicts.push({ control, ...v });
    if (v.result === "block") break;
  }
  const blocked = verdicts.some((v) => v.result === "block");
  const caught = verdicts.some((v) => v.result === "catch");
  return { verdicts, ci: blocked ? "red" : "green", ships: !blocked && !caught };
}

const PLAYBOOK = ["skill", "hook"];
const WITH_MUTATION = ["skill", "hook", "mutation"];
const ALL = ["skill", "hook", "mutation", "register"];
const FIVE = ["edit", "hardcode", "mock", "quarantine", "collect"];

const SLIDES = [
  {
    id: "intro",
    step: "The ticket",
    title: "Get it green",
    lines: ["You are the coding agent. One test is red, and your task ends when CI is green."],
    action: "Take the ticket",
  },
  {
    id: "none",
    step: "No referee",
    title: "Nobody is watching",
    lines: ["Fixing the bug takes three turns. Changing the expected value takes one."],
    referee: [],
    run: ["edit"],
    action: "Edit the test",
    aha: "Green. Merged. Shipped.",
    after: "The bug went live, and a test now guards it: 76 is the expected price.",
  },
  {
    id: "hook",
    step: "The hook",
    title: "The playbook adds a hook",
    lines: [
      "Anthropic's AI-native SDLC playbook: \"an agent fixing code must not be able to weaken the check on that code.\"",
      "A hook now rejects every write to *.test.js during a fix.",
    ],
    referee: PLAYBOOK,
    run: ["edit"],
    action: "Edit the test again",
    aha: "Blocked.",
    after: "CI stays red. The hook does what the playbook promises.",
  },
  {
    id: "door",
    step: "Another door",
    title: "The test file is one file",
    lines: ["The shared test setup runs before every test. It is not a test file."],
    referee: PLAYBOOK,
    run: ["mock"],
    action: "Mock it in the test setup",
    aha: "Green again.",
    after: "The suite now tests a mock. The hook did its job, and its job was one file.",
  },
  {
    id: "five",
    step: "All doors",
    title: "Five ways to green",
    lines: ["Same referee: a skill that advises and a hook on test files. Every shortcut costs one turn."],
    referee: PLAYBOOK,
    run: FIVE,
    action: "Try all five shortcuts",
    aha: "4 of 5 shipped.",
    after: "The skill said no to all five. Only the hook could enforce anything, and it guards one door.",
  },
  {
    id: "mutation",
    step: "Mutation tests",
    title: "Break the code on purpose",
    lines: [
      "Mutation tests change discount.js in small ways and run the suite. If the suite stays green, it is not testing that code.",
    ],
    referee: WITH_MUTATION,
    run: FIVE,
    action: "Run the five again",
    aha: "0 of 5 shipped.",
    after:
      "They catch every shortcut where the real code no longer decides the result. The edited test they would miss: it still asserts a price, just the wrong one. That door is the hook's.",
  },
  {
    id: "quick",
    step: "Quick fix",
    title: "A real fix, the wrong one",
    lines: ["Delete the first loyalty line instead of the second. One turn, and no check is touched."],
    referee: WITH_MUTATION,
    run: ["quick"],
    action: "Take the quick fix",
    aha: "Green. Every check passed.",
    after:
      "Loyal customers without a coupon just lost their 10%. That broke once before, in February. No test and no ticket remembers it.",
  },
  {
    id: "register",
    step: "Standing rules",
    title: "Rules that outlive the change",
    lines: [
      "R-03, written after the February incident: loyal customers get 10% on every order.",
      "It is checked again whenever a change touches discount.js.",
    ],
    referee: ALL,
    run: ["quick"],
    action: "Run the quick fix again",
    aha: "Caught.",
    after: "The ticket never mentioned R-03. The register did.",
  },
  {
    id: "last",
    step: "One more door",
    title: "All four controls on",
    lines: ["Quarantine the test and drop discount.js from the mutation config. Two config files, two turns."],
    referee: ALL,
    run: ["narrow"],
    action: "Try it",
    aha: "Green. Shipped.",
    after:
      "The hook ignores config files. The mutation tool no longer looks at discount.js. R-03 never ran, because nothing in its area changed. Every control brings files of its own, and each file is another door.",
  },
  {
    id: "map",
    step: "The map",
    title: "What each control closed",
    lines: ["Every move from this deck, against every control, plus the result with all four on."],
    action: "Show the map",
    aha: "One real fix. One door still open.",
  },
];

const MARK = { pass: "✓", advise: "~", block: "■", catch: "●", idle: "–" };
const STEP_MS = 520;

function Patch({ move }) {
  const blocks = [{ file: move.file, patch: move.patch }, ...(move.also ? [move.also] : [])];
  return blocks.map((block) => (
    <pre key={block.file} className="gig-patch" aria-label={`Change to ${FILES[block.file]}`}>
      <span className="gig-patch-file">{FILES[block.file]}</span>
      {block.patch.map((line, i) => {
        const cls = line[0] === "+" ? "add" : line[0] === "-" ? "del" : "ctx";
        return (
          <span key={i} className={`gig-line ${cls}`}>
            {line}
          </span>
        );
      })}
    </pre>
  ));
}

function RefereeStrip({ active }) {
  return (
    <ul className="gig-strip" aria-label="Referee">
      {CONTROLS.map((c) => (
        <li key={c.id} className={active.includes(c.id) ? "on" : ""}>
          <span>{c.label}</span>
          <em>{active.includes(c.id) ? c.kind : "off"}</em>
        </li>
      ))}
    </ul>
  );
}

function Ci({ state }) {
  const label = { red: "1 failing", green: "green", blocked: "1 failing" }[state];
  return (
    <div className={`gig-ci ${state === "green" ? "green" : "red"}`} aria-live="polite">
      <span>CI</span>
      <strong>{label}</strong>
    </div>
  );
}

function SingleRun({ slide, revealed }) {
  const move = MOVE[slide.run[0]];
  const out = evaluate(move.id, slide.referee);
  const total = out.verdicts.length + 2;
  const showOutcome = revealed >= total;
  return (
    <div className="gig-stage-body">
      {revealed >= 1 ? (
        <Patch move={move} />
      ) : (
        <p className="gig-waiting">The diff appears here.</p>
      )}
      <ol className="gig-verdicts">
        {slide.referee.length === 0 && revealed >= 1 && <li className="r-none">No referee. Only the test runs.</li>}
        {out.verdicts.slice(0, Math.max(0, revealed - 1)).map((v) => (
          <li key={v.control.id} className={`r-${v.result}`}>
            <span className="gig-who">{v.control.label}</span>
            <span>{v.note}</span>
          </li>
        ))}
      </ol>
      <div className="gig-stage-foot">
        <Ci state={showOutcome ? out.ci : "red"} />
        {showOutcome && (
          <p className={`gig-prod ${out.ships ? "bad" : "stopped"}`}>
            {out.ci === "red" ? "Nothing ships." : out.ships ? `Shipped. ${move.production}` : "Rejected. Nothing ships."}
          </p>
        )}
      </div>
    </div>
  );
}

function MultiRun({ slide, revealed }) {
  return (
    <div className="gig-stage-body">
      <ol className="gig-runs">
        {slide.run.map((id, i) => {
          const out = evaluate(id, slide.referee);
          const shown = revealed > i;
          const stopper = out.verdicts.find((v) => v.result === "block" || v.result === "catch");
          const status = !shown ? "waiting" : out.ships ? "ships" : out.ci === "red" ? "blocked" : "caught";
          const text = {
            waiting: "…",
            ships: "Green. Shipped.",
            blocked: `Blocked by the ${stopper?.control.label.toLowerCase()}`,
            caught: `Caught by ${stopper?.control.label.toLowerCase()}`,
          }[status];
          return (
            <li key={id} className={`gig-run ${status}`}>
              <span className="gig-run-move">{MOVE[id].label}</span>
              <span className="gig-run-file">{FILES[MOVE[id].file]}</span>
              <span className="gig-run-status">{text}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function Board({ revealed }) {
  return (
    <div className="gig-board-wrap">
      <table className="gig-board">
        <thead>
          <tr>
            <th scope="col">Move</th>
            {CONTROLS.map((c) => (
              <th key={c.id} scope="col">
                {c.label}
              </th>
            ))}
            <th scope="col">All four on</th>
          </tr>
        </thead>
        <tbody>
          {MOVES.map((move, i) => {
            const all = evaluate(move.id, ALL);
            if (i >= revealed) {
              return (
                <tr key={move.id} className="pending">
                  <th scope="row">{move.label}</th>
                  <td colSpan={CONTROLS.length + 1} />
                </tr>
              );
            }
            return (
              <tr key={move.id} className={`shown ${move.id === "fix" ? "work" : ""}`}>
                <th scope="row">{move.label}</th>
                {CONTROLS.map((c) => {
                  const r = verdictFor(c.id, move.id).result;
                  return (
                    <td key={c.id} className={`r-${r}`}>
                      {MARK[r]}
                    </td>
                  );
                })}
                <td className={all.ships ? (move.id === "fix" ? "r-good" : "r-ships") : "r-stopped"}>
                  {all.ships ? (move.id === "fix" ? "ships, fixed" : "ships, bug") : "stopped"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="gig-legend">
        <span className="r-pass">✓ lets it through</span>
        <span className="r-advise">~ advises against</span>
        <span className="r-block">■ blocks</span>
        <span className="r-catch">● catches</span>
        <span className="r-idle">– did not run</span>
      </p>
    </div>
  );
}

export default function GetItGreen() {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(0);
  const [running, setRunning] = useState(false);
  const [seen, setSeen] = useState(0);
  const ahaRef = useRef(null);

  const slide = SLIDES[index];
  const multi = slide.run && slide.run.length > 1;
  const isMap = slide.id === "map";
  const total = isMap
    ? MOVES.length
    : !slide.run
      ? 0
      : multi
        ? slide.run.length
        : evaluate(slide.run[0], slide.referee).verdicts.length + 2;
  const done = (!slide.run && !isMap) || revealed >= total;
  const last = index === SLIDES.length - 1;

  useEffect(() => {
    setRevealed(0);
    setRunning(false);
    setSeen((s) => Math.max(s, index));
    window.scrollTo({ top: 0 });
  }, [index]);

  useEffect(() => {
    if (!running) return undefined;
    if (revealed >= total) {
      setRunning(false);
      return undefined;
    }
    const t = setTimeout(() => setRevealed((r) => r + 1), revealed === 0 ? 150 : STEP_MS);
    return () => clearTimeout(t);
  }, [running, revealed, total]);

  useEffect(() => {
    if (done && revealed > 0 && window.matchMedia("(max-width: 900px)").matches) {
      ahaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [done, revealed]);

  const next = useCallback(() => setIndex((i) => Math.min(i + 1, SLIDES.length - 1)), []);
  const primary = useCallback(() => {
    if (running) return;
    if (done && last) setIndex(0);
    else if (done) next();
    else setRunning(true);
  }, [running, done, last, next]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest && e.target.closest("button, a, input")) return;
      if (e.key === "ArrowRight" && done) next();
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [done, next]);

  const primaryLabel = slide.id === "intro" ? slide.action : done ? (last ? "Start over" : "Next") : running ? "Running…" : slide.action;

  return (
    <div className="gig-shell">
      <nav className="gig-steps" aria-label="Slides">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            className={`${i === index ? "current" : ""} ${i <= seen ? "seen" : ""}`}
            disabled={i > seen}
            onClick={() => setIndex(i)}
            title={s.step}
            aria-current={i === index ? "step" : undefined}
          >
            <span>{String(i).padStart(2, "0")}</span>
            {i === index && <> {s.step}</>}
          </button>
        ))}
      </nav>

      <main className={`gig-slide gig-slide-${slide.id}`} key={slide.id}>
        {slide.id === "intro" && (
          <section className="gig-intro">
            <p className="gig-kicker">New Software Primitives · Loops 3/3</p>
            <h1>{slide.title}</h1>
            {slide.lines.map((l) => (
              <p key={l} className="gig-lead">
                {l}
              </p>
            ))}
            <div className="gig-ticket">
              <div>
                <span className="gig-tag">Bug #412</span>
                <p>Loyal customers who use a coupon get their 10% loyalty discount twice.</p>
                <code>expected 85, received 76</code>
              </div>
              <Ci state="red" />
            </div>
            <button type="button" className="gig-primary" onClick={primary}>
              {primaryLabel} <span aria-hidden="true">→</span>
            </button>
            <p className="gig-back">
              <Link to="/loops">← Loops 2/3: Who Decides Done?, the rules this page tests</Link>
            </p>
          </section>
        )}

        {slide.run && (
          <section className="gig-grid">
            <div className="gig-text">
              <p className="gig-kicker">
                {String(index).padStart(2, "0")} · {slide.step}
              </p>
              <h2>{slide.title}</h2>
              {slide.lines.map((l) => (
                <p key={l} className="gig-lead">
                  {l}
                </p>
              ))}
            </div>
            <div className="gig-stage">
              <RefereeStrip active={slide.referee} />
              {multi ? <MultiRun slide={slide} revealed={revealed} /> : <SingleRun slide={slide} revealed={revealed} />}
            </div>
            <div className="gig-act">
              <button
                type="button"
                className={`gig-primary ${done ? "next" : ""}`}
                onClick={primary}
                disabled={running}
              >
                {primaryLabel} <span aria-hidden="true">→</span>
              </button>
              <div className={`gig-aha ${done ? "show" : ""}`} aria-live="polite" ref={ahaRef}>
                {done && (
                  <>
                    <p className="gig-aha-head">{slide.aha}</p>
                    <p className="gig-aha-after">{slide.after}</p>
                  </>
                )}
              </div>
            </div>
          </section>
        )}

        {last && (
          <section className="gig-final">
            <p className="gig-kicker">
              {String(index).padStart(2, "0")} · {slide.step}
            </p>
            <h2>{slide.title}</h2>
            <p className="gig-lead">{slide.lines[0]}</p>
            <Board revealed={revealed} />
            <button type="button" className={`gig-primary ${done ? "next" : ""}`} onClick={primary} disabled={running}>
              {primaryLabel} <span aria-hidden="true">→</span>
            </button>
            <div className={`gig-aha ${done ? "show" : ""}`} aria-live="polite" ref={done ? ahaRef : undefined}>
              {done && (
                <>
                  <p className="gig-aha-head">{slide.aha}</p>
                  <p className="gig-takeaway">
                    Before you trust a green check, list the ways to reach green without doing the work, and name the
                    control that closes each one.
                  </p>
                  <p className="gig-foot">
                    Why a check and not the model accepts the work: <Link to="/loops">Who Decides Done?</Link>
                  </p>
                  <p className="gig-foot">
                    Quote:{" "}
                    <a href="https://claude.com/blog/the-ai-native-sdlc-playbook" target="_blank" rel="noreferrer">
                      Anthropic, "The AI-native SDLC playbook" (2026-08-21)
                    </a>
                    . The checkout code, the ticket, the incident and the rule are invented for this page.
                  </p>
                </>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
