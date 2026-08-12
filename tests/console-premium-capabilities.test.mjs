import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const api = fs.readFileSync("src/api.ts", "utf8");
const console_ = fs.readFileSync("src/routes/AppConsole.tsx", "utf8");
const styles = fs.readFileSync("src/styles.css", "utf8");

test("Team mode is no longer hardcoded as disabled/em breve", () => {
  assert.doesNotMatch(console_, /Team · em breve/);
  assert.match(console_, /type ExecutionMode = "individual" \| "team"/);
  assert.match(console_, /onClick=\{\(\) => setExecutionMode\("team"\)\}/);
  assert.match(console_, /listTeams/);
});

test("Team request uses the governed backend team contract", () => {
  assert.match(api, /export function listTeams/);
  assert.match(api, /export async function streamTeamMessage/);
  assert.match(api, /\/team\/stream/);
  assert.match(console_, /orchestrator_agent_id: teamDefinition\.orchestrator_agent_id/);
  assert.match(console_, /participant_agent_ids: teamParticipantIds/);
  assert.match(console_, /TEAM_MIN_PARTICIPANTS/);
  assert.match(console_, /TEAM_MAX_PARTICIPANTS/);
});

test("Team SSE surfaces agent lifecycle and final synthesis", () => {
  for (const event of ["agent_started", "agent_chunk", "agent_done"]) {
    assert.match(api, new RegExp(`event === "${event}"`));
  }
  assert.match(console_, /onAgentStarted/);
  assert.match(console_, /onAgentDone/);
  assert.match(console_, /ORKIO consolidando as contribuições/);
});

test("Realtime control is capability-aware and never fakes a session", () => {
  assert.match(api, /export function getRealtimeCapabilities/);
  assert.match(console_, /showRealtimeInfo/);
  assert.match(console_, /orchestration_bridge/);
  assert.match(console_, /Realtime/);
  assert.match(console_, /Nenhum botão inicia uma sessão que o backend ainda não/);
  assert.doesNotMatch(console_, /new RTCPeerConnection/);
});

test("attachment UX is explicit and mirrors backend-supported document types", () => {
  assert.match(console_, /const ATTACHMENT_ACCEPT/);
  for (const ext of [".pdf", ".docx", ".xlsx", ".pptx", ".txt", ".csv", ".json"]) {
    assert.match(console_, new RegExp(ext.replace(".", "\\.")));
  }
  assert.match(console_, /Anexar documento/);
  assert.match(console_, /Enviando…/);
  assert.match(console_, /disabled=\{!authenticated \|\| !threadId \|\| sending \|\| uploading\}/);
  assert.match(styles, /\.attachment-button/);
});

test("premium capability controls have dedicated responsive styles", () => {
  assert.match(styles, /\.capability-chip/);
  assert.match(styles, /\.team-config/);
  assert.match(styles, /\.realtime-status/);
});
