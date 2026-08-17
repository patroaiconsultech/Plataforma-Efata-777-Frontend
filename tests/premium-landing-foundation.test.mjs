import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const index = fs.readFileSync("index.html", "utf8");
const app = fs.readFileSync("src/App.tsx", "utf8");
const landing = fs.readFileSync("src/routes/Landing.tsx", "utf8");
const markup = fs.readFileSync("src/landing/premiumMarkup.ts", "utf8");
const interactions = fs.readFileSync(
  "src/landing/premiumInteractions.ts",
  "utf8",
);
const css = fs.readFileSync("src/landing/premium.css", "utf8");

test("Vite React bootstrap cannot be replaced by standalone landing HTML", () => {
  assert.match(index, /id="root"/);
  assert.match(index, /src="\/env\.js"/);
  assert.match(index, /src="\/src\/main\.tsx"/);
  assert.doesNotMatch(index, /id="leadForm"/);
  assert.doesNotMatch(index, /id="brainCanvas"/);
});

test("PWA metadata survives the restored application shell", () => {
  assert.match(index, /manifest\.webmanifest/);
  assert.match(index, /apple-touch-icon/);
  assert.match(index, /viewport-fit=cover/);
});

test("critical router surfaces remain canonical", () => {
  assert.match(app, /path="\/" element={<Landing/);
  assert.match(app, /path="\/app" element={<AppConsole/);
  assert.match(app, /path="\/invite\/:token"/);
  assert.match(app, /path="\/auth\/callback"/);
});

test("private access uses existing OIDC contract", () => {
  assert.match(markup, /data-private-entry="true"/);
  assert.match(landing, /getToken/);
  assert.match(landing, /isOidcConfigured/);
  assert.match(landing, /beginLogin\("\/app"\)/);
  assert.match(landing, /navigate\("\/app"\)/);
});

test("neural animation is governed and cleans up browser resources", () => {
  assert.match(markup, /id="brainCanvas"/);
  assert.match(interactions, /requestAnimationFrame/);
  assert.match(interactions, /cancelAnimationFrame/);
  assert.match(interactions, /IntersectionObserver/);
  assert.match(interactions, /visibilitychange/);
  assert.match(interactions, /prefers-reduced-motion: reduce/);
});

test("strategic form does not report a false successful submission", () => {
  assert.match(markup, /id="leadForm"/);
  assert.match(interactions, /Envio online em ativação/);
  assert.doesNotMatch(interactions, /leadForm\.reset\(\)/);
});

test("premium stylesheet is route-scoped and hardens tablet labels", () => {
  assert.match(css, /\.patroai-premium/);
  assert.match(css, /overflow-wrap: anywhere/);
  assert.match(css, /word-break: break-word/);
  assert.doesNotMatch(css, /(^|\n)\s*body\s*\{/m);
});
