// Every number on the Tare page, with its source. Checked on 2026-10-13 against
// github.com/a-ratz/tare at commit e3836df and https://pypi.org/pypi/tare-cli/json.

export const REPO = "https://github.com/a-ratz/tare";
export const PYPI = "https://pypi.org/project/tare-cli/";
export const COMMIT = "e3836df";

// pyproject.toml: name = "tare-cli", version = "0.3.0"; PyPI lists 0.2.0 and 0.3.0 (2026-10-06).
export const PACKAGE = { name: "tare-cli", version: "0.3.0" };

export const FACTS = [
  // src/tare/agents.py, last line: AGENTS = {Claude(), Codex(), Pi(), Antigravity()}
  { value: "4", label: "agent CLIs", note: "Claude Code, Codex, Pi, Antigravity CLI" },
  // src/tare/probe.py, render(): "tare: 0.00", "tare: N leaks", "tare: not proven (blind)"
  { value: "3", label: "possible readings", note: "0.00, a count of leaks, or not proven" },
  // src/tare/probe.py, score(): the classes it appends to `seen`: parent files, extensions,
  // instructions, memories, home path, mcp, skills, plugins, agents, email, reach
  { value: "11", label: "kinds of context checked", note: "instructions, memories, skills, MCP and seven more" },
  // README, "The words tare uses": the probe "makes no paid model calls"; src/tare/fake.py
  { value: "0", label: "paid model calls per probe", note: "a fake model server answers" },
  // `uv run pytest --collect-only -q`: "114 tests collected"; .github/workflows/ci.yml runs pytest on every PR
  { value: "114", label: "tests", note: "pytest, run by CI on every pull request" },
];
