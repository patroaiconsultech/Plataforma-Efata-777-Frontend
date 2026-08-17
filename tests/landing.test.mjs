import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const app = fs.readFileSync("src/App.tsx", "utf8");
const landing = fs.readFileSync("src/routes/Landing.tsx", "utf8");
const premiumMarkup = fs.readFileSync(
  "src/landing/premiumMarkup.ts",
  "utf8",
);
const premiumCss = fs.readFileSync(
  "src/landing/premium.css",
  "utf8",
);
const styles = fs.readFileSync("src/styles.css", "utf8");
const install = fs.readFileSync(
  "src/components/PwaInstallButton.tsx",
  "utf8",
);

test("landing and app are separate routes", () => {
  assert.match(app, /path="\/" element={<Landing/);
  assert.match(app, /path="\/app" element={<AppConsole/);
});

test("landing contains PatroAI premium institutional sections", () => {
  assert.match(premiumMarkup, /Grupo PatroAI/);
  assert.match(premiumMarkup, /Ecossistema PatroAI/);
  assert.match(premiumMarkup, /Governança, ESG e perpetuação/);
  assert.match(premiumMarkup, /Do briefing ao sistema governado/);
  assert.match(premiumMarkup, /Solicite uma conversa estratégica/);
});

test("premium landing remains under the canonical React route", () => {
  assert.match(landing, /mountPremiumLanding/);
  assert.match(landing, /premiumMarkup/);
  assert.match(landing, /className="patroai-premium"/);
});

test("install UX includes Android prompt and iOS instructions", () => {
  assert.match(landing, /PwaInstallButton/);
  assert.match(premiumMarkup, /pwaInstallSlot/);
  assert.match(install, /requestInstall/);
  assert.match(install, /Compartilhar/);
  assert.match(install, /Adicionar à Tela de Início/);
});

test("responsive layout includes safe areas and touch targets", () => {
  assert.match(styles, /safe-area-inset-top/);
  assert.match(styles, /safe-area-inset-bottom/);
  assert.match(styles, /min-height: 44px/);
  assert.match(styles, /@media \(max-width: 760px\)/);
  assert.match(styles, /@media \(display-mode: standalone\)/);
  assert.match(premiumCss, /overflow-wrap: anywhere/);
  assert.match(premiumCss, /\.signal strong/);
});
