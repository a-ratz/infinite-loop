// A browser model of `tare probe` (src/tare/probe.py at a-ratz/tare e3836df).
// score() and render() follow the Python: the order of the checks, the rows of each finding,
// the column widths and the three readings. The agent runs themselves are simulated.

export const HOME = "/home/me"; // the README shortens the real home path to /home/me
export const PROJECT = "/home/me/project";
export const MIN_LIFETIME = 60; // room.py: MIN_TOKEN_LIFETIME = 3600 seconds
export const RETRY_PAUSE = 10; // probe.py: TWIN_RETRY_PAUSE

// The order in which score() checks the kinds of context. It sets the order of the control
// line and of the leak rows. `env` comes last, from the reach script's variable lines.
const ORDER = [
  "parent files",
  "extensions",
  "instructions",
  "memories",
  "home path",
  "mcp",
  "skills",
  "plugins",
  "agents",
  "email",
  "reach",
  "env",
];

const f = (kind, what, source) => ({ kind, what, source });
const credentials = (path) => f("credentials", path, "copy of the login, needed by the CLI");

const HOME_PATH = {
  cls: "home path",
  label: "Your home path",
  where: "in memory paths and hook output",
  short: "home",
  leaks: [f("home path", `${HOME}/`, "your files")],
};
const REACH = {
  cls: "reach",
  label: "Your files",
  where: "~/.ssh, ~/.aws, ~/.netrc and other secret paths",
  short: "reach",
  leaks: [f("reach", `${HOME}/.ssh`, "visible inside the room")],
};
// Not a class of its own: score() flags any variable outside the room's allowlist.
const ENV = {
  cls: "env",
  label: "Secret shell variables",
  where: "for example an API key exported in your shell",
  short: "env",
  control: false,
  leaks: [f("env", "SPIKE_API_KEY", "inherited environment")],
};

