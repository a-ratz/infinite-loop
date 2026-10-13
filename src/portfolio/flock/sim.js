// A browser port of how Flock schedules one artifact.
//
// For every published artifact, AgentScheduler.schedule_artifact walks every
// agent's subscriptions in this order (src/flock/orchestrator/scheduler.py):
//   1. visibility: artifact.visibility.allows(agent.identity)
//   2. subscription.matches: type, then `where` predicates
//   3. collect: AND gates wait in a pool until every type has arrived
//   4. schedule the agent task
// An agent run whose output fails its Pydantic model publishes nothing; the
// orchestrator publishes a WorkflowError instead (core/orchestrator.py,
// _run_agent_task). Model answers come from data/scenario.js.

import { AGENTS, INPUTS, SEVERITY_PATTERN } from "./data/scenario";

const PATTERNS = {
  BugAnalysis: { severity: SEVERITY_PATTERN },
  SecurityAnalysis: { risk_level: SEVERITY_PATTERN },
  FinalReview: { verdict: "^(Approve|Approve with Changes|Reject)$" },
};

function validate(type, payload) {
  for (const [field, pattern] of Object.entries(PATTERNS[type] ?? {})) {
    if (!new RegExp(pattern).test(payload[field])) {
      return { field, value: payload[field], message: `String should match pattern '${pattern}'` };
    }
  }
  return null;
}

export function activeAgents(rules) {
  return AGENTS.filter((a) => !a.optional || rules.perf);
}

export function simulate(inputId, rules) {
  const input = INPUTS.find((i) => i.id === inputId);
  const agents = activeAgents(rules);
  const events = [];
  const pools = {};
  const jobs = [];
  let n = 0;

  function start(t, agent, inputs) {
    events.push({ t, kind: "start", agent: agent.name, inputs, end: t + agent.ms });
    jobs.push({ t: t + agent.ms, agent, inputs });
  }

  function publish(t, type, payload, producedBy, visibility) {
    const artifact = { id: ++n, type, payload, producedBy, visibility };
    const event = { t, kind: "publish", artifact, checks: [], silent: [] };
    events.push(event);

    for (const agent of agents) {
      if (!agent.consumes.includes(type)) {
        event.silent.push(agent.name);
        continue;
      }
      if (visibility && !visibility.agents.includes(agent.name)) {
        event.checks.push({
          agent: agent.name,
          result: "hidden",
          detail: `PrivateVisibility(agents={"${visibility.agents.join('", "')}"})`,
        });
        continue;
      }
      if (agent.where && payload[agent.where.field] !== agent.where.equals) {
        event.checks.push({ agent: agent.name, result: "filtered", detail: `${agent.where.src} is False` });
        continue;
      }
      if (agent.consumes.length > 1) {
        const pool = (pools[agent.name] ||= {});
        pool[type] = artifact.id;
        const missing = agent.consumes.filter((c) => pool[c] == null);
        const have = agent.consumes.length - missing.length;
        if (missing.length) {
          event.checks.push({
            agent: agent.name,
            result: "waiting",
            detail: `AND gate ${have}/${agent.consumes.length}, needs ${missing.join(", ")}`,
          });
          continue;
        }
        delete pools[agent.name];
        event.checks.push({ agent: agent.name, result: "scheduled", detail: `AND gate ${have}/${have}` });
        start(t, agent, agent.consumes.map((c) => pool[c]));
      } else {
        event.checks.push({
          agent: agent.name,
          result: "scheduled",
          detail: agent.where ? `${agent.where.src} is True` : "",
        });
        start(t, agent, [artifact.id]);
      }
    }
  }

  function finish({ t, agent }) {
    let answer = input.answers[agent.name];
    if (agent.name === "bug_detector" && rules.malformed) answer = { ...answer, severity: "Urgent" };

    const error = validate(agent.publishes, answer);
    if (error) {
      events.push({ t, kind: "fail", agent: agent.name, type: agent.publishes, error });
      publish(
        t,
        "WorkflowError",
        { failed_agent: agent.name, error_message: `…${error.field}: ${error.message}…` },
        `orchestrator#${agent.name}`,
        null,
      );
      return;
    }
    events.push({ t, kind: "done", agent: agent.name });
    const visibility = agent.privateTo && rules.private ? { agents: [agent.privateTo] } : null;
    publish(t, agent.publishes, answer, agent.name, visibility);
  }

  publish(0, "CodeSubmission", input.payload, "external", null);
  while (jobs.length) {
    jobs.sort((a, b) => a.t - b.t);
    finish(jobs.shift());
  }

  const last = events[events.length - 1].t;
  const waiting = Object.entries(pools).map(([agent, pool]) => ({ agent, holds: Object.keys(pool) }));
  events.push({ t: last, kind: "idle", waiting });
  return events;
}

// The state of the run after `clock` milliseconds.
export function viewAt(events, clock, agents) {
  const state = Object.fromEntries(agents.map((a) => [a.name, { status: "idle", notes: [], pool: {} }]));
  const artifacts = [];
  const byId = {};
  const log = [];
  let idle = null;

  for (const e of events) {
    if (e.t > clock) break;
    if (e.kind === "publish") {
      const art = { ...e.artifact, t: e.t, readers: e.checks };
      artifacts.push(art);
      byId[art.id] = art;
      log.push(e);
      for (const c of e.checks) {
        const s = state[c.agent];
        if (c.result === "waiting") {
          s.status = "waiting";
          s.pool[e.artifact.type] = e.artifact.id;
        }
        if (c.result === "hidden" || c.result === "filtered") {
          s.notes.push({ result: c.result, id: e.artifact.id, type: e.artifact.type });
          if (s.status === "idle") s.status = c.result;
        }
        if (c.result === "scheduled" && s.pool) s.pool[e.artifact.type] = e.artifact.id;
      }
    } else if (e.kind === "start") {
      Object.assign(state[e.agent], { status: "running", from: e.t, to: e.end, inputs: e.inputs });
      for (const id of e.inputs) {
        const art = byId[id];
        art.readers = art.readers.map((r) => (r.agent === e.agent ? { ...r, result: "consumed" } : r));
      }
    } else if (e.kind === "done") {
      Object.assign(state[e.agent], { status: "done", pool: {} });
    } else if (e.kind === "fail") {
      Object.assign(state[e.agent], { status: "failed", error: e.error });
      log.push(e);
    } else if (e.kind === "idle") {
      idle = e;
    }
  }

  for (const s of Object.values(state)) {
    if (s.status === "running") s.progress = Math.min(1, (clock - s.from) / (s.to - s.from));
  }
  return { state, artifacts, byId, log, idle };
}
