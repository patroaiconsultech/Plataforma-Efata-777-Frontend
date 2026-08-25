import test from "node:test";import assert from "node:assert/strict";import fs from "node:fs";const read=p=>fs.readFileSync(p,"utf8");
test("career and consultant forms exist",()=>{const m=read("src/landing/premiumMarkup.ts");assert.match(m,/data-application-open="consultant"/);assert.match(m,/data-application-open="career"/);assert.match(m,/data-application-form/);assert.match(m,/name="resume"/);assert.match(m,/name="consent"/)});
test("multipart submit uses apiForm and preserves form on failure",()=>{const s=read("src/landing/premiumInteractions.ts");assert.match(s,/apiForm/);assert.match(s,/\/api\/public\/applications/);assert.match(s,/10 \* 1024 \* 1024/);assert.match(s,/Seus dados permanecem no formulário/)});


test("city state avoids mobile address autofill takeover and draft is session-persisted",()=>{
  const m=read("src/landing/premiumMarkup.ts");
  const s=read("src/landing/premiumInteractions.ts");
  assert.match(m,/name="location" autocomplete="off" inputmode="text"/);
  assert.match(s,/APPLICATION_DRAFT_KEY/);
  assert.match(s,/sessionStorage\.setItem/);
  assert.match(s,/restoreApplicationDraft/);
  assert.match(s,/sessionStorage\.removeItem/);
});

test("form interactions are isolated from global landing navigation handlers",()=>{
  const s=read("src/landing/premiumInteractions.ts");
  assert.match(s,/isolateApplicationEvent/);
  assert.match(s,/applicationForm\?\.addEventListener\("click", isolateApplicationEvent\)/);
  assert.match(s,/applicationForm\?\.addEventListener\("pointerdown", isolateApplicationEvent\)/);
});

test("consultant type switching keeps a valid interest and draft",()=>{
  const s=read("src/landing/premiumInteractions.ts");
  assert.match(s,/nextType === "consultant"/);
  assert.match(s,/Consultoria de implantação de IA/);
  assert.match(s,/persistApplicationDraft\(\)/);
});
