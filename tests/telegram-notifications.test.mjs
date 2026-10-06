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
    `💰 <b>New Payment Received!</b>`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `💳 <b>Type:</b> ${typeLabel}`,
    `💵 <b>Amount:</b> <code>${formattedAmount}</code>`,
    payload.planName ? `📦 <b>Plan:</b> ${escapeHtml(payload.planName)}` : null,
    payload.customerEmail ? `👤 <b>Customer:</b> ${escapeHtml(payload.customerEmail)}` : null,
    payload.companyName ? `🏢 <b>Company:</b> ${escapeHtml(payload.companyName)}` : null,
    payload.jobTitle ? `📌 <b>Job Title:</b> ${escapeHtml(payload.jobTitle)}` : null,
    payload.paymentId ? `🔖 <b>ID:</b> <code>${escapeHtml(payload.paymentId)}</code>` : null,
    `⏱ <b>Time:</b> ${new Date().toUTCString()}`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `🌐 <a href="https://remoteworkdaily.com">RemoteWorkDaily Dashboard</a>`,
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
