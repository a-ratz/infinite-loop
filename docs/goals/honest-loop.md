# /goal Prompt: Build The Honest Loop

Read `AGENTS.md`, then execute this goal end to end.

Create a new Infinite Loop entry called **The Honest Loop**: a minimal,
beautiful, layman-readable interactive article about why loops matter more than
heroic one-shot prompts.

This should not feel like a demo app, dashboard, graph editor, patchbay, or
agent-architecture tool. It should feel like an elegant editorial page that
wakes up as the reader scrolls. Think closer to the existing About page than to
The Stack.

## Core Claim

Teach one primitive:

```text
A prompt asks once.
A loop tries, checks, changes, and knows when to stop.
```

The reader should understand the idea at first glance, before reading any
technical explanation.

Avoid agent jargon in the first half of the page. Do not lead with "harness",
"controller", "evaluator", "topology", "trace", or "autonomy". Those can appear
later only after the primitive is emotionally and visually obvious.

## Deliverables

Add a complete post implementation:

- `src/posts/2026-06-10-honest-loop/index.jsx`
- optional local files beside it if useful
- a registry entry in `src/posts/registry.js`
- `docs/companion/2026-06-10-honest-loop.md`

Suggested registry metadata:

```js
{
  slug: "honest-loop",
  title: "The Honest Loop",
  description:
    "A minimal scroll essay about the difference between asking once and learning through feedback.",
  date: "2026-06-10",
  type: "interactive essay",
  color: "#56ffd0",
  series: "NSP",
  seriesFull: "New Software Primitives",
  component: HonestLoop,
}
```

No live LLM calls. No network calls. No new dependencies unless truly needed.

## Experience Shape

The page should be immediately understandable to a non-technical reader.

Use one central visual metaphor:

```text
Ask -> Try -> Check -> Change -> Stop
```

Render it as a large luminous loop, not as a complex UI. The loop should be the
first-viewport signal. It can be a ring, orbit, path, or vertical cycle, but it
must read instantly as a repeated process.

The page should be mostly scroll-driven. A single simple toggle is allowed:

```text
Prompt / Loop
```

The toggle should change the central example, not open a complicated simulator.

## Narrative Arc

Build the article around this sequence:

1. **Opening**
   - Headline idea: "Prompts Ask. Loops Learn."
   - Show the glowing loop immediately.
   - Supporting copy: one short sentence about asking once versus learning from
     feedback.

2. **Prompt Mode**
   - Show a polished one-shot answer to a simple task.
   - It should look confident and plausible.
   - Then reveal the problem: fluency feels like proof, but it is not proof.

3. **Loop Mode**
   - Use the same task.
   - Animate through five plain-language stages:
     - Ask
     - Try
     - Check
     - Change
     - Stop
   - The answer should visibly improve after the Check stage.
   - Stop should feel satisfying: the loop ends because evidence says enough,
     not because the model sounded proud.

4. **Everyday Loops**
   - Three short examples that any reader can understand:
     - Cooking: cook, taste, adjust, stop.
     - Writing: draft, read, revise, publish.
     - Coding: change, test, fix, commit.
   - These should be editorial beats, not mini apps.

5. **The AI Turn**
   - Only here connect the primitive to AI agents.
   - Explain: the model is not the loop; the loop is the workbench around it.
   - Mention evidence, tools, tests, review, and stopping conditions in plain
     language.

6. **Closing**
   - Land on a memorable final line:
     - "The future is not better prompts. It is better stopping conditions."
   - Or a sharper variant if the implementation finds one.

## Main Example

Use one simple example throughout the article:

```text
Task: Write a short release note for a feature.
```

Prompt Mode answer:

```text
Workspace sharing is here. Invite your team, collaborate instantly, and keep
every project moving from one shared home.
```

Problem revealed:

```text
The feature is real, but the permission caveat matters. The prompt promised
"collaborate instantly" before checking what shipped.
```

Loop Mode progression:

