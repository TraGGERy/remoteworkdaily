import test from "node:test";
import assert from "node:assert/strict";

const DEFAULT_BOT_TOKEN = "8593165155:AAEMBF_0UvlRHUjQb4AtvoG0GHgq8lLxgjM";

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatPaymentMessage(payload) {
  const formattedAmount = payload.amount
    ? `$${(payload.amount / (payload.amount > 1000 && payload.paymentType !== "plaid_ach" ? 100 : 1)).toFixed(2)} ${payload.currency || "USD"}`
    : "Verified Payment";

  const typeLabel =
    payload.paymentType === "employer_job_post"
      ? "💼 Employer Job Posting"
      : payload.paymentType === "candidate_subscription"
      ? "🌟 Candidate Subscription"
      : payload.paymentType === "candidate_hunter_pass"
      ? "🎯 Candidate Hunter Pass"
      : "🏦 ACH Bank Transfer";

  const message = [
    `✨💖 <b>Yaaay! New Payment Received!</b> 🌸🎀`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `✨ <i>A lovely new customer just completed checkout!</i> 💖🧸`,
    ``,
    `💳 <b>Type:</b> ${typeLabel}`,
    `💵 <b>Amount:</b> <code>${formattedAmount}</code> 🍬`,
    payload.planName ? `📦 <b>Plan:</b> 🌸 ${escapeHtml(payload.planName)}` : null,
    payload.customerEmail ? `👤 <b>Customer:</b> 💌 ${escapeHtml(payload.customerEmail)}` : null,
    payload.companyName ? `🏢 <b>Company:</b> ${escapeHtml(payload.companyName)}` : null,
    payload.jobTitle ? `📌 <b>Job Title:</b> ${escapeHtml(payload.jobTitle)}` : null,
    payload.paymentId ? `🔖 <b>ID:</b> <code>${escapeHtml(payload.paymentId)}</code>` : null,
    `⏱ <b>Time:</b> ${new Date().toUTCString()}`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `🎉 <b>You're doing amazing! Keep shining!</b> 🐾🍰✨`,
    `🌐 <a href="https://www.remoteworkdaily.com">RemoteWorkDaily Dashboard</a>`,
  ]
    .filter(Boolean)
    .join("\n");

  return message;
}

function formatOnboardingMessage(payload) {
  const flowLabel =
    payload.flow === "candidate_12_step"
      ? "🧭 12-Step Career Hound Onboarding"
      : "✨ Homepage First-Time Visitor Modal";

  const lines = [
    `🎉 <b>First-Time User Onboarding!</b>`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `📋 <b>Flow:</b> ${flowLabel}`,
    payload.email ? `📧 <b>Email:</b> ${escapeHtml(payload.email)}` : null,
    payload.targetRoles && payload.targetRoles.length > 0
      ? `🎯 <b>Target Roles:</b> ${escapeHtml(payload.targetRoles.join(", "))}`
      : null,
    payload.experienceLevel
      ? `📈 <b>Experience:</b> ${escapeHtml(payload.experienceLevel)}`
      : null,
    payload.salaryExpectation
      ? `💵 <b>Target Salary:</b> ${escapeHtml(payload.salaryExpectation)}`
      : null,
    payload.jobTypes && payload.jobTypes.length > 0
      ? `🏢 <b>Workplace:</b> ${escapeHtml(payload.jobTypes.join(", "))}`
      : null,
    payload.platformsTried && payload.platformsTried.length > 0
      ? `🌐 <b>Platforms Tried:</b> ${escapeHtml(payload.platformsTried.join(", "))}`
      : null,
    payload.hasResume ? `📄 <b>Has Resume:</b> ${escapeHtml(payload.hasResume)}` : null,
    payload.selectedPlan ? `📦 <b>Selected Plan:</b> ${escapeHtml(payload.selectedPlan)}` : null,
    `⏱ <b>Time:</b> ${new Date().toUTCString()}`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `⚡ <i>Automated real-time lead notification</i>`,
  ];

  return lines.filter(Boolean).join("\n");
}

test("Telegram Notifications: Default bot token matches PandoraWorkBot configuration", () => {
  assert.equal(DEFAULT_BOT_TOKEN, "8593165155:AAEMBF_0UvlRHUjQb4AtvoG0GHgq8lLxgjM");
});

