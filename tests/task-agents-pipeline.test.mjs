import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

function loadTsModule(filePath) {
  const code = fs.readFileSync(filePath, "utf8");
  const transpiled = ts.transpileModule(code, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  });
  const customRequire = (id) => {
    if (id.startsWith("./") || id.startsWith("../") || id.startsWith("@/")) {
      let resolved = id.replace(/^@\//, "");
      if (id.startsWith(".")) {
        resolved = path.resolve(path.dirname(filePath), id);
      } else {
        resolved = path.resolve(process.cwd(), resolved);
      }
      if (!fs.existsSync(resolved)) {
        if (fs.existsSync(resolved + ".ts")) resolved = resolved + ".ts";
        else if (fs.existsSync(resolved + ".tsx")) resolved = resolved + ".tsx";
        else if (fs.existsSync(resolved + ".js")) resolved = resolved + ".js";
      }
      return loadTsModule(resolved);
    }
    return require(id);
  };
  const mod = { exports: {} };
  const fn = new Function("require", "exports", "module", transpiled.outputText);
  fn(customRequire, mod.exports, mod);
  return mod.exports;
}

// 1. Module Exports & Registry Verification
test("Task Agents: Registry contains exactly 10 specialized make-money agents with required metadata", () => {
  const { TASK_AGENT_REGISTRY } = loadTsModule(path.resolve("lib/scrapers/task-scrapers.ts"));
  assert.equal(Array.isArray(TASK_AGENT_REGISTRY), true, "TASK_AGENT_REGISTRY must be an array");
  assert.equal(TASK_AGENT_REGISTRY.length, 10, "Must register exactly 10 task agents");

  const expectedTypes = [
    "ugc_creator",
    "research_interview",
    "usability_testing",
    "game_playtesting",
    "ai_training_rlhf",
    "transcription",
    "code_bounty",
    "design_contest",
    "search_rating",
    "tutoring",
  ];

  const registeredTypes = TASK_AGENT_REGISTRY.map((a) => a.taskType);
  for (const expType of expectedTypes) {
    assert.ok(registeredTypes.includes(expType), `Registry missing taskType: ${expType}`);
  }

  for (const agent of TASK_AGENT_REGISTRY) {
    assert.ok(agent.id, "Agent must have an id");
    assert.ok(agent.name, "Agent must have a name");
    assert.ok(agent.platforms.length > 0, "Agent must define source platforms");
    assert.ok(agent.description, "Agent must have a description");
    assert.equal(agent.category, "tasks", "Agent category must be 'tasks'");
  }
});

// 2. Individual Scraper Agents Execution & Output Verification
test("Task Agents: All 10 individual task agents return valid structured jobs", async () => {
  const scrapers = loadTsModule(path.resolve("lib/scrapers/task-scrapers.ts"));

  const agentFunctions = [
    { fn: scrapers.fetchUgcCreatorBriefs, type: "ugc_creator" },
    { fn: scrapers.fetchPaidResearchInterviews, type: "research_interview" },
    { fn: scrapers.fetchUsabilityTestingTasks, type: "usability_testing" },
    { fn: scrapers.fetchGamePlaytestingTasks, type: "game_playtesting" },
    { fn: scrapers.fetchAiTrainingRlhfTasks, type: "ai_training_rlhf" },
    { fn: scrapers.fetchAudioTranscriptionTasks, type: "transcription" },
    { fn: scrapers.fetchOpenSourceCodeBounties, type: "code_bounty" },
    { fn: scrapers.fetchDesignContestBriefs, type: "design_contest" },
    { fn: scrapers.fetchMicroAuditingRatingTasks, type: "search_rating" },
    { fn: scrapers.fetchOnlineTutoringTasks, type: "tutoring" },
  ];

  for (const { fn, type } of agentFunctions) {
    assert.equal(typeof fn, "function", `Scraper function for ${type} must exist`);
    const jobs = await fn();
    assert.ok(Array.isArray(jobs), `Scraper for ${type} must return array`);
    assert.ok(jobs.length >= 2, `Scraper for ${type} must return at least 2 verified listings`);

    for (const j of jobs) {
      assert.ok(j.title, `${type} job must have title`);
      assert.ok(j.company, `${type} job must have company`);
      assert.equal(j.category, "tasks", `${type} job must have category 'tasks'`);
      assert.equal(j.is_task, true, `${type} job must have is_task true`);
      assert.equal(j.task_type, type, `${type} job must have matching task_type`);
      assert.ok(j.apply_url.startsWith("http"), `${type} job must have valid http(s) apply_url`);
      assert.ok(j.payout_reward, `${type} job must have payout_reward`);
      assert.ok(j.estimated_time, `${type} job must have estimated_time`);
      assert.ok(["easy", "intermediate", "expert"].includes(j.difficulty), `${type} job must have valid difficulty`);
      assert.ok(["fixed", "hourly", "bounty", "per_item"].includes(j.payout_type), `${type} job must have valid payout_type`);
    }
  }
});

