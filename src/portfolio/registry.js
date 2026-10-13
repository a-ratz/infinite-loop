// Portfolio registry: open-source work, each with its own interactive page.
import Flock from "./flock";
import Tare from "./tare";
import Atlas from "./atlas";

export const works = [
  {
    slug: "flock",
    title: "Flock",
    kind: "agent framework",
    description:
      "A Python framework where LLM agents declare typed inputs and outputs, and a blackboard handles routing, validation and access control.",
    readout: ".consumes(BugAnalysis, SecurityAnalysis)",
    color: "#ffc24b",
    navLabel: "portfolio",
    component: Flock,
  },
  {
    slug: "tare",
    title: "Tare",
    kind: "eval tooling",
    description:
      "Starts Claude Code, Codex, Pi or Antigravity in a sandbox only after a probe proves none of your personal setup got in.",
    readout: "$ tare probe claude → tare: 0.00",
    color: "#c8f560",
    navLabel: "portfolio",
    component: Tare,
  },
  {
    slug: "atlas",
    title: "Atlas",
    kind: "agent workspace",
    description:
      "A local web app where Claude Code, Codex or other agents grow a Markdown knowledge vault in git while you read along.",
    readout: "npx skills add a-ratz/atlas -g -s atlas",
    color: "#ff7a59",
    navLabel: "portfolio",
    component: Atlas,
  },
];
