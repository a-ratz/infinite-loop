# Get It Green - Companion Notes

## Concept Summary

Get It Green is part 3 of the Loops series (Loops 3/3) in New Software Primitives. Who
Decides Done? says a check, not the model, accepts the work, and that expected
values live where the agent cannot edit them. This post hands the reader the
agent's seat and a red test, and lets them find out which ways to green each
control actually closes. The protected test is one of them. The closing links
back to Who Decides Done?.

The claim:

```text
A control closes the doors it watches. Before you trust a green check, list the
ways to reach green without doing the work, and name the control that closes
each one.
```

It is the companion to Andre's LinkedIn article on Anthropic's AI-native SDLC
playbook (2026-10-26). The playbook's line "The skill makes violations rare and
the hook makes them close to impossible" is the starting point; the post shows
that the hook makes one door close to impossible.

## Interaction Model

A slide deck in the pattern of the Atlas portfolio page: one slide at a time,
step chips on top, and on every slide exactly one highlighted button. Clicking
it plays a short replay on the right (the diff, then each referee's verdict,
then CI and what ships), and the aha line appears under the button, which then
turns into "Next". Arrow keys move between finished slides; on narrow screens
the page scrolls to the aha line.

| # | Slide | Referee | The one action | Aha |
| --- | --- | --- | --- | --- |
| 00 | The ticket | - | Take the ticket | - |
| 01 | No referee | none | Edit the test | Green. Merged. Shipped. |
| 02 | The hook | skill + hook | Edit the test again | Blocked. |
| 03 | Another door | skill + hook | Mock it in the test setup | Green again. |
| 04 | All doors | skill + hook | Try all five shortcuts | 4 of 5 shipped. |
| 05 | Mutation tests | + mutation | Run the five again | 0 of 5 shipped. |
| 06 | Quick fix | + mutation | Take the quick fix | Green. Every check passed. |
| 07 | Standing rules | all four | Run the quick fix again | Caught. |
| 08 | One more door | all four | Try it (quarantine + narrow the mutants) | Green. Shipped. |
| 09 | The map | - | Show the map | One real fix. One door still open. |

The map fills row by row: every move against every control, plus the result
with all four on, then the takeaway and the links.

## Outcome Logic

All in `verdictFor` in `index.jsx`:

| Move | Skill | Hook | Mutation tests | Standing rules |
| --- | --- | --- | --- | --- |
| Fix the bug | pass | pass | pass | pass |
| Quick fix | pass | pass | pass | catch (R-03) |
| Edit the test | advise | block | pass | did not run |
| Hardcode | advise | pass | catch | pass |
| Mock | advise | pass (setup file) | catch | did not run |
| Quarantine | advise | pass (config) | catch | did not run |
| Stop collecting | advise | pass (config) | catch | did not run |
| Quarantine + narrow the mutants | advise | pass (config) | pass (file not mutated) | did not run |

Design choices behind the table:

- The skill never stops anything. That is the point of "advisory".
- A block stops evaluation, so later controls do not report for that run.
- Mutation tests pass the edited test on purpose: a test that asserts the wrong
  price still kills mutants. That door belongs to the hook.
- The register check (R-03, loyal customers get 10% on every order, from a
  February incident) runs in its own harness and only when a change touches a
  file in its area (`discount.js`). For moves that touch only tests or config it
  reports that it did not run.
- With skill and hook, four of the five shortcuts on slide 04 ship. With all
  four controls one move still does: the eighth move touches two config files, so the
  hook ignores it, the mutation tool no longer looks at `discount.js`, and R-03
  never wakes. Every control brings files of its own, and each is another door.
- A larger version stays open: cells recorded from real test runs in a small
  repo instead of the hand-written verdict table.

The checkout code, ticket, incident and rule are invented for the page and say
so in the footer. Mutation results are described in words, not counts, because
the example is a toy.

## Visual Language

- Typography and tokens of the Loops pair: Big Shoulders Display for titles and
  aha lines (uppercase), IBM Plex Sans for text, JetBrains Mono for metadata,
  mint `#6fffd9`; registry color `#56ffd0` like the pair.
- The one action is a filled mint button with a slow pulse; after the replay it
  turns into an outlined "Next".
- Aha lines: red when a shortcut ships, amber when a control stops it.
- Desktop: text and button left, the replay stage right. Mobile: text, stage,
  then button and aha; non-current step chips show only their number.
- Code patches wrap instead of scrolling; ligatures off so `=>` reads as typed.

## Verification

2026-10-26, on top of main `be8705e`: `npm run build` green,
`scripts/static-routes.mjs` includes `get-it-green`. Playwright with Chrome at
1440x900 and 390x844 clicked through all ten slides (the aha lines in the table
above appear in order), Start over returns to the title; home card and the link
to Who Decides Done? work; no console errors, no horizontal page scroll on
mobile (the map table scrolls inside its wrapper).
