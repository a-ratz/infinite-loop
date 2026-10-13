# Tare (Portfolio) - Companion Notes

## Concept

Portfolio page for Tare (`a-ratz/tare`, PyPI `tare-cli`) at `/portfolio/tare`.
Tare starts a coding agent in a sandboxed room only after a probe reads
`tare: 0.00`, so an eval measures the skill and not the operator's machine.

## Centerpiece

A JavaScript port of `probe.py` (`score()`, `render()`) and the exit and refusal
logic in `cli.py`, in `data/probe.js`. The output matches the Python format,
including column widths. The reader picks one of four agents (Claude Code, Codex,
Pi, Antigravity CLI) and sets each part of the personal setup to stay out, leak in,
or hide from the dirty twin. The run prints `tare: 0.00`, a leak count, or
`not proven (blind)`. The "Copies placed in the room" preset reproduces the
README's four-leak example. A login that expires within the hour prints "Err" and
exits with 2, as `room.py` does.

## Facts

`data/facts.js` lists every number with its source, checked 2026-10-13 at commit
`e3836df`: 4 agent CLIs, 3 readings, 11 kinds of context, 0 paid model calls per
probe, 114 tests, tare-cli 0.3.0. The sample plugin path in the simulation follows
the shape used in the tests.

## Design

Accent `#c8f560`. A seven-segment scale display in the hero. Classes use the `tre-`
prefix under `.tre-shell`.
