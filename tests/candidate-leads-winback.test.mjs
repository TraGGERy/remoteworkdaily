import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

test("Lead Capture Agent: Repository exports required lead capture methods", () => {
  const repoPath = path.join(process.cwd(), "lib", "candidate-leads-repository.ts");
  assert.ok(fs.existsSync(repoPath), "candidate-leads-repository.ts must exist");
  const content = fs.readFileSync(repoPath, "utf-8");

  assert.ok(content.includes("export async function saveCandidateLead"), "must export saveCandidateLead");
  assert.ok(content.includes("export async function markLeadConverted"), "must export markLeadConverted");
  assert.ok(content.includes("export function getUnconvertedLeads"), "must export getUnconvertedLeads");
  assert.ok(content.includes("export function getCandidateLead"), "must export getCandidateLead");
});

test("Lead Capture Agent: Onboarding flow contains Step 8 email capture field", () => {
  const compPath = path.join(process.cwd(), "components", "onboarding", "onboarding-flow.tsx");
  assert.ok(fs.existsSync(compPath), "onboarding-flow.tsx must exist");
  const content = fs.readFileSync(compPath, "utf-8");

  assert.ok(
    content.includes("Where should we send your verified direct ATS matches?"),
    "Step 8 must render email capture prompt"
  );
  assert.ok(
    content.includes('fetch("/api/leads"'),
    "Must send lead event to /api/leads"
  );
});

test("Lead Capture Agent: Checkout route captures abandoned checkout lead immediately", () => {
  const checkoutRoutePath = path.join(process.cwd(), "app", "api", "checkout", "candidate", "route.ts");
  assert.ok(fs.existsSync(checkoutRoutePath), "candidate checkout route must exist");
  const content = fs.readFileSync(checkoutRoutePath, "utf-8");

  assert.ok(
    content.includes("saveCandidateLead"),
    "Candidate checkout must invoke saveCandidateLead"
  );
  assert.ok(
    content.includes("onboarding_abandoned_checkout"),
    "Must tag source as onboarding_abandoned_checkout"
  );
});

test("Lead Capture Agent: Stripe Webhook marks leads converted upon completed payment", () => {
  const webhookPath = path.join(process.cwd(), "app", "api", "webhooks", "stripe", "route.ts");
  assert.ok(fs.existsSync(webhookPath), "stripe webhook route must exist");
  const content = fs.readFileSync(webhookPath, "utf-8");

  assert.ok(
    content.includes("markLeadConverted"),
    "Stripe webhook must mark leads converted"
  );
});

test("Win-Back Agent: Service and Cron endpoints exist and implement recovery campaign", () => {
  const servicePath = path.join(process.cwd(), "lib", "winback-service.ts");
  assert.ok(fs.existsSync(servicePath), "lib/winback-service.ts must exist");
  const serviceContent = fs.readFileSync(servicePath, "utf-8");

  assert.ok(
    serviceContent.includes("export function generateWinBackEmailHtml"),
    "Must export generateWinBackEmailHtml"
  );
  assert.ok(
    serviceContent.includes("export async function runWinBackLeadRecovery"),
    "Must export runWinBackLeadRecovery"
  );
  assert.ok(
    serviceContent.includes("utm_source=winback"),
    "Must include utm tracking links for recovery funnel"
  );

  const cronPath = path.join(process.cwd(), "app", "api", "cron", "winback", "route.ts");
  assert.ok(fs.existsSync(cronPath), "app/api/cron/winback/route.ts must exist");
  const cronContent = fs.readFileSync(cronPath, "utf-8");
  assert.ok(
    cronContent.includes("runWinBackLeadRecovery"),
    "Cron endpoint must invoke runWinBackLeadRecovery"
  );
});