export const AGENTS = {
  claude: {
    label: "Claude Code",
    cmd: "claude",
    version: "2.1.289", // only Claude Code's init event carries a version (claude_code_version)
    email: true,
    expires: true,
    blindPreset: "mcp", // CONCEPT.md: under load, a twin sent its request before its MCP servers connected
    items: [
      {
        cls: "instructions",
        label: "Global instructions",
        where: "~/.claude/CLAUDE.md",
        short: "instr",
        blindable: true,
        leaks: [f("instructions", "global instructions", `${HOME}/.claude/CLAUDE.md`)],
      },
      HOME_PATH,
      {
        cls: "mcp",
        label: "MCP servers and connected accounts",
        where: "connected accounts arrive with the login",
        short: "mcp",
        blindable: true,
        leaks: [f("mcp", "claude_ai_Gmail", "connected account (login)"), f("mcp", "github", "MCP server")],
      },
      {
        cls: "skills",
        label: "Your skills",
        where: "~/.claude/skills",
        short: "skill",
        blindable: true,
        leaks: [f("skills", "1 skill", `${HOME}/.claude/skills`)],
      },
      {
        cls: "plugins",
        label: "Plugins",
        where: "the ones you installed",
        short: "plug",
        leaks: [f("plugin", "myplugin", `${HOME}/plugins/myplugin`)],
      },
      REACH,
      ENV,
    ],
    declared: [
      f("email", "account email", "subscription login"),
      credentials("/home/tare/.claude-config/.credentials.json"),
    ],
  },
  codex: {
    label: "Codex",
    cmd: "codex",
    email: false,
    expires: true,
    blindPreset: "memories",
    items: [
      {
        cls: "instructions",
        label: "Global instructions",
        where: "~/.codex/AGENTS.md",
        short: "instr",
        blindable: true,
        leaks: [f("instructions", "global instructions", `${HOME}/.codex/AGENTS.md`)],
      },
      {
        cls: "memories",
        label: "Memories",
        where: "~/.codex/memories/memory_summary.md",
        short: "mem",
        blindable: true,
        leaks: [f("memories", "memories", `${HOME}/.codex/memories/memory_summary.md`)],
      },
      HOME_PATH,
      {
        cls: "skills",
        label: "Your skills",
        where: "~/.codex/skills and ~/.agents/skills",
        short: "skill",
        blindable: true,
        leaks: [f("skills", "1 skill", `${HOME}/.agents/skills`), f("skills", "1 skill", `${HOME}/.codex/skills`)],
      },
      {
        cls: "plugins",
        label: "Plugins",
        where: "found in the request's skill list",
        short: "plug",
        leaks: [f("plugin", "myplugin", "Codex plugin")],
      },
      {
        cls: "agents",
        label: "Custom agents",
        where: "~/.codex/agents",
        short: "agent",
        blindable: true,
        leaks: [f("agents", "2 agents", `${HOME}/.codex/agents`)],
      },
      REACH,
      ENV,
    ],
    declared: [credentials("/home/tare/.codex/auth.json")],
  },
  pi: {
    label: "Pi",
    cmd: "pi",
    email: false,
    expires: true,
    blindPreset: "skills",
    items: [
      {
        cls: "parent files",
        label: "Instructions above the project",
        where: "~/AGENTS.md",
        short: "parent",
        leaks: [f("parent files", "instructions above the project", `${HOME}/AGENTS.md`)],
      },
      {
        cls: "extensions",
        label: "Extensions",
        where: "the tools they add",
        short: "ext",
        leaks: [
          f("extensions", "fetch_content", "a tool of your extensions"),
          f("extensions", "web_search", "a tool of your extensions"),
        ],
      },
      {
        cls: "instructions",
        label: "Global instructions",
        where: "~/.pi/agent/AGENTS.md",
        short: "instr",
        blindable: true,
        leaks: [f("instructions", "global instructions", `${HOME}/.pi/agent/AGENTS.md`)],
      },
      HOME_PATH,
      {
        cls: "skills",
        label: "Your skills",
        where: "~/.pi/agent/skills",
        short: "skill",
        blindable: true,
        leaks: [f("skills", "1 skill", `${HOME}/.pi/agent/skills`)],
      },
      REACH,
      ENV,
    ],
    declared: [credentials("/home/tare/.pi/agent/auth.json"), credentials("/home/tare/.pi/agent/models.json")],
  },
  agy: {
    label: "Antigravity CLI",
    cmd: "agy",
    email: false,
    expires: false, // agents.py: the Antigravity login keeps its refresh token, so its lifetime is not checked
    blindPreset: "instructions",
    items: [
      {
        cls: "instructions",
        label: "Global rules",
        where: "~/.gemini/GEMINI.md",
        short: "instr",
        blindable: true,
        leaks: [f("instructions", "global instructions", `${HOME}/.gemini/GEMINI.md`)],
      },
      HOME_PATH,
      {
        cls: "skills",
        label: "Your skills",
        where: "~/.gemini/config/skills",
        short: "skill",
        blindable: true,
        leaks: [f("skills", "1 skill", `${HOME}/.gemini/config/skills`)],
      },
      REACH,
      ENV,
    ],
    declared: [credentials("/home/tare/.gemini/antigravity-cli/antigravity-oauth-token")],
  },
};

export const AGENT_KEYS = Object.keys(AGENTS);

export function preset(agent, name) {
  const states = {};
  for (const item of agent.items) {
    let state = "out";
    // the README's dirty excerpt: a room given copies of real settings on purpose
    if (name === "copies" && ["instructions", "home path", "skills", "env"].includes(item.cls)) state = "in";
    if (name === "blind" && item.cls === agent.blindPreset) state = "blind";
    states[item.cls] = state;
  }
  return states;
}

