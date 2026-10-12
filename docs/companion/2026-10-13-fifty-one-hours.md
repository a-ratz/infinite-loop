# Fifty-One Hours - Companion Notes

## Concept

Part 1 of 2 in the Loops pair within "New Software Primitives". Part 2, "Who Decides Done?", states
the general rules. This one is the field recording of a coding agent that worked through the Flock
backlog for 51 hours, from Saturday 10 October 2026, 10:34 CEST, to Monday 12 October, 13:41 CEST.

The post is a flight recorder. The tape plots every merged pull request on its branch lane
(main, ui-rework, stacked) at its real merge time, sized by lines changed. Every human message
is an amber line whose height follows its length. Dragging the playhead rolls the counters, dims
what has not happened yet and unlocks the standing rules when the loop learned them.

The thesis matches the text draft: the interesting part is what makes it safe to stop watching,
not the agent. People own the specification, the checks and the acceptance.

## Data

All numbers come from data files in `data/`, built on 2026-10-13:

- `prs.json`: the 88 pull requests merged in the window, excluding #627 (a manual fix, not from
  the loop). Fields: number, title, base branch, opened and merged times, lines added and deleted,
  Copilot reviews (reviews by `copilot-pull-request-reviewer`) and Codex rounds (PR comments
  that start with "**Local Codex review"). Source: GitHub API.
- `messages.json`: 123 human messages with time, kind (typed turn or message sent during a
  running step) and length only, no content. Source: the Claude Code session logs of the loop
  (original session plus its fork), with duplicates within 15 minutes counted once.

Derived and checked:

- median open-to-merge time: 28 minutes
- merges by lane: 54 / 22 / 12 (main / ui-rework / stacked)
- Copilot: 165 reviews on 61 PRs
- Codex: 76 rounds on 23 PRs
- longest message gap: 9.9 h (Sun 00:20 to 10:16 CEST), with 12 merges inside it

Fixed facts from the repository and the session:

- 3,289 backend tests (pytest) and 676 frontend tests (vitest) per run
- 81 live-check screenshots linked by commit SHA
- 188 entries in `docs/internal/design-system/autonomous-decisions.md` on `ui-rework` at the
  snapshot

## Decisions

- **A different face inside the series.** The dark grid and the mint accent stay. Headings use
  Big Shoulders Display (a condensed, signage-like face that reads like instrument labels) and
  body text IBM Plex Sans, so the post feels like a recorder rather than an essay.
- **Codex as an accident, told honestly.** Codex did not start as a planned second reviewer.
  Copilot's quota ran out in the middle of #602. On that PR, after Copilot's three rounds, the
  local Codex review found twelve more real issues, and Codex became the default reviewer.
- **Gaps get their own red panel.** It lists lint not blocking, a 75 percent coverage gate,
  stacked PRs without CI, merges with open recommendations and no human approval.
- **Reduced motion.** Playback jumps to the end instead of animating.

## Text source

`writings/work/51-hour-agent-loop-blog.md` in the author's knowledge base holds the plain-text
version of the same piece.
