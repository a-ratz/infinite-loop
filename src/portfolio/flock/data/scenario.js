// The crew on the blackboard. The first three agents are the README quick start;
// perf, pager and notifier are one line each, written with the same API.
// Model answers are scripted. The scheduling rules live in ../sim.js.

export const AGENTS = [
  {
    name: "bug_detector",
    consumes: ["CodeSubmission"],
    publishes: "BugAnalysis",
    ms: 1500,
  },
  {
    name: "security_auditor",
    consumes: ["CodeSubmission"],
    publishes: "SecurityAnalysis",
    ms: 2100,
    privateTo: "reviewer", // only while the visibility rule is on
  },
  {
    name: "perf",
    consumes: ["CodeSubmission"],
    publishes: "PerfAnalysis",
    ms: 1200,
    optional: true, // declared only while the "add an agent" rule is on
  },
  {
    name: "reviewer",
    consumes: ["BugAnalysis", "SecurityAnalysis"],
    publishes: "FinalReview",
    ms: 1700,
  },
  {
    name: "pager",
    consumes: ["BugAnalysis"],
    where: { field: "severity", equals: "Critical", src: 'where=lambda b: b.severity == "Critical"' },
    publishes: "Page",
    ms: 800,
  },
  {
    name: "notifier",
    consumes: ["SecurityAnalysis"],
    publishes: "Alert",
    ms: 900,
  },
];

export const SEVERITY_PATTERN = "^(Critical|High|Medium|Low|None)$";

export const INPUTS = [
  {
    id: "subtract",
    label: "add() that subtracts",
    payload: { code: "def add(a, b): return a - b", language: "python" },
    answers: {
      bug_detector: { bugs_found: ["add() returns a - b"], severity: "High" },
      security_auditor: { vulnerabilities: [], risk_level: "None" },
      perf: { bottlenecks: [] },
      reviewer: { verdict: "Approve with Changes", action_items: ["Return a + b", "Add a test for add()"] },
      pager: { reason: "Critical bug" },
      notifier: { text: "0 vulnerabilities, risk None" },
    },
  },
  {
    id: "sql",
    label: "SQL from an f-string",
    payload: { code: "cur.execute(f\"SELECT * FROM users WHERE name = '{name}'\")", language: "python" },
    answers: {
      bug_detector: { bugs_found: ["Fails on a name with a quote in it"], severity: "Medium" },
      security_auditor: { vulnerabilities: ["SQL injection through name"], risk_level: "Critical" },
      perf: { bottlenecks: ["SELECT * reads every column"] },
      reviewer: { verdict: "Reject", action_items: ["Use a parameterized query", "Test a name with a quote"] },
      pager: { reason: "Critical bug" },
      notifier: { text: "1 vulnerability, risk Critical" },
    },
  },
  {
    id: "rm",
    label: "rm -rf on an unset variable",
    payload: { code: 'rm -rf "$BUILD_DIR/"*', language: "bash" },
    answers: {
      bug_detector: { bugs_found: ["Empties / when BUILD_DIR is unset"], severity: "Critical" },
      security_auditor: { vulnerabilities: ["Deletes any path the caller can write"], risk_level: "High" },
      perf: { bottlenecks: [] },
      reviewer: { verdict: "Reject", action_items: ["Add set -u", 'Write "${BUILD_DIR:?}"'] },
      pager: { reason: "Critical bug in the submission" },
      notifier: { text: "1 vulnerability, risk High" },
    },
  },
];

export const RULES = [
  {
    id: "private",
    label: "Security findings are private to the reviewer",
    code: 'publishes(SecurityAnalysis, visibility=PrivateVisibility(agents={"reviewer"}))',
  },
  {
    id: "malformed",
    label: 'bug_detector\'s model answers severity "Urgent"',
    code: `severity: str = Field(pattern="${SEVERITY_PATTERN}")`,
  },
  {
    id: "perf",
    label: "Add a perf agent",
    code: 'flock.agent("perf").consumes(CodeSubmission).publishes(PerfAnalysis)',
  },
];
