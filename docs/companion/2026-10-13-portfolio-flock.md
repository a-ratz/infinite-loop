# Flock (Portfolio) - Companion Notes

## Concept

Portfolio page for Flock, the open-source Python agent framework by white duck, at
`/portfolio/flock`. The page shows how the framework routes work. A reader posts a
code submission to a blackboard, and the agents whose contracts consume that type
run and publish new typed artifacts. No agent names another agent.

## Centerpiece

A browser port of the scheduling rules (`sim.js`, scenario in `data/scenario.js`).
The checks run in the order `AgentScheduler.schedule_artifact` uses: visibility,
then type and `where` predicate, then the AND gate. Three switches show rules in
action:

- `PrivateVisibility` hides SecurityAnalysis from the notifier.
- A model answer with severity "Urgent" fails the Pydantic pattern. The output is
  rejected, a WorkflowError is published, and the reviewer's AND gate waits.
- "Add a perf agent" adds one subscription and changes nothing else.

The model answers are scripted, and the page says so. With reduced motion the run
jumps to its final state.

## Facts

`data/facts.js` lists every number with its source, checked 2026-10-13: 1,789 of
2,070 commits on main by André (1,608 as `a-ratz` plus 181 under an unlinked
author name), 121 stars, release 0.5.700 (2026-10-06), about 2,800 tests (README).
The limits section comes from ROADMAP.md, open issues and the 0.5.700 release
notes. The Foundry adapter in 0.5.700 was written by another contributor, so the
page names the release, not an author.

## Design

Accent `#ffc24b`. A drifting flock of birds behind the hero title. Classes use the
`flk-` prefix under `.flk-shell`.
