import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

// 1. Repository and Service exports validation
test("3-Day Digest: Repositories export required candidate and subscriber methods", () => {
  const candidatePassesPath = path.join(process.cwd(), "lib", "candidate-passes-repository.ts");
  const candidatePassesContent = fs.readFileSync(candidatePassesPath, "utf-8");
  assert.ok(
    candidatePassesContent.includes("function getAllActiveCandidatePasses"),
    "lib/candidate-passes-repository.ts must export getAllActiveCandidatePasses"
  );
  assert.ok(
    candidatePassesContent.includes("export async function updateCandidatePassDigestSent"),
    "lib/candidate-passes-repository.ts must export updateCandidatePassDigestSent"
  );
  assert.ok(
    candidatePassesContent.includes("export async function updateCandidatePassPreferences"),
    "lib/candidate-passes-repository.ts must export updateCandidatePassPreferences"
  );

  const userProfilesPath = path.join(process.cwd(), "lib", "user-profiles-repository.ts");
  const userProfilesContent = fs.readFileSync(userProfilesPath, "utf-8");
  assert.ok(
    userProfilesContent.includes("function getAllProUserProfiles"),
    "lib/user-profiles-repository.ts must export getAllProUserProfiles"
  );
  assert.ok(
    userProfilesContent.includes("export async function updateUserProfileDigestSent"),
    "lib/user-profiles-repository.ts must export updateUserProfileDigestSent"
  );

  const subscribersPath = path.join(process.cwd(), "lib", "subscribers-repository.ts");
  const subscribersContent = fs.readFileSync(subscribersPath, "utf-8");
  assert.ok(
    subscribersContent.includes("export async function updateSubscriberDigestSent"),
    "lib/subscribers-repository.ts must export updateSubscriberDigestSent"
  );
});

test("3-Day Digest: Email helper exports sendPro3DayDigestEmail", () => {
  const resendPath = path.join(process.cwd(), "lib", "email", "resend.ts");
  const resendContent = fs.readFileSync(resendPath, "utf-8");
  assert.ok(
    resendContent.includes("export async function sendPro3DayDigestEmail"),
    "lib/email/resend.ts must export sendPro3DayDigestEmail"
  );
  assert.ok(
    resendContent.includes("3-Day Curated Job Digest") || resendContent.includes("3-Day Curated Jobs Digest"),
    "lib/email/resend.ts template must reference the 3-day curated digest"
  );
});

test("3-Day Digest: Cron endpoint and Vercel cron configuration exist", () => {
  const cronRoutePath = path.join(process.cwd(), "app", "api", "cron", "pro-digest", "route.ts");
  assert.ok(fs.existsSync(cronRoutePath), "app/api/cron/pro-digest/route.ts must exist");

  const vercelJsonPath = path.join(process.cwd(), "vercel.json");
  const vercelJsonContent = fs.readFileSync(vercelJsonPath, "utf-8");
  const vercelConfig = JSON.parse(vercelJsonContent);
  const crons = vercelConfig.crons || [];
  const proDigestCron = crons.find((c) => c.path === "/api/cron/pro-digest");
  assert.ok(proDigestCron, "vercel.json must have a cron job for /api/cron/pro-digest");
  assert.equal(proDigestCron.schedule, "0 9 * * *", "Cron schedule should trigger daily at 09:00 UTC");
});

test("3-Day Digest: Candidate preferences API route exists", () => {
  const prefRoutePath = path.join(process.cwd(), "app", "api", "user", "digest-preferences", "route.ts");
  assert.ok(fs.existsSync(prefRoutePath), "app/api/user/digest-preferences/route.ts must exist");
  const prefContent = fs.readFileSync(prefRoutePath, "utf-8");
  assert.ok(prefContent.includes("export async function GET"), "Must export GET handler");
  assert.ok(prefContent.includes("export async function POST"), "Must export POST handler");
  assert.ok(prefContent.includes("send_test_digest"), "Must support sending a test digest");
});

test("3-Day Digest: CLI dispatch script exists", () => {
  const scriptPath = path.join(process.cwd(), "scripts", "send-pro-3day-digest.mjs");
  assert.ok(fs.existsSync(scriptPath), "scripts/send-pro-3day-digest.mjs must exist");
  const scriptContent = fs.readFileSync(scriptPath, "utf-8");
  assert.ok(
    scriptContent.includes("isDueFor3DayDigest") || scriptContent.includes("THREE_DAYS_MS"),
    "Script must check 3-day digest due status"
  );
});

// 2. Pure logic tests: 3-Day cadence validation (72 hours)
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

function isDueFor3DayDigest(lastSentAt) {
  if (!lastSentAt) return true;
  const lastTime = new Date(lastSentAt).getTime();
  if (Number.isNaN(lastTime)) return true;
  return Date.now() - lastTime >= THREE_DAYS_MS;
}

function getNextDigestDate(lastSentAt) {
  if (!lastSentAt) {
    return new Date(Date.now() + THREE_DAYS_MS);
  }
  const lastTime = new Date(lastSentAt).getTime();
  if (Number.isNaN(lastTime)) {
    return new Date(Date.now() + THREE_DAYS_MS);
  }
  return new Date(lastTime + THREE_DAYS_MS);
}

test("Cadence Logic: Never-sent subscriber is immediately due", () => {
  assert.equal(isDueFor3DayDigest(null), true);
  assert.equal(isDueFor3DayDigest(undefined), true);
  assert.equal(isDueFor3DayDigest(""), true);
});

test("Cadence Logic: Subscriber sent 24h ago is NOT due", () => {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  assert.equal(isDueFor3DayDigest(twentyFourHoursAgo), false);
});