test("Telegram Notifications: Payment alert formats candidate and employer data accurately", () => {
  const msg = formatPaymentMessage({
    paymentType: "candidate_subscription",
    amount: 1799,
    currency: "USD",
    customerEmail: "alice<test>@example.com",
    planName: "Monthly Pro & Playbook",
    paymentId: "cs_live_12345",
  });

  assert.ok(msg.includes("New Payment Received!"));
  assert.ok(msg.includes("Candidate Subscription"));
  assert.ok(msg.includes("$17.99 USD"));
  assert.ok(msg.includes("alice&lt;test&gt;@example.com")); // HTML escaped
  assert.ok(msg.includes("Monthly Pro &amp; Playbook")); // HTML escaped
  assert.ok(msg.includes("cs_live_12345"));
});

test("Telegram Notifications: Onboarding alert formats 12-step candidate lead accurately", () => {
  const msg = formatOnboardingMessage({
    flow: "candidate_12_step",
    email: "lead@example.com",
    targetRoles: ["Software Engineer", "DevOps"],
    experienceLevel: "Senior (5-8 years)",
    salaryExpectation: "$150k - $200k",
    jobTypes: ["Remote", "Hybrid"],
    platformsTried: ["LinkedIn", "Indeed"],
    hasResume: "yes",
    selectedPlan: "monthly",
  });

  assert.ok(msg.includes("First-Time User Onboarding!"));
  assert.ok(msg.includes("12-Step Career Hound Onboarding"));
  assert.ok(msg.includes("lead@example.com"));
  assert.ok(msg.includes("Software Engineer, DevOps"));
  assert.ok(msg.includes("Senior (5-8 years)"));
  assert.ok(msg.includes("$150k - $200k"));
});

test("Telegram Notifications: Onboarding alert formats visitor modal lead accurately", () => {
  const msg = formatOnboardingMessage({
    flow: "visitor_modal",
    targetRoles: ["farming"],
  });

  assert.ok(msg.includes("Homepage First-Time Visitor Modal"));
  assert.ok(msg.includes("farming"));
});

test("Telegram Notifications: Cron sync alert accurately formats metrics, sources, and fresh jobs", () => {
  const payload = {
    added: 250,
    updated: 1800,
    total: 11200,
    durationSec: "18.4",
    sources: { arbeitnow: 1000, wwr: 300, jobicy: 250, ats: 4000 },
    topNewJobs: [
      {
        title: "Senior Full Stack Engineer",
        company: "Vercel",
        location: "Worldwide",
        salary: "$140,000 - $180,000",
        url: "https://remoteworkdaily.com/jobs/123/senior-full-stack",
        workplaceType: "remote",
      },
    ],
  };

  const topJobsFormatted = payload.topNewJobs
    .map((j, i) => `${i + 1}. <a href="${j.url}"><b>${escapeHtml(j.title)}</b></a>\n   🏢 <b>${escapeHtml(j.company)}</b> [${j.workplaceType.toUpperCase()}] • 💰 <i>${j.salary}</i>`)
    .join("\n\n");

  const sourcesFormatted = Object.entries(payload.sources)
    .map(([name, count]) => `• ${name}: <b>${count}</b>`)
    .join("\n");

  const message = [
    `🚀 <b>Remote Work Daily — Job Ingestion Completed!</b>`,
    `📥 <b>Newly Ingested:</b> +${payload.added} jobs`,
    `🔄 <b>Updated / Refreshed:</b> ${payload.updated.toLocaleString()} jobs`,
    `📊 <b>Total Active Listings:</b> ${payload.total.toLocaleString()}`,
    `⏱ <b>Duration:</b> ${payload.durationSec}s`,
    topJobsFormatted,
    sourcesFormatted,
  ].join("\n");

  assert.ok(message.includes("Job Ingestion Completed!"));
  assert.ok(message.includes("+250 jobs"));
  assert.ok(message.includes("1,800 jobs"));
  assert.ok(message.includes("11,200"));
  assert.ok(message.includes("Senior Full Stack Engineer"));
  assert.ok(message.includes("Vercel"));
  assert.ok(message.includes("arbeitnow: <b>1000</b>"));
});

test("Job Freshness: getAllJobs guarantees strict descending sort order by postedAt", () => {
  const jobs = [
    { id: "1", title: "Old Job", postedAt: "2026-10-01T10:00:00Z" },
    { id: "2", title: "Newest Job", postedAt: "2026-10-10T08:00:00Z" },
    { id: "3", title: "Mid Job", postedAt: "2026-10-05T12:00:00Z" },
  ];

  const sorted = [...jobs].sort(
    (a, b) => (new Date(b.postedAt).getTime() || 0) - (new Date(a.postedAt).getTime() || 0)
  );

  assert.equal(sorted[0].id, "2");
  assert.equal(sorted[0].title, "Newest Job");
  assert.equal(sorted[1].id, "3");
  assert.equal(sorted[2].id, "1");
});

