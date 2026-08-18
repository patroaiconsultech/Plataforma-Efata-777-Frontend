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

test("single Hyper Co-Creator uses the explicit canonical technical namespace", () => {
  assert.match(api, /export function technicalAgentTarget/);
  assert.match(api, /return `id:\$\{normalized\}`/);
  assert.match(consoleSource, /technicalAgentTarget\("orkio"\)/);
  assert.match(consoleSource, /me\?\.co_creator_name \|\| "Co-Criador"/);
});

test("multi-agent implementation remains internal but is not exposed in the initial Hyper Co-Creator UX", () => {
  assert.match(consoleSource, /type ExecutionMode = "individual" \| "team"/);
  assert.match(consoleSource, /streamTeamMessage\(/);
  assert.match(consoleSource, /setExecutionMode\("individual"\)/);
  assert.match(consoleSource, /\{false && showAgents/);
});

test("participant invite remains a separate capability", () => {
  assert.match(consoleSource, /\+ Convidar/);
  assert.match(consoleSource, /setShowInvite\(true\)/);
});