// 3. Universal Aggregator Pipeline
test("Task Agents: fetchAllTaskAndGigJobs aggregates and deduplicates all 10 streams", async () => {
  const { fetchAllTaskAndGigJobs } = loadTsModule(path.resolve("lib/scrapers/task-scrapers.ts"));
  const allTasks = await fetchAllTaskAndGigJobs();

  assert.ok(Array.isArray(allTasks), "Must return array");
  assert.ok(allTasks.length >= 20, "Must aggregate at least 20 listings across all 10 streams");

  const typesFound = new Set(allTasks.map((t) => t.task_type));
  assert.equal(typesFound.size, 10, "Must represent all 10 task types");

  // Verify deduplication
  const applyUrls = allTasks.map((t) => t.apply_url);
  const uniqueUrls = new Set(applyUrls);
  assert.equal(applyUrls.length, uniqueUrls.size, "All tasks must have unique apply URLs");
});

// 4. Normalization Invariants
test("Task Normalization: normalizeScrapedJob preserves task fields and avoids multiplying sub-1000 salaries", () => {
  const { normalizeScrapedJob } = loadTsModule(path.resolve("lib/apify.ts"));

  const rawTask = {
    title: "AI Response Evaluator",
    company: "Outlier AI",
    location: "Worldwide",
    apply_url: "https://outlier.ai/experts",
    category: "tasks",
    is_task: true,
    task_type: "ai_training_rlhf",
    payout_reward: "$45 / hour",
    payout_type: "hourly",
    estimated_time: "Flexible",
    difficulty: "expert",
    salary_min: 40,
    salary_max: 55,
  };

  const normalized = normalizeScrapedJob(rawTask);

  assert.equal(normalized.category, "tasks");
  assert.equal(normalized.isTask, true);
  assert.equal(normalized.taskType, "ai_training_rlhf");
  assert.equal(normalized.payoutReward, "$45 / hour");
  assert.equal(normalized.payoutType, "hourly");
  assert.equal(normalized.estimatedTime, "Flexible");
  assert.equal(normalized.difficulty, "expert");
  assert.equal(normalized.salaryMin, 40, "Sub-1000 task salary must NOT be multiplied by 1000");
  assert.equal(normalized.salaryMax, 55, "Sub-1000 task salary must NOT be multiplied by 1000");
  assert.equal(normalized.workArrangement, "remote_global", "Remote task must be classified as remote_global");
});

// 5. Compensation Formatter Rules
test("Compensation Formatter: formatSalary handles sub-1000 dollar payouts without rounding to $0k", () => {
  const { formatSalary, formatHourlyEquivalent } = loadTsModule(path.resolve("lib/utils.ts"));

  // Sub-1000 payouts (tasks / gigs / bounties)
  assert.equal(formatSalary(25, 50, "USD"), "$25 - $50");
  assert.equal(formatSalary(85, null, "USD"), "From $85");
  assert.equal(formatSalary(null, 120, "USD"), "Up to $120");
  assert.equal(formatSalary(20, 20, "USD"), "$20 - $20");

  // Hourly equivalent avoids ~$0/hr for sub-1000 annual amounts
  assert.equal(formatHourlyEquivalent(25, 50, "USD"), null);
  assert.equal(formatHourlyEquivalent(85, null, "USD"), null);

  // Standard high salaries (>1000) remain formatted in thousands
  assert.equal(formatSalary(120000, 150000, "USD"), "$120k - $150k");
  assert.equal(formatSalary(160000, null, "USD"), "From $160k");
  assert.equal(formatSalary(null, 200000, "USD"), "Up to $200k");
  assert.equal(formatHourlyEquivalent(120000, 160000, "USD"), "~$70/hr");
});

