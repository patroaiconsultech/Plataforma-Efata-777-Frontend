import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const index = fs.readFileSync("index.html", "utf8");
const app = fs.readFileSync("src/App.tsx", "utf8");
const landing = fs.readFileSync("src/routes/Landing.tsx", "utf8");
const accessPortal = fs.readFileSync("src/routes/AccessPortal.tsx", "utf8");
const markup = fs.readFileSync("src/landing/premiumMarkup.ts", "utf8");
const interactions = fs.readFileSync(
  "src/landing/premiumInteractions.ts",
  "utf8",
);
const css = fs.readFileSync("src/landing/premium.css", "utf8");
const robots = fs.readFileSync("public/robots.txt", "utf8");
const sitemap = fs.readFileSync("public/sitemap.xml", "utf8");
const manifest = fs.readFileSync("public/manifest.webmanifest", "utf8");
const offline = fs.readFileSync("public/offline.html", "utf8");
const neuralWebgl = fs.readFileSync("src/landing/neuralWebgl.ts", "utf8");

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

test("public crawl surfaces are explicit and brand-consistent", () => {
  assert.match(robots, /Sitemap: https:\/\/plataforma-efata-777-frontend-production\.up\.railway\.app\/sitemap\.xml/);
  assert.match(robots, /Disallow: \/access/);
  assert.match(sitemap, /<loc>https:\/\/plataforma-efata-777-frontend-production\.up\.railway\.app\/\<\/loc>/);
  assert.match(manifest, /"name": "PatroAI — Executive OS"/);
  assert.match(manifest, /"short_name": "PatroAI"/);
  assert.doesNotMatch(manifest, /ORKIO — Inteligência Orquestrada/);
});

