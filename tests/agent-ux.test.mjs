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

test("selected agent is sent as requested execution target", () => {
  assert.match(consoleSource, /selectedAgent\?\.slug \|\| AGENT/);
  assert.match(consoleSource, /selectedAgent\?\.display_name \|\| AGENT/);
});

test("team mode is visible but fail-closed until backend contract exists", () => {
  assert.match(consoleSource, /Team · em breve/);
  assert.match(consoleSource, /Modo Team depende do contrato backend governado/);
  assert.match(consoleSource, /disabled/);
});

test("participant invite remains a separate capability", () => {
  assert.match(consoleSource, /\+ Convidar/);
  assert.match(consoleSource, /setShowInvite\(true\)/);
  assert.match(consoleSource, /setShowAgents\(true\)/);
});