// 6. Filtering Behavior & Mutual Exclusivity
test("Task Filtering: Universal feed includes tasks; 'tasks' filter returns only tasks; other categories exclude tasks", () => {
  const { filterJobs } = loadTsModule(path.resolve("lib/filter-jobs.ts"));

  const testJobs = [
    {
      id: "regular-dev",
      slug: "senior-backend-engineer",
      title: "Senior Backend Engineer (Go / AWS)",
      company: "Stripe",
      category: "dev",
      tags: ["Go", "AWS", "Backend"],
      benefits: [],
      applyUrl: "https://stripe.com",
      postedAt: new Date().toISOString(),
      viewsCount: 100,
      appliesCount: 5,
      source: "direct",
      status: "active",
      location: "Worldwide",
    },
    {
      id: "regular-design",
      slug: "lead-product-designer",
      title: "Lead Product Designer",
      company: "Airbnb",
      category: "design",
      tags: ["Figma", "UI/UX", "Product Design"],
      benefits: [],
      applyUrl: "https://airbnb.com",
      postedAt: new Date().toISOString(),
      viewsCount: 90,
      appliesCount: 8,
      source: "direct",
      status: "active",
      location: "Worldwide",
    },
    {
      id: "task-code-bounty",
      slug: "fix-race-condition-react-native-deep-linking-bounty",
      title: "Fix Race Condition in React Native Deep-Linking Handler",
      company: "Algora.io / Expo Open-Source Bounty",
      category: "tasks",
      isTask: true,
      taskType: "code_bounty",
      payoutReward: "$350 Bounty",
      payoutType: "bounty",
      tags: ["Tasks", "Bounty", "React Native", "TypeScript", "developer"],
      benefits: [],
      applyUrl: "https://algora.io/bounties/1",
      postedAt: new Date().toISOString(),
      viewsCount: 40,
      appliesCount: 2,
      source: "direct",
      status: "active",
      location: "Worldwide",
    },
    {
      id: "task-ugc",
      slug: "tiktok-ugc-creator",
      title: "TikTok / Reels UGC Video Creator",
      company: "JoinBrands",
      category: "tasks",
      isTask: true,
      taskType: "ugc_creator",
      payoutReward: "$85 per video",
      payoutType: "per_item",
      tags: ["Tasks", "UGC", "Video", "TikTok"],
      benefits: [],
      applyUrl: "https://joinbrands.com/1",
      postedAt: new Date().toISOString(),
      viewsCount: 30,
      appliesCount: 3,
      source: "direct",
      status: "active",
      location: "Worldwide",
    },
  ];

  // A. All Jobs Feed (category: "all" or undefined) includes both regular jobs and tasks
  const allFeed = filterJobs(testJobs, { category: "all" });
  assert.equal(allFeed.length, 4, "All Jobs feed must include all regular jobs and tasks");

  const defaultFeed = filterJobs(testJobs, {});
  assert.equal(defaultFeed.length, 4, "Empty filter must include all jobs and tasks");

  // B. Tasks & Gigs filter (category: "tasks") returns ONLY tasks
  const tasksOnlyFeed = filterJobs(testJobs, { category: "tasks" });
  assert.equal(tasksOnlyFeed.length, 2, "Tasks filter must return only task listings");
  assert.ok(tasksOnlyFeed.every((j) => j.category === "tasks" || j.isTask), "All results must be tasks");
  assert.ok(!tasksOnlyFeed.some((j) => j.id === "regular-dev"), "Must exclude regular dev job");
  assert.ok(!tasksOnlyFeed.some((j) => j.id === "regular-design"), "Must exclude regular design job");

  // C. Regular Dev filter (category: "dev") must NOT return tasks, even if task has coding tags
  const devFeed = filterJobs(testJobs, { category: "dev" });
  assert.equal(devFeed.length, 1, "Dev filter must return only developer jobs and exclude tasks");
  assert.equal(devFeed[0].id, "regular-dev");

  // D. Regular Design filter (category: "design") must NOT return tasks
  const designFeed = filterJobs(testJobs, { category: "design" });
  assert.equal(designFeed.length, 1, "Design filter must return only design jobs and exclude tasks");
  assert.equal(designFeed[0].id, "regular-design");

  // E. tasksOnly explicit filter flag
  const tasksFlagFeed = filterJobs(testJobs, { tasksOnly: true });
  assert.equal(tasksFlagFeed.length, 2);

  // F. taskType specific filter
  const bountyOnlyFeed = filterJobs(testJobs, { taskType: "code_bounty" });
  assert.equal(bountyOnlyFeed.length, 1);
  assert.equal(bountyOnlyFeed[0].id, "task-code-bounty");
});