// probe.py score(). A blind class here stayed blind on the retry, so it is also `retried`.
export function score(agent, states) {
  const seen = [];
  const blind = [];
  const leaks = [];
  for (const cls of ORDER) {
    if (cls === "email") {
      if (agent.email) seen.push("email");
      continue;
    }
    const item = agent.items.find((i) => i.cls === cls);
    if (!item) continue;
    const state = states[cls] ?? "out";
    if (item.control !== false) (state === "blind" ? blind : seen).push(cls);
    if (state === "in") leaks.push(...item.leaks.map((leak) => ({ ...leak, cls })));
  }
  return { seen, blind, retried: [...blind], leaks, declared: agent.declared, zero: !leaks.length && !blind.length };
}

// probe.py render()
export function render(agent, reading) {
  const width = Math.max(0, ...[...reading.leaks, ...reading.declared].map((x) => x.what.length)) + 2;
  const rows = (findings) => findings.map((x) => `    ${x.kind.padEnd(13)}${x.what.padEnd(width)}${x.source}`);
  const version = agent.version ? ` ${agent.version}` : "";
  const out = [
    `tare probe · ${agent.cmd}${version} · ${PROJECT}`,
    `  control   dirty twin shows: ${reading.seen.join(", ") || "nothing"}`,
  ];
  if (reading.retried.length) {
    out.push(
      `  retried   the first dirty twin was blind for ${reading.retried.join(", ")}. This reading comes from a second one.`,
    );
  }
  for (const cls of reading.blind) {
    out.push(
      `  BLIND     ${cls}: you have it, but the dirty twin did not show it, so the room cannot be proven clean of it`,
    );
  }
  if (reading.leaks.length) out.push("  leaks", ...rows(reading.leaks));
  else out.push("  leaks     none");
  if (reading.declared.length) out.push("  declared", ...rows(reading.declared));
  return out;
}

export function verdict(reading) {
  if (reading.zero) return "tare: 0.00";
  const n = reading.leaks.length;
  if (n) return `tare: ${n} leak${n === 1 ? "" : "s"}`;
  return "tare: not proven (blind)";
}

// cli.py main(): what `tare probe <agent>` or `tare <agent>` prints, and its exit code.
export function runCommand(agent, states, { command, lifetime, allowDirty }) {
  const cmd = command === "probe" ? `tare probe ${agent.cmd}` : `tare ${agent.cmd}${allowDirty ? " --allow-dirty" : ""}`;
  const lines = [{ t: "cmd", s: `$ ${cmd}` }];

  // room.py _check_login runs before the room exists: no probe, exit 2 (a TareError)
  if (agent.expires && lifetime < MIN_LIFETIME) {
    lines.push({
      t: "err",
      s: `tare: the ${agent.cmd} login token expires in ${Math.max(0, Math.floor(lifetime))} min: start any ${agent.cmd} session to refresh it, then retry`,
    });
    lines.push({ t: "cmd", s: "$ echo $?" }, { t: "out", s: "2" });
    return { lines, error: true, reading: null, exit: 2, started: false };
  }

  const reading = score(agent, states);
  for (const s of render(agent, reading)) lines.push({ t: "out", s });
  const final = verdict(reading);
  lines.push({ t: reading.zero ? "zero" : reading.leaks.length ? "leak" : "blind", s: final });

  if (command === "probe") {
    const exit = reading.zero ? 0 : 1;
    lines.push({ t: "cmd", s: "$ echo $?" }, { t: "out", s: String(exit) });
    return { lines, error: false, reading, exit, started: false };
  }
  if (!reading.zero && !allowDirty) {
    lines.push({
      t: "err",
      s: "tare: not starting, because the room is not proven clean. Fix what the reading names, or pass --allow-dirty.",
    });
    lines.push({ t: "cmd", s: "$ echo $?" }, { t: "out", s: "1" });
    return { lines, error: false, reading, exit: 1, started: false };
  }
  if (!reading.zero) {
    lines.push({
      t: "err",
      s: `tare: --allow-dirty given, running ${agent.cmd} in a room whose reading is not tare: 0.00`,
    });
  }
  lines.push({ t: "note", s: `# ${agent.cmd} starts in the room: your project at /work, HOME=/home/tare` });
  return { lines, error: false, reading, exit: null, started: true };
}