- **Ask**: write the release note.
- **Try**: produce the first answer.
- **Check**: compare against the shipped behavior.
- **Change**: revise the note to include the permission caveat.
- **Stop**: final note is marked "checked against source".

Final answer:

```text
Workspace sharing is now available for team projects. Invite collaborators,
keep ownership visible, and review permission details before rollout.
```

This example is intentionally mundane. The power comes from making the feedback
visible.

## Interaction Requirements

Keep interaction minimal:

- The Prompt / Loop toggle should be obvious and reachable.
- Scroll should advance or highlight the loop stages.
- The active loop stage should be visually clear.
- The answer should change in Loop Mode as the stages advance.
- There should be a small "receipt" or evidence mark at the end:
  `checked against source`, `stopped with evidence`, or similar.

Optional but welcome:

- A replay button for the loop animation.
- A small progress marker around the loop.
- Soft stage transitions tied to scroll position.

Do not build:

- graph editors
- draggable patch cables
- many scenario selectors
- dashboards full of metrics
- more than one primary example
- dense agent terminology in the UI

## Visual Direction

Elegant, minimal, premium, and concept-forward.

Design language:

- dark editorial canvas
- huge typography
- one luminous cyan loop
- restrained amber/red evidence marks
- thin vector lines
- slow orbiting light
- sparse copy
- generous breathing room
- no card soup
- no enterprise orchestration aesthetic

The page should feel like a concept poster that moves.

Reference the About page's editorial confidence, but make this entry more
technical, colder, and more kinetic. The reader should remember one image: the
loop lighting up as the answer becomes more honest.

## Layout Requirements

Desktop:

- first viewport shows title, one-sentence premise, and the loop visual
- a hint of the next section is visible
- toggle is near the central visual, not hidden in a toolbar
- long copy never sits in cramped panels
- no overlapping text or controls

Mobile:

- no horizontal overflow
- title fits comfortably
- loop visual remains legible
- toggle remains reachable
- stage labels are readable without tiny text
- copy is broken into short paragraphs

Use stable dimensions for the loop visual, toggle, answer block, and stage
labels so animation does not cause layout jumps.

## Implementation Guidance

Follow existing project conventions:

- React 18 + Vite
- React Router route generated from `src/posts/registry.js`
- Tailwind is available, but this post can use inline styles or local CSS for
  stronger visual control
- keep the post self-contained
- do not touch `wrangler.jsonc`
- do not introduce private/internal references

Recommended component structure:

- `HonestLoop` top-level post
- `LoopGlyph`
- `PromptLoopToggle`
- `AnswerComparison`
- `EverydayLoopExamples`
- `ClosingStatement`

State can be very simple:

- mode: `prompt` or `loop`
- active stage
- whether the loop animation has played

## Companion Note

Create `docs/companion/2026-06-10-honest-loop.md` with:

- concept summary
- visual language notes
- interaction model
- implementation architecture
- copy decisions
- verification performed
- known tradeoffs
- future expansion ideas

## Verification

Run:

```bash
npm run build
```

Then run the app locally and inspect it with the available **`agent-browser`**
skill. Use browser automation for:

- home card appears and links to `/honest-loop`
- `/honest-loop` loads without runtime errors
- Prompt / Loop toggle works
- Loop Mode visibly advances through Ask, Try, Check, Change, Stop
- final receipt/evidence mark appears
- desktop screenshot has no obvious overlap or unreadable text
- mobile viewport has no horizontal overflow
- mobile title, loop visual, toggle, and stage labels are readable

If `agent-browser` cannot run for an environmental reason, state that clearly
in the final report and still run the production build.

## Definition Of Done

The work is done when:

- the route `/honest-loop` exists
- the registry entry is added
- the post is understandable at first glance
- the post feels like an editorial Infinite Loop entry, not a demo app
- Prompt Mode and Loop Mode meaningfully differ
- the loop teaches Ask, Try, Check, Change, Stop
- the AI connection appears only after the primitive is clear
- companion docs are written
- `npm run build` passes
- `agent-browser` verification has been performed or explicitly reported as
  unavailable
