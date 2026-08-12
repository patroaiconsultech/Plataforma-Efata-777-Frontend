import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const api = readFileSync(new URL("../src/api.ts", import.meta.url), "utf8");
const consoleSource = readFileSync(new URL("../src/routes/AppConsole.tsx", import.meta.url), "utf8");

test("agent catalog is backend-driven", () => {
  assert.match(api, /apiJson<AgentDefinition\[]>\("\/api\/v2\/agents"\)/);
  assert.match(consoleSource, /await listAgents\(\)/);
  assert.doesNotMatch(consoleSource, /\["Orkio",\s*"Auditor"/);
});

test("selected agent is sent through the explicit technical namespace", () => {
  assert.match(api, /export function technicalAgentTarget/);
  assert.match(api, /return `id:\$\{normalized\}`/);
  assert.match(consoleSource, /technicalAgentTarget\(selectedAgent\.slug\)/);
  assert.match(consoleSource, /: "Josué"/);
  assert.match(consoleSource, /selectedAgent\?\.display_name \|\| AGENT/);
  assert.doesNotMatch(consoleSource, /selectedAgent\?\.slug \|\| AGENT/);
});

test("team mode is wired to the governed backend contract", () => {
  assert.doesNotMatch(consoleSource, /Team · em breve/);
  assert.match(consoleSource, /type ExecutionMode = "individual" \| "team"/);
  assert.match(consoleSource, /await listTeams\(\)/);
  assert.match(consoleSource, /streamTeamMessage\(/);
  assert.match(consoleSource, /contributor_agent_ids:/);
  assert.match(consoleSource, /team_id: teamDefinition\.team_id/);
  assert.doesNotMatch(consoleSource, /orchestrator_agent_id: teamDefinition\.orchestrator_agent_id/);
});

test("participant invite remains a separate capability", () => {
  assert.match(consoleSource, /\+ Convidar/);
  assert.match(consoleSource, /setShowInvite\(true\)/);
  assert.match(consoleSource, /setShowAgents\(true\)/);
});
