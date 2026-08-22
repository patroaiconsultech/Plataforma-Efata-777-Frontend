import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const api = fs.readFileSync("src/api.ts", "utf8");
const oidc = fs.readFileSync("src/auth/oidc.ts", "utf8");
const callback = fs.readFileSync("src/routes/AuthCallback.tsx", "utf8");
const console_ = fs.readFileSync("src/routes/AppConsole.tsx", "utf8");
const invite = fs.readFileSync("src/routes/InviteAccept.tsx", "utf8");
const app = fs.readFileSync("src/App.tsx", "utf8");
const landing = fs.readFileSync("src/routes/Landing.tsx", "utf8");
const accessPortal = fs.readFileSync("src/routes/AccessPortal.tsx", "utf8");

test("OIDC uses Authorization Code with PKCE S256", () => {
  assert.match(oidc, /response_type", "code"/);
  assert.match(oidc, /code_challenge_method", "S256"/);
  assert.match(oidc, /code_verifier/);
  assert.match(oidc, /crypto\.subtle\.digest/);
});

test("OIDC SPA never contains a client secret", () => {
  assert.doesNotMatch(oidc, /CLIENT_SECRET|client_secret/);
});

test("OIDC validates state and nonce", () => {
  assert.match(oidc, /OIDC_STATE_MISMATCH/);
  assert.match(oidc, /OIDC_NONCE_MISMATCH/);
  assert.match(oidc, /claims\.nonce !== transaction\.nonce/);
});

test("OIDC return path is same-origin only", () => {
  assert.match(oidc, /parsed\.origin !== currentOrigin\(\)/);
  assert.match(oidc, /return "\/app"/);
});

test("OIDC token exchange is form encoded", () => {
  assert.match(oidc, /application\/x-www-form-urlencoded/);
  assert.match(oidc, /grant_type: "authorization_code"/);
});

test("OIDC callback route exists", () => {
  assert.match(app, /path="\/auth\/callback"/);
  assert.match(callback, /completeLogin\(\)/);
});

test("access token expiry is enforced", () => {
  assert.match(api, /TOKEN_EXPIRY_STORAGE_KEY/);
  assert.match(api, /Date\.now\(\) >= expiresAt/);
  assert.match(api, /clearToken\(\)/);
});

test("401 clears auth and emits auth-required event", () => {
  assert.match(api, /AUTH_REQUIRED_EVENT/);
  assert.match(api, /window\.dispatchEvent/);
  assert.match(api, /if \(response\.status === 401\) clearToken\(\)/);
});

test("stream configuration failure still reaches terminal finally", () => {
  const start = api.indexOf("export async function streamMessage");
  const stream = api.slice(start);
  assert.ok(stream.indexOf("try {") < stream.indexOf("ensureConfigured();"));
  assert.match(stream, /finally \{\s*finish\(\{ status: "closed" \}\);/);
});

test("console always releases sending state in finally", () => {
  const start = console_.indexOf("async function handleSend");
  const block = console_.slice(start, console_.indexOf("async function handleFile", start));
  assert.match(block, /finally \{/);
  assert.match(block, /setSending\(false\)/);
  assert.match(block, /abortRef\.current = null/);
});

test("console blocks product actions before authentication or provisioning", () => {
  assert.match(console_, /requireAuthenticated/);
  assert.match(console_, /requireProvisioned/);
  assert.match(console_, /disabled=\{!accountReady \|\| !configured\}/);
  assert.match(console_, /Autentique-se para usar conversas/);
  assert.match(console_, /Conta autenticada; ativação pendente/);
});

test("landing routes unauthenticated private access through the governed access portal", () => {
  assert.match(landing, /navigate\("\/access"\)/);
  assert.match(accessPortal, /isOidcConfigured/);
  assert.match(accessPortal, /beginLogin/);
  assert.match(accessPortal, /validateAccessCode/);
});

test("invite preserves target through authentication", () => {
  assert.match(invite, /beginLogin\(`\/invite\/\$\{encodeURIComponent\(token\)\}`\)/);
});

test("OIDC transaction fails closed without a JavaScript-readable cookie", () => {
  assert.match(oidc, /sessionStorage\.setItem/);
  assert.match(oidc, /OIDC_TRANSACTION_STORAGE_UNAVAILABLE/);
  assert.doesNotMatch(oidc, /document\.cookie/);
  assert.doesNotMatch(oidc, /getTransactionCookie/);
  assert.doesNotMatch(oidc, /patroai_oidc_transaction/);
});

test("callback explains recoverable transaction failures", () => {
  assert.match(callback, /OIDC_TRANSACTION_MISSING/);
  assert.match(callback, /Tentar autenticação novamente/);
  assert.match(callback, /mesma janela/);
});

test("auth tokens remain in sessionStorage and never localStorage", () => {
  assert.match(oidc, /sessionStorage/);
  assert.doesNotMatch(oidc, /localStorage/);
  assert.doesNotMatch(api, /localStorage/);
});

test("console exposes an actionable provisioned-account state", () => {
  assert.match(console_, /provisioningBlocked/);
  assert.match(console_, /accountReady/);
  assert.match(console_, /Ativar acesso PatroAI/);
  assert.match(console_, /PRINCIPAL_NOT_PROVISIONED/);
});

test("Team mode is conditionally selectable and uses the governed stream", () => {
  assert.match(console_, /Selecionar formação Team governada/);
  assert.match(console_, /streamTeamMessage/);
  assert.doesNotMatch(console_, /Team permanece bloqueado neste patch/);
});

test("public console branding uses PatroAI", () => {
  assert.match(console_, /PatroAI Command Center/);
  assert.doesNotMatch(console_, /ORKIO Command Center/);
});
