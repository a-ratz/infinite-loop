// Facts on the Atlas page. Each one was checked on 2026-10-13 against the public repo a-ratz/atlas
// (cloned from GitHub that day; app version 0.6.2 after the evening release) or the GitHub API.

export const REPO_URL = "https://github.com/a-ratz/atlas";
export const DEMO_URL = "https://a-ratz.github.io/atlas/";
export const INSTALL = "npx skills add a-ratz/atlas -g -s atlas"; // README, Quick start

export const FACTS = [
  {
    label: "Agents",
    value: "Claude Code, Codex, pi, OpenCode",
    note: "Any harness that can run a shell command can drive it.",
    // README badge "Works with Claude Code, Codex, pi, OpenCode"; README "How it works": "Any harness
    // that can run a command can operate Atlas; no plugin API is involved."
  },
  {
    label: "Storage",
    value: "Markdown in git",
    note: "No database. Delete the index and nothing is lost.",
    // README intro: "The files are the truth, git is the history, and there is no database and no
    // account." README "How it works": "The index is rebuilt from the files; delete it and nothing is lost."
  },
  {
    label: "Runs on",
    value: "localhost:8765",
    note: "A local server with no account and no login.",
    // engine/atlas.py: DEFAULT_PORT = 8765, serve --host default "127.0.0.1"; atlas-operator SKILL.md,
    // Safety: "It binds to 127.0.0.1 and has no login."
  },
  {
    label: "Engine",
    value: "One Python file",
    note: "engine/atlas.py, run by uv with four pinned packages.",
    // engine/atlas.py inline script metadata: starlette, uvicorn, markdown-it-py, PyYAML (all pinned).
  },
  {
    label: "Release",
    value: "0.6.2 · MIT",
    note: "Eight workflow skills ship with the app.",
    // skills/atlas/app/VERSION = 0.6.2 (0.6.2 added atlas-cabinet); LICENSE (MIT, also GitHub API license.spdx_id);
    // skills/atlas/app/.agents/skills/: atlas-operator, -learn, -distill, -map, -sketch, -project, -clean-demo.
  },
];
