import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const markup = fs.readFileSync(
  path.join(root, "src/landing/premiumMarkup.ts"),
  "utf8",
);
const interactions = fs.readFileSync(
  path.join(root, "src/landing/premiumInteractions.ts"),
  "utf8",
);

test("immersive entry uses first-party MP3 instead of external track URL", () => {
  assert.match(markup, /id="patroaiImmersiveAudio"/);
  assert.match(markup, /src="\/media\/patroai-immersive-111hz\.mp3"/);
  assert.doesNotMatch(markup, /href="https:\/\/suno\.com\/s\/B4WUrW9NOYAIrpfK"/);
});

test("single approved music asset exists", () => {
  const mediaPath = path.join(
    root,
    "public/media/patroai-immersive-111hz.mp3",
  );
  assert.equal(fs.existsSync(mediaPath), true);
  assert.ok(fs.statSync(mediaPath).size > 1_000_000);
});

test("explicit user action starts first-party audio", () => {
  assert.match(interactions, /await immersiveAudio\.play\(\)/);
  assert.match(interactions, /immersiveAudio\.currentTime = 0/);
});

test("silent entry stops and resets audio", () => {
  assert.match(interactions, /immersiveAudio\.pause\(\)/);
  assert.match(interactions, /immersiveAudio\.currentTime = 0/);
});

test("artist discovery remains an explicit external CTA", () => {
  assert.match(markup, /https:\/\/suno\.com\/@daninavioficial/);
  assert.match(markup, /Conheça mais obras deste artista/);
});


test("official header logo reacts to the local track through Web Audio", () => {
  assert.match(interactions, /createMediaElementSource\(immersiveAudio\)/);
  assert.match(interactions, /createAnalyser\(\)/);
  assert.match(interactions, /getByteFrequencyData\(frequencyData\)/);
  assert.match(interactions, /--music-logo-scale/);
  assert.match(interactions, /music-reactive-active/);
});

test("audio-reactive animation is bounded and has graceful fallback", () => {
  assert.match(interactions, /Math\.min\(\s*1,/);
  assert.match(interactions, /Audio playback remains functional even if visual analysis is unavailable/);
  assert.match(interactions, /reducedMotionPreference\.matches/);
});


test("neural canvas shares the same bounded music energy as the official logo", () => {
  assert.match(interactions, /let musicEnergy = 0/);
  assert.match(interactions, /musicEnergy = normalized/);
  assert.match(interactions, /const reactiveEnergy =[\s\S]*musicReactiveActive/);
  assert.match(interactions, /const connectionDistance = 86 \+ reactiveEnergy \* 28/);
  assert.match(interactions, /const driftBoost = 1 \+ reactiveEnergy \* 2\.4/);
  assert.match(interactions, /const coreRadius =[\s\S]*0\.34 \+ reactiveEnergy \* 0\.055/);
});

test("neural canvas audio reaction respects reduced motion", () => {
  assert.match(
    interactions,
    /musicReactiveActive && !reducedMotion\.matches[\s\S]*Math\.min\(1, Math\.max\(0, musicEnergy\)\)/,
  );
});


test("immersive gate hands off to the fullscreen neural lobby", () => {
  assert.match(markup, /id="neuralLobby"/);
  assert.match(markup, /id="lobbyBrainCanvas"/);
  assert.match(interactions, /openNeuralLobby/);
  assert.match(interactions, /closeNeuralLobby/);
  assert.match(interactions, /neural-lobby-open/);
});

test("neural lobby exposes governed site-entry targets without inventing routes", () => {
  for (const target of [
    "#top",
    "#ecossistema",
    "#governanca",
    "#metodo",
    "#carreiras",
    "#contato",
  ]) {
    assert.match(markup, new RegExp(`href="${target}"`));
  }
  assert.match(markup, /href="\/app"[\s\S]*data-private-entry="true"/);
});

test("lobby reuses the same neural renderer and music-energy signal", () => {
  assert.match(
    interactions,
    /initBrainCanvas\("#lobbyBrainCanvas", 1\.45\)/,
  );
  assert.match(interactions, /musicEnergy = normalized/);
  assert.match(interactions, /musicReactiveActive/);
});
