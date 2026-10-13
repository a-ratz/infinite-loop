# Atlas (Portfolio) - Companion Notes

## Concept

Portfolio page for Atlas (`a-ratz/atlas`) at `/portfolio/atlas`. Atlas is a local
web app where Claude Code, Codex or other agents grow a Markdown knowledge vault in
git while the reader follows along in the browser. The live demo at
`https://a-ratz.github.io/atlas/` replays a recorded session on the real front end.

## Centerpiece

A scripted replay of one session in three clicks: learn ("How did ships find their
longitude at sea?"), distill, and build a map. Four panels update together: the
Atlas chat, a vault graph, a file tree, and an agent shell. The shell shows the real
commands and output formats (`wait`, `say --progress`, `commit`, `check`, `next`,
the `inbox.jsonl` record). Any note opens in a two-page book reader with trust,
provenance, frontmatter and clickable wikilinks. The page labels the replay as
scripted. `data/session.js` says which parts follow the repository and which were
written for the page.

The note topic is the history of longitude at sea: the Longitude Act of 1714
(prizes of £10,000, £15,000 and £20,000 for one degree, two thirds and half a
degree), H4's trials (Jamaica 1761-62, Barbados 1764) and the Nautical Almanac
first issued for 1767. One note is marked speculative on purpose.

## Facts

`data/facts.js`, checked 2026-10-13: supported agents (Claude Code, Codex, pi,
OpenCode, any harness that runs a command), Markdown in git with no database,
localhost:8765 with no login, one Python engine file run by uv with four pinned
packages, release 0.6.2 under MIT with eight workflow skills (0.6.2 added
`atlas-cabinet`, people and organization cards with optional LinkedIn enrichment).

## Design

Accent `#ff7a59`. Bodoni Moda for display, Literata for body text, a wire globe in
the hero. Classes use the `atl-` prefix under `.atl-shell`.
