import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

test("SEO Structured Data: lib/seo.ts never emits AdministrativeArea for applicantLocationRequirements", () => {
  const seoFilePath = path.join(process.cwd(), "lib", "seo.ts");
  assert.ok(fs.existsSync(seoFilePath), "lib/seo.ts must exist");
  const content = fs.readFileSync(seoFilePath, "utf8");

  // Google strictly expects @type: 'Country' and rejects 'AdministrativeArea' for applicantLocationRequirements
  assert.ok(
    !content.includes('"AdministrativeArea"'),
    "lib/seo.ts must not emit AdministrativeArea for applicantLocationRequirements"
  );
  assert.ok(
    content.includes("toApplicantLocationRequirements"),
    "lib/seo.ts must delegate applicant location schema to LocationEligibility.toApplicantLocationRequirements()"
  );
  assert.ok(
    content.includes("addressCountry: locationObj.primaryCountry"),
    "lib/seo.ts must include addressCountry for jobLocation in on-site/hybrid positions"
  );
});

test("SEO Documentation: llms-full.txt files reflect valid Country objects for applicantLocationRequirements", () => {
  const routePath = path.join(process.cwd(), "app", "llms-full.txt", "route.ts");
  const publicPath = path.join(process.cwd(), "public", "llms-full.txt");

  const routeContent = fs.readFileSync(routePath, "utf8");
  const publicContent = fs.readFileSync(publicPath, "utf8");

  assert.ok(
    !routeContent.includes("Country or AdministrativeArea"),
    "route.ts must not document AdministrativeArea as an eligible type"
  );
  assert.ok(
    !publicContent.includes("Country or AdministrativeArea"),
    "public llms-full.txt must not document AdministrativeArea as an eligible type"
  );
});

test("SEO Structured Data: LocationEligibility generates compliant Schema.org Country objects across all job types and locations", () => {
  const npxCmd = process.platform === "win32" ? "npx.cmd" : "npx";
  const scriptPath = path.join(process.cwd(), "tests", "verify-applicant-location.ts");

  const output = execFileSync(npxCmd, ["tsx", scriptPath], {
    cwd: process.cwd(),
    encoding: "utf8",
    shell: true,
  });

  assert.ok(
    output.includes("ALL_PASSED"),
    "verify-applicant-location.ts must execute and assert all job types succeed"
  );
});
