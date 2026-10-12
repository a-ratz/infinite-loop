# /goal Prompt: Build The Loopwright

Read `AGENTS.md`, then execute this goal end to end.

Create a new Infinite Loop post called **The Loopwright**: an interactive essay
about the shift from prompt engineering to loop engineering. The post should
make the reader feel the difference between asking a model for one answer and
designing a bounded feedback system where model work has to collide with
evidence before it counts.

This is a design-led Infinite Loop entry. Do not make a static article with a
few decorative widgets. Build the idea as an experience.

## Core Claim

The post teaches this idea:

```text
A prompt asks for an answer.
A spec describes the desired state.
A loop defines how work earns another try, a repair, acceptance, escalation, or a stop.
```

"Loops not prompts" is not anti-prompt. Prompts still exist, but they are no
longer the unit of done. The useful unit is the controller around the model:
state, context, tools, evidence, checks, budgets, authority boundaries, traces,
stop reasons, and human gates.

The reader should leave with a practical question set:

- Where is the state?
- What touches the world?
- What evaluates the result?
- What evidence survives?
- What caps the loop?
- What stops it?
- What prevents the loop from polishing its favorite wrong frame?

## Source Refresh

Use the brief below as sufficient source material. If QMD is available, refresh
the concept before implementation with searches for:

- `loops not prompts`
- `I do not prompt, I loop`
- `Loopify`
- `Loopwright`
- `bounded feedback controller`
- `loops without independent evaluators`
- `harness loop contracts`

High-signal ideas to preserve:

- Loop engineering moves AI work from promptcraft to feedback-control design.
- Useful loops need explicit contracts: goal, evaluator, state, authority,
  budget, stop conditions, trace, and escalation.
- Loops without independent evaluators optimize the model's frame instead of
  the task.
- Code, tests, schemas, logs, screenshots, and traces are harness surfaces
  because they are executable, inspectable, persistent, and rejectable.
- Green checks are not magic. Verification has to say what was checked, what
  was not checked, and what residual risk remains.
- Active artifacts are resident loops attached to software objects: a failure
  inbox, proof policy, thread continuity, proposal generator, acceptance path,
  and casefile memory.

## Deliverables

Add a complete post implementation:

- `src/posts/2026-06-09-loopwright/index.jsx`
- optional local files beside it if useful, such as `data.js` or
  `LoopwrightDemo.jsx`
- a registry entry in `src/posts/registry.js`
- `docs/companion/2026-06-09-loopwright.md`

Suggested registry metadata:

```js
{
  slug: "loopwright",
  title: "The Loopwright",
  description:
    "A patchbay simulator for the craft of building AI feedback loops instead of heroic one-shot prompts.",
  date: "2026-06-09",
  type: "interactive",
  color: "#56ffd0",
  series: "NSP",
  seriesFull: "New Software Primitives",
  component: Loopwright,
}
```

No live LLM calls. No network calls. No new dependencies unless a strong local
reason emerges. This should be a deterministic, self-contained teaching
simulator.

## Experience Shape

The first screen should be the actual experience, not a marketing hero. It can
have a strong editorial opening, but the reader should immediately see the
workbench.

Design the post as a **synth patchbay meets lab bench**:

- dark technical/editorial base that still belongs to Infinite Loop
- graphite/black background, not a flat slate wash
- one strong accent, suggested `#56ffd0`, with secondary warning/signal colors
  used sparingly for risk, cost, evidence, and stop states
- sharp modules with stable dimensions
- visible signal paths, patch cables, or circuit traces between modules
- tiny oscilloscope-like strips for evidence, confidence, risk, and cost
- evaluator lamps, stop-reason badges, trace receipts, and status pulses
- tactile interaction: toggling, wiring, running, observing, autopsying

Avoid an enterprise orchestration dashboard. It should feel like discovering a
new instrument, not configuring a SaaS admin panel. Do not let the page become
card soup. Use cards only for genuinely repeated items or framed controls.

## Required Interaction

Build a patchbay simulator with three concrete task scenarios:

1. **Write a release note** for a small product change.
2. **Repair a parser** after a failing production example.
3. **Research a claim** and decide whether it can be published.

The default scenario should be **Repair a parser**, because it makes evidence
and stop rules easiest to see.

Each scenario must support:

- **Prompt Mode**: reader runs a plausible one-shot prompt and gets a smooth
  answer with weak evidence.
- **Loop Mode**: reader wires or toggles loop components, runs the loop, and
  watches metrics and trace events change.
- **Failure Autopsy**: after a run, a drawer or panel names the missing
  primitive, symptom, and fix.

Patchbay modules:

- Generator
- Context Builder
- Tool / World Contact
- Evaluator
- Memory / Trace
- Budget
- Stop Condition
- Human Checkpoint
- Break Favorite Frame
- Authority Boundary
- Change Contract

The reader does not need a fully general graph editor. A good v0 can combine
module toggles with preset loop archetypes, as long as the visible wiring and
simulation respond honestly to the selected topology.

Required archetypes:

- **Prompt Only**: smooth answer, no trace, no stop reason.
- **Self Evaluator**: style improves while evidence stays flat.
- **No Budget**: the loop keeps polishing and burns cost.
- **No External Evidence**: confidence rises while task grounding does not.
- **Tool Without Boundary**: evidence improves but risk rises because authority
  widened too far.