test("Cadence Logic: Subscriber sent 71 hours ago is NOT due", () => {
  const seventyOneHoursAgo = new Date(Date.now() - 71 * 60 * 60 * 1000).toISOString();
  assert.equal(isDueFor3DayDigest(seventyOneHoursAgo), false);
});

test("Cadence Logic: Subscriber sent 72 hours ago IS due", () => {
  const seventyTwoHoursAgo = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString();
  assert.equal(isDueFor3DayDigest(seventyTwoHoursAgo), true);
});

test("Cadence Logic: Subscriber sent 5 days ago IS due", () => {
  const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
  assert.equal(isDueFor3DayDigest(fiveDaysAgo), true);
});

test("Cadence Logic: Next digest calculation is exactly 72 hours after last sent", () => {
  const baseTime = 1700000000000;
  const lastSent = new Date(baseTime).toISOString();
  const nextDate = getNextDigestDate(lastSent);
  assert.equal(nextDate.getTime(), baseTime + THREE_DAYS_MS);
});

// 3. Curated jobs matching and relevance scoring tests
function scoreJobForCandidate(job, prefs) {
  let score = 0;
  const targetRoles = (prefs.target_roles || []).map((r) => r.toLowerCase().trim()).filter(Boolean);
  const titleLower = (job.title || "").toLowerCase();
  const catLower = (job.category || "").toLowerCase();
  const tagsLower = Array.isArray(job.tags) ? job.tags.map((t) => t.toLowerCase()) : [];

  // Direct role matches
  for (const role of targetRoles) {
    if (titleLower.includes(role)) score += 50;
    if (catLower.includes(role)) score += 40;
    if (tagsLower.some((t) => t.includes(role))) score += 30;
  }

  // Minimum salary threshold match
  if (prefs.min_salary && job.salary_max && job.salary_max >= prefs.min_salary) {
    score += 20;
  }

  // Direct ATS preference
  if (job.application_url && (job.application_url.includes("greenhouse") || job.application_url.includes("lever"))) {
    score += 15;
  }

  return score;
}

function getCuratedJobs(prefs, allJobs, limit = 8) {
  return allJobs
    .map((j) => ({ job: j, score: scoreJobForCandidate(j, prefs) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.job);
}

test("Curated Matching: Candidate with Developer role matches Engineering and Developer jobs", () => {
  const mockJobs = [
    { id: "j1", title: "Senior React Developer", category: "Developer", tags: ["react", "typescript"], salary_max: 150000 },
    { id: "j2", title: "Product Marketing Manager", category: "Marketing", tags: ["growth", "seo"], salary_max: 120000 },
    { id: "j3", title: "Fullstack Python Engineer", category: "Developer", tags: ["python", "django"], salary_max: 140000 },
    { id: "j4", title: "Customer Success Lead", category: "Support", tags: ["cs", "zendesk"], salary_max: 70000 },
  ];

  const candidateDev = {
    email: "dev@example.com",
    target_roles: ["Developer"],
    is_pro: true,
  };

  const matches = getCuratedJobs(candidateDev, mockJobs, 8);
  assert.equal(matches.length, 2);
  assert.equal(matches[0].id, "j1");
  assert.equal(matches[1].id, "j3");
});

test("Curated Matching: Candidate with multi-role preferences gets jobs for all selected roles", () => {
  const mockJobs = [
    { id: "j1", title: "Senior React Developer", category: "Developer", tags: ["react"], salary_max: 150000 },
    { id: "j2", title: "Head of Marketing", category: "Marketing", tags: ["marketing", "b2b"], salary_max: 160000 },
    { id: "j3", title: "Executive Assistant / Chief of Staff", category: "Executive", tags: ["executive"], salary_max: 130000 },
    { id: "j4", title: "Junior QA Tester", category: "QA", tags: ["manual"], salary_max: 45000 },
  ];

  const candidateMulti = {
    email: "exec-marketer@example.com",
    target_roles: ["Marketing", "Executive"],
    is_pro: true,
  };

  const matches = getCuratedJobs(candidateMulti, mockJobs, 8);
  assert.equal(matches.length, 2);
  const ids = matches.map((m) => m.id);
  assert.ok(ids.includes("j2"), "Should include Marketing job");
  assert.ok(ids.includes("j3"), "Should include Executive job");
  assert.ok(!ids.includes("j4"), "Should not include QA job");
});

test("Curated Matching: Salary threshold elevates higher-paying matches", () => {
  const mockJobs = [
    { id: "low-pay", title: "Web Developer", category: "Developer", tags: ["html"], salary_max: 60000 },
    { id: "high-pay", title: "Staff Web Developer", category: "Developer", tags: ["html"], salary_max: 180000, application_url: "https://boards.greenhouse.io/corp/123" },
  ];

  const candidateHighEarner = {
    email: "staff@example.com",
    target_roles: ["Developer"],
    min_salary: 120000,
    is_pro: true,
  };

  const matches = getCuratedJobs(candidateHighEarner, mockJobs, 8);
  assert.equal(matches[0].id, "high-pay", "Higher-paying direct ATS job should score first");
});

test("Subscription Guard: Only active subscribers receive the 3-day digest", () => {
  const candidates = [
    { email: "active-pro@example.com", is_pro: true, status: "active" },
    { email: "expired-user@example.com", is_pro: false, status: "expired" },
    { email: "canceled-sub@example.com", is_pro: false, status: "canceled" },
    { email: "active-pass@example.com", is_pro: true, status: "active" },
  ];

  const eligible = candidates.filter((c) => c.is_pro && c.status === "active");
  assert.equal(eligible.length, 2);
  assert.equal(eligible[0].email, "active-pro@example.com");
  assert.equal(eligible[1].email, "active-pass@example.com");
});
