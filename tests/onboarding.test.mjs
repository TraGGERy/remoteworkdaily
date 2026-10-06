import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

test("Onboarding: Types file exists and exports required constants", () => {
  const typesPath = path.resolve("lib/onboarding/types.ts");
  assert.ok(fs.existsSync(typesPath), "lib/onboarding/types.ts should exist");
  const content = fs.readFileSync(typesPath, "utf-8");

  assert.ok(content.includes("INITIAL_ONBOARDING_STATE"), "should export INITIAL_ONBOARDING_STATE");
  assert.ok(content.includes("EXPERIENCE_LEVELS"), "should export EXPERIENCE_LEVELS");
  assert.ok(content.includes("JOB_TYPE_OPTIONS"), "should export JOB_TYPE_OPTIONS");
  assert.ok(content.includes("SALARY_OPTIONS"), "should export SALARY_OPTIONS");
  assert.ok(content.includes("SEARCH_DURATION_OPTIONS"), "should export SEARCH_DURATION_OPTIONS");
  assert.ok(content.includes("JOB_TITLE_EXAMPLES"), "should export JOB_TITLE_EXAMPLES");
  assert.ok(content.includes("PLATFORMS_TRIED_OPTIONS"), "should export PLATFORMS_TRIED_OPTIONS");
  assert.ok(content.includes("YES_NO_OPTIONS"), "should export YES_NO_OPTIONS");
  assert.ok(content.includes("TESTIMONIALS"), "should export TESTIMONIALS");
});

test("Onboarding: Step 1 contains expected job title examples", () => {
  const content = fs.readFileSync(path.resolve("lib/onboarding/types.ts"), "utf-8");
  assert.ok(content.includes("software developer"));
  assert.ok(content.includes("accountant"));
  assert.ok(content.includes("project manager"));
  assert.ok(content.includes("graphic designer"));
});

test("Onboarding: Step 2 contains all 5 experience tiers from Career Hound", () => {
  const content = fs.readFileSync(path.resolve("lib/onboarding/types.ts"), "utf-8");
  assert.ok(content.includes("Entry-level"));
  assert.ok(content.includes("Mid-level"));
  assert.ok(content.includes("Senior/Lead"));
  assert.ok(content.includes("Director"));
  assert.ok(content.includes("Executive"));
});

test("Onboarding: Step 3 contains Remote, Hybrid, In-office options", () => {
  const content = fs.readFileSync(path.resolve("lib/onboarding/types.ts"), "utf-8");
  assert.ok(content.includes("Remote"));
  assert.ok(content.includes("Hybrid"));
  assert.ok(content.includes("In-office"));
});

test("Onboarding: Step 4 contains 5 salary brackets", () => {
  const content = fs.readFileSync(path.resolve("lib/onboarding/types.ts"), "utf-8");
  assert.ok(content.includes("$30k - $60k per year"));
  assert.ok(content.includes("$60k - $90k per year"));
  assert.ok(content.includes("$90k - $120k per year"));
  assert.ok(content.includes("$120k - $150k per year"));
  assert.ok(content.includes("$150k+ per year"));
});

test("Onboarding: Step 5 contains duration milestones including turtle icon option", () => {
  const content = fs.readFileSync(path.resolve("lib/onboarding/types.ts"), "utf-8");
  assert.ok(content.includes("I just started"));
  assert.ok(content.includes("A few weeks ago"));
  assert.ok(content.includes("A few months ago"));
  assert.ok(content.includes("Too long"));
  assert.ok(content.includes("turtle"));
});

test("Onboarding: Step 6 contains platforms tried (LinkedIn, Indeed, Other)", () => {
  const content = fs.readFileSync(path.resolve("lib/onboarding/types.ts"), "utf-8");
  assert.ok(content.includes("LinkedIn"));
  assert.ok(content.includes("Indeed"));
  assert.ok(content.includes("Other"));
});

test("Onboarding: Steps 8 and 9 support Yes/No resume questions", () => {
  const content = fs.readFileSync(path.resolve("lib/onboarding/types.ts"), "utf-8");
  assert.ok(content.includes("YES_NO_OPTIONS"));
  assert.ok(content.includes("hasResume"));
  assert.ok(content.includes("tailorsResume"));
});

test("Onboarding: Step 7 and 10 educational comparisons exist in component", () => {
  const compPath = path.resolve("components/onboarding/onboarding-flow.tsx");
  assert.ok(fs.existsSync(compPath));
  const content = fs.readFileSync(compPath, "utf-8");
  assert.ok(content.includes("What makes Career Hound different:"));
  assert.ok(content.includes("Did you know?"));
  assert.ok(content.includes("Missing keywords"));
});

test("Onboarding: Step 11 has Keyword Match 100% resume tailoring", () => {
  const compPath = path.resolve("components/onboarding/onboarding-flow.tsx");
  const content = fs.readFileSync(compPath, "utf-8");
  assert.ok(content.includes("Keyword Match"));
  assert.ok(content.includes("100%"));
});

test("Onboarding: Step 12 has Fall 50% banner, 3 plans, and 8,573 job seekers reviews", () => {
  const compPath = path.resolve("components/onboarding/onboarding-flow.tsx");
  const content = fs.readFileSync(compPath, "utf-8");
  assert.ok(content.includes("50% off fall"));
  assert.ok(content.includes("Lifetime"));
  assert.ok(content.includes("$49.99"));
  assert.ok(content.includes("Monthly"));
  assert.ok(content.includes("$17.99"));
  assert.ok(content.includes("Weekly"));
  assert.ok(content.includes("$6.99"));
  assert.ok(content.includes("8,573 job seekers are using Career Hound"));
});

test("Onboarding: Page route app/onboarding/page.tsx exists and renders component", () => {
  const pagePath = path.resolve("app/onboarding/page.tsx");
  assert.ok(fs.existsSync(pagePath), "app/onboarding/page.tsx should exist");
  const content = fs.readFileSync(pagePath, "utf-8");
  assert.ok(content.includes("CareerHoundOnboardingFlow"));
});

test("Onboarding: First-time sign up routes to /onboarding to complete 12 steps to paywall", () => {
  const signUpPagePath = path.resolve("app/sign-up/[[...sign-up]]/page.tsx");
  assert.ok(fs.existsSync(signUpPagePath));
  const signUpContent = fs.readFileSync(signUpPagePath, "utf-8");
  assert.ok(signUpContent.includes('forceRedirectUrl="/onboarding"'));
  assert.ok(signUpContent.includes('fallbackRedirectUrl="/onboarding"'));

  const authButtonsPath = path.resolve("components/auth/auth-buttons.tsx");
  assert.ok(fs.existsSync(authButtonsPath));
  const authButtonsContent = fs.readFileSync(authButtonsPath, "utf-8");
  assert.ok(authButtonsContent.includes('forceRedirectUrl="/onboarding"'));

  const envPath = path.resolve(".env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    assert.ok(envContent.includes("NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding"));
  }
});