// 7. UI Constants and Component Integrations
test("UI Integration: ROLE_CATEGORIES, JobRow, and GatedApplyAction support task presentation", () => {
  const { ROLE_CATEGORIES } = loadTsModule(path.resolve("lib/constants.ts"));
  const taskCategory = ROLE_CATEGORIES.find((c) => c.id === "tasks");
  assert.ok(taskCategory, "ROLE_CATEGORIES must contain 'tasks' entry");
  assert.equal(taskCategory.label, "Tasks & Gigs");
  assert.equal(taskCategory.icon, "⚡");
  assert.equal(taskCategory.tag, "tasks");

  // Check JobRow component code integrity
  const jobRowSrc = fs.readFileSync(path.join(process.cwd(), "components", "job-board", "job-row.tsx"), "utf8");
  assert.ok(jobRowSrc.includes("isTask"), "JobRow checks isTask flag");
  assert.ok(jobRowSrc.includes("Start Task"), "JobRow provides 'Start Task' button");
  assert.ok(jobRowSrc.includes("Claim Bounty"), "JobRow provides 'Claim Bounty' button");
  assert.ok(jobRowSrc.includes("⚡ Task"), "JobRow renders '⚡ Task' badge");

  // Check JobDetailDrawer component code integrity
  const drawerSrc = fs.readFileSync(path.join(process.cwd(), "components", "job-board", "job-detail-drawer.tsx"), "utf8");
  assert.ok(drawerSrc.includes("Estimated Time"), "JobDetailDrawer surfaces Estimated Time");
  assert.ok(drawerSrc.includes("Difficulty"), "JobDetailDrawer surfaces Difficulty");
  assert.ok(drawerSrc.includes("payoutReward"), "JobDetailDrawer surfaces payoutReward");

  // Check GatedApplyAction component code integrity
  const applySrc = fs.readFileSync(path.join(process.cwd(), "components", "job-board", "gated-apply-action.tsx"), "utf8");
  assert.ok(applySrc.includes("isTask"), "GatedApplyAction accepts isTask prop");
  assert.ok(applySrc.includes("Claim Bounty") || applySrc.includes("Start Task"), "GatedApplyAction supports task actions");
  assert.ok(applySrc.includes("/api/jobs/${jobId}/apply"), "GatedApplyAction tracks click analytics");
  assert.ok(applySrc.includes('target="_blank"'), "GatedApplyAction opens external URLs in new tab");
});

// 8. Idempotent Supabase Migration Integrity
test("Database Migration: 20261025_tasks_micro_gigs.sql contains idempotent column and index creation", () => {
  const migrationPath = path.join(process.cwd(), "supabase", "migrations", "20261025_tasks_micro_gigs.sql");
  assert.ok(fs.existsSync(migrationPath), "Migration file must exist");

  const sql = fs.readFileSync(migrationPath, "utf8");
  assert.ok(sql.includes("alter table public.jobs add column if not exists is_task"), "Must add is_task column");
  assert.ok(sql.includes("alter table public.jobs add column if not exists task_type"), "Must add task_type column");
  assert.ok(sql.includes("alter table public.jobs add column if not exists estimated_time"), "Must add estimated_time column");
  assert.ok(sql.includes("alter table public.jobs add column if not exists payout_reward"), "Must add payout_reward column");
  assert.ok(sql.includes("alter table public.jobs add column if not exists payout_type"), "Must add payout_type column");
  assert.ok(sql.includes("alter table public.jobs add column if not exists difficulty"), "Must add difficulty column");
  assert.ok(sql.includes("alter table public.jobs add column if not exists instructions_url"), "Must add instructions_url column");
  assert.ok(sql.includes("idx_jobs_is_task"), "Must create idx_jobs_is_task index");
  assert.ok(sql.includes("idx_jobs_task_type"), "Must create idx_jobs_task_type index");
});

// 9. Initial Seed Integrity
test("Repository Seed: Sample jobs and jobs.json contain verified task listings", () => {
  const { INITIAL_JOBS } = loadTsModule(path.resolve("lib/sample-jobs.ts"));
  const taskJobsInSample = INITIAL_JOBS.filter((j) => j.category === "tasks" || j.isTask);
  assert.ok(taskJobsInSample.length >= 10, "INITIAL_JOBS must contain at least 10 task listings");

  const dataJobsPath = path.join(process.cwd(), "data", "jobs.json");
  if (fs.existsSync(dataJobsPath)) {
    const dataJobs = JSON.parse(fs.readFileSync(dataJobsPath, "utf8"));
    const taskJobsInData = dataJobs.filter((j) => j.category === "tasks" || j.isTask);
    assert.ok(taskJobsInData.length >= 10, "data/jobs.json must contain at least 10 task listings");
  }
});
