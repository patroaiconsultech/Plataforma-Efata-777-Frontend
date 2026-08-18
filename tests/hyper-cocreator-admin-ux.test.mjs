import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const app = fs.readFileSync("src/routes/AppConsole.tsx", "utf8");
const admin = fs.readFileSync("src/routes/AdminPanel.tsx", "utf8");
const access = fs.readFileSync("src/routes/AccessPortal.tsx", "utf8");
const api = fs.readFileSync("src/api.ts", "utf8");

test("user-facing console remains single co-creator", () => {
  assert.match(app, /technicalAgentTarget\("orkio"\)/);
  assert.match(app, /\{false && showAgents \? \(/);
});

test("co-creator can be renamed without changing canonical target", () => {
  assert.match(api, /\/api\/v2\/me\/co-creator/);
  assert.match(app, /Renomear Co-Criador/);
  assert.match(app, /technicalAgentTarget\("orkio"\)/);
});

test("admin panel loads agents teams and security status", () => {
  assert.match(admin, /listAgents\(\)/);
  assert.match(admin, /listTeams\(\)/);
  assert.match(admin, /getAdminSecurityStatus\(\)/);
  assert.match(admin, /Agentes disponíveis para administração/);
});

test("access portal surfaces access gate configuration failure", () => {
  assert.match(access, /ACCESS_GATE_DISABLED/);
  assert.match(access, /ACCESS_CODE_INVALID/);
});


test("visible co-creator identity does not leak legacy Josué label", () => {
  assert.doesNotMatch(app, /const AGENT = "Josué"/);
  assert.match(app, /visibleAgentAuthor/);
  assert.match(app, /me\?\.admin_access[\s\S]*itemAgentName[\s\S]*selectedAgentName/);
});

test("admin catalog is role-aware while ordinary users remain canonical", () => {
  assert.match(app, /setAgents\(me\?\.admin_access \? catalog : hyper \? \[hyper\] : \[\]\)/);
  assert.match(app, /technicalAgentTarget\("orkio"\)/);
});