- **Evidence Loop**: deterministic check or external source pushes the loop
  toward a real stop reason.
- **Break Favorite Frame**: confidence drops, an alternate interpretation
  appears, and evidence improves after the loop attacks its preferred frame.

## Simulation Rules

The simulator should be deterministic and legible. It should not pretend to
measure real agent behavior. Use named signals instead of fake precision.

Useful metric labels:

- Evidence
- Confidence
- Risk
- Cost
- Trace Quality

Example trace events:

- `generated plausible answer`
- `self-review improved style but found no new evidence`
- `fixture failed on quoted comma case`
- `external example contradicted release-note claim`
- `budget reached attempt 3`
- `authority boundary denied publish action`
- `human checkpoint required before public claim`
- `stop reason: success`
- `stop reason: escalated`
- `stop reason: budget-exhausted`

Failure autopsy shape:

```text
Missing: independent evaluator
Symptom: confidence rose while evidence stayed flat
Fix: compare against a fixture, source document, external example, or human review
```

The autopsy should be the teaching surface. It should avoid generic "good/bad"
judgment and instead name the structural primitive that changed the loop.

## Narrative Beats

The post should move through this arc without forcing the reader through a long
linear essay:

1. The reader starts with a familiar prompt box and a task.
2. Prompt Mode returns something plausible enough to be dangerous.
3. The prompt box unfolds into a loop workbench.
4. The reader wires or selects a topology and runs it.
5. The loop produces a trace, metrics, and a stop reason or failure mode.
6. The autopsy explains what primitive was missing.
7. The reader can switch scenario or topology and see a different failure.
8. The final panel lands the idea: the craft is authoring the conditions under
   which model output earns continuation, rejection, or done.

Strong copy direction:

- "Stop writing heroic prompts. Start writing contracts reality can check."
- "The goal is not to make the model more confident. The goal is to make it
  less able to hide from evidence."
- "More turns are not more truth."
- "A trace is not decoration. It is the receipt."
- "The loop is only as honest as what it has to collide with."

Use these as inspiration, not mandatory slogans everywhere.

## Layout Requirements

Desktop:

- full-bleed post experience within `PostLayout`
- left rail or top strip for task/scenario selection
- central patchbay/workbench with visible modules and signal paths
- right rail or lower panel for metrics, trace, and failure autopsy
- run controls always easy to find
- no overlapping text or controls at 1440px width

Mobile:

- no horizontal overflow
- patchbay becomes a vertical stacked workbench
- scenario selector becomes a compact segmented control or tabs
- metrics become compact strips
- trace and autopsy remain readable without tiny text
- module labels must not wrap into broken controls

Use stable dimensions for controls, modules, metric bars, and trace rows so the
layout does not jump during a run.

## Implementation Guidance

Follow existing project conventions:

- React 18 + Vite
- React Router route generated from `src/posts/registry.js`
- Tailwind is available, but this post may use local arrays, inline styles, or
  local CSS if that gives stronger control
- keep the post self-contained; do not normalize the whole app around it
- do not touch `wrangler.jsonc`
- do not introduce private/internal references

Recommended component structure:

- `Loopwright` top-level post
- local scenario/archetype/module data
- `ScenarioSelector`
- `PromptConsole`
- `Patchbay`
- `MetricStrip`
- `TraceTimeline`
- `AutopsyPanel`

The state model should be simple:

- selected scenario
- selected archetype or active module set
- current mode: prompt or loop
- run status
- current trace step
- current metrics
- selected autopsy

Animating the run is welcome, but keep it robust. A simple timed stepper over
prewritten trace events is enough.

## Companion Note

Create `docs/companion/2026-06-09-loopwright.md` with:

- concept summary
- implementation architecture
- scenario and archetype data model
- interaction notes
- visual language notes
- known tradeoffs
- verification performed
- future expansion ideas

The companion should help the next agent maintain the post without rereading
all prior memory.

## Verification

Run:

```bash
npm run build
```

Then run the app locally and inspect the new post. If browser automation is
needed, use the **available `agent-browser` skill** for browser automation
testing. It is available in this environment and should be used for the
interactive browser pass: open the local URL, inspect snapshots, interact with
the post, capture screenshots, and test desktop and mobile viewports.

Verify at desktop and mobile sizes:

- home card appears and links to `/loopwright`
- post loads without runtime errors
- Prompt Mode run works
- Loop Mode run works
- switching scenarios changes copy and trace behavior
- toggling or selecting different loop archetypes changes metrics/autopsy
- failure autopsy is visible and readable
- mobile viewport has no horizontal overflow
- no obvious text overlap, clipped labels, or broken controls

If `agent-browser` cannot run for an environmental reason, state that clearly
in the final report and still run the production build.

## Definition Of Done

The work is done when:

- the route `/loopwright` exists
- the registry entry is added
- the post behaves as a tactile interactive essay, not a static article
- at least three scenarios and seven loop archetypes are represented
- prompt-only and evidence-loop behavior feel meaningfully different
- the failure autopsy teaches structural loop primitives
- companion docs are written
- `npm run build` passes
- final report includes files changed, verification, and residual risks