test("neural renderer has a guarded WebGL2 path and performance limits", () => {
  assert.match(neuralWebgl, /#version 300 es/);
  assert.match(neuralWebgl, /MAX_PIXEL_COUNT/);
  assert.match(neuralWebgl, /prefers-reduced-motion/);
  assert.match(neuralWebgl, /visibilitychange/);
  assert.match(neuralWebgl, /ResizeObserver/);
  assert.match(interactions, /initNeuralWebgl/);
  assert.match(interactions, /initBrainCanvas2D/);
  assert.match(interactions, /Audio is optional/);
  assert.match(interactions, /finally/);
  assert.match(interactions, /seguindo sem áudio/);
});

test("offline fallback keeps public PatroAI branding", () => {
  assert.match(offline, /<title>PatroAI offline<\/title>/);
  assert.match(offline, /estrutura pública da PatroAI/);
  assert.doesNotMatch(offline, /ORKIO offline/);
});

test("critical router surfaces remain canonical", () => {
  assert.match(app, /path="\/" element={<Landing/);
  assert.match(app, /path="\/app" element={<AppConsole/);
  assert.match(app, /path="\/invite\/:token"/);
  assert.match(app, /path="\/auth\/callback"/);
});

test("private access routes through code gate before the existing OIDC contract", () => {
  assert.match(markup, /data-private-entry="true"/);
  assert.match(landing, /getToken/);
  assert.match(landing, /navigate\("\/access"\)/);
  assert.match(accessPortal, /validateAccessCode/);
  assert.match(accessPortal, /isOidcConfigured/);
  assert.match(accessPortal, /beginLogin/);
});

test("neural animation is governed and cleans up browser resources", () => {
  assert.match(markup, /id="brainCanvas"/);
  assert.match(interactions, /requestAnimationFrame/);
  assert.match(interactions, /cancelAnimationFrame/);
  assert.match(interactions, /IntersectionObserver/);
  assert.match(interactions, /visibilitychange/);
  assert.match(interactions, /prefers-reduced-motion: reduce/);
});

test("strategic form prepares an explicit WhatsApp handoff", () => {
  assert.match(markup, /id="leadForm"/);
  assert.match(interactions, /STRATEGIC_WHATSAPP/);
  assert.match(interactions, /window\.open\(destination\.toString\(\)/);
  assert.match(interactions, /leadForm\.reset\(\)/);
  assert.doesNotMatch(interactions, /Envio online em ativação/);
});

test("premium stylesheet is route-scoped and hardens production geometry", () => {
  assert.match(css, /\.patroai-premium/);
  assert.match(css, /grid-template-columns: minmax\(0, 1\.05fr\) minmax\(480px, 0\.95fr\)/);
  assert.match(css, /font-size: clamp\(3rem, 4\.75vw, 5\.25rem\)/);
  assert.match(css, /white-space: nowrap/);
  assert.match(css, /word-break: normal/);
  assert.doesNotMatch(css, /overflow-wrap: anywhere/);
  assert.doesNotMatch(css, /(^|\n)\s*body\s*\{/m);
});

test("production shell remains compatible with strict script CSP", () => {
  assert.match(index, /src="\/env\.js"/);
  assert.match(index, /src="\/src\/main\.tsx"/);
  assert.doesNotMatch(index, /<script>(?:.|\n)*<\/script>/);
});

test("public shell exposes complete technical SEO signals", () => {
  assert.match(index, /name="robots" content="index,follow/);
  assert.match(index, /rel="canonical" href="https:\/\/plataforma-efata-777-frontend-production\.up\.railway\.app\//);
  assert.match(index, /property="og:type" content="website"/);
  assert.match(index, /property="og:url"/);
  assert.match(index, /name="twitter:card" content="summary_large_image"/);
  assert.match(index, /hreflang="pt-BR"/);
  assert.match(index, /application\/ld\+json/);
  assert.match(index, /<noscript>/);
});

test("neural core visibly carries PatroAI identity without weakening reduced-motion", () => {
  assert.match(markup, /class="neural-brand-core"/);
  assert.match(markup, /neural-brand-core[\s\S]*logo-patroai-oficial\.png/);
  assert.match(css, /\.patroai-premium \.neural-brand-core/);
  assert.match(css, /@keyframes neuralBrandPulse/);
  assert.match(css, /@keyframes neuralBrandOrbit/);
  assert.match(
    css,
    /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.neural-brand-core img[\s\S]*animation: none !important/,
  );
});



test("header premium brand uses the official asset and motion hooks", () => {
  assert.match(markup, /header-brand-image/);
  assert.match(markup, /header-brand-orbit--outer/);
  assert.match(markup, /header-brand-aura/);
  assert.match(markup, /logo-patroai-oficial\.png/);
  assert.match(css, /PLAT PREMIUM REV K — OFFICIAL LOGO MOTION/);
});


test("immersive entry gate uses official PatroAI identity and remains opt-in", () => {
  assert.match(markup, /id="immersiveGate"/);
  assert.match(markup, /immersive-gate__brand[\s\S]*logo-patroai-oficial\.png/);
  assert.match(markup, /data-immersive-sound="true"/);
  assert.match(markup, /data-immersive-silent="true"/);
  assert.match(css, /PLAT PREMIUM REV I — IMMERSIVE ENTRY GATE/);
  assert.match(css, /prefers-reduced-motion: reduce/);
});

test("immersive gate offers direct presentation access and keyboard escape", () => {
  assert.match(markup, /data-immersive-direct="true"/);
  assert.match(markup, /Ir direto para a apresentação/);
  assert.match(interactions, /event\.key === "Escape"/);
  assert.match(interactions, /enterPresentationDirectly/);
});

test("language switcher persists locale and updates accessible state", () => {
  assert.match(markup, /data-lang="pt"[^>]*aria-pressed="true"/);
  assert.match(interactions, /patroai-language/);
  assert.match(interactions, /meta\[name="description"\]/);
  assert.match(interactions, /setAttribute\("aria-pressed"/);
  assert.match(interactions, /searchParams\.set\("lang", currentLang\)/);
});

test("immersive gate embeds the single approved work and keeps artist discovery external", () => {
  assert.match(markup, /id="patroaiImmersiveAudio"/);
  assert.match(markup, /\/media\/patroai-immersive-111hz\.mp3/);
  assert.match(markup, /https:\/\/suno\.com\/@daninavioficial/);
  assert.doesNotMatch(markup, /https:\/\/suno\.com\/s\/B4WUrW9NOYAIrpfK/);
  assert.doesNotMatch(markup, /https:\/\/suno\.com\/s\/Bl7U1mra7K6xyUGT/);
  assert.match(markup, /A reprodução acontece na própria landing/);
});

test("immersive copyright notice is explicit without claiming unproven registration", () => {
  assert.match(markup, /Direitos autorais reservados ao autor das obras/);
  assert.doesNotMatch(markup, /direitos autorais registrados/i);
  assert.match(markup, /data-copyright-toggle="true"/);
  assert.match(interactions, /copyrightPanel\.hidden/);
});


test("Rev M keeps the official logo and makes only its presentation audio-reactive", () => {
  assert.match(markup, /class="header-brand-image"[\s\S]*logo-patroai-oficial\.png/);
  assert.match(css, /PLAT PREMIUM REV M — AUDIO-REACTIVE OFFICIAL LOGO/);
  assert.match(css, /--music-logo-scale/);
  assert.match(css, /music-reactive-active \.header-brand-image/);
  assert.match(
    css,
    /@media \(prefers-reduced-motion: reduce\)[\s\S]*music-reactive-active \.header-brand-image/,
  );
});


test("Rev O provides a fullscreen neural gateway before site navigation", () => {
  assert.match(markup, /class="neural-lobby"/);
  assert.match(markup, /PATROAI · NÚCLEO IMERSIVO/);
  assert.match(css, /PLAT PREMIUM REV O — NEURAL IMMERSIVE GATEWAY/);
  assert.match(css, /\.neural-lobby\.is-active/);
  assert.match(css, /prefers-reduced-motion: reduce/);
});
