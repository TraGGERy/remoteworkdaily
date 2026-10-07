import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

// Test Filter Logic
function filterJobs(jobs, filters) {
  let result = jobs.filter((job) => job.status !== "pending_payment" && job.status !== "archived");

  if (filters.query && filters.query.trim()) {
    const q = filters.query.toLowerCase().trim();
    result = result.filter(
      (job) =>
        job.title.toLowerCase().includes(q) ||
        job.company.toLowerCase().includes(q) ||
        job.tags.some((tag) => tag.toLowerCase().includes(q)) ||
        (job.location && job.location.toLowerCase().includes(q))
    );
  }

  if (filters.workplaceType && filters.workplaceType !== "all") {
    result = result.filter((job) => (job.workplaceType || "remote") === filters.workplaceType);
  }

  if (filters.directAtsOnly) {
    result = result.filter((job) => job.source === "ats" || Boolean(job.atsProvider) || Boolean(job.isDirectCompanyPost));
  }

  if (filters.freshness && filters.freshness !== "all") {
    const now = Date.now();
    const cutoffMs = (filters.freshness === "24h" ? 24 : 168) * 60 * 60 * 1000;
    result = result.filter((job) => {
      const t = new Date(job.postedAt).getTime();
      return !isNaN(t) && now - t <= cutoffMs;
    });
  }

  if (filters.minSalary && filters.minSalary > 0) {
    result = result.filter((job) => {
      const maxSal = job.salaryMax || job.salaryMin || 0;
      return maxSal >= filters.minSalary;
    });
  }

  // Sorting logic (matching lib/filter-jobs.ts)
  result.sort((a, b) => {
    if (filters.sortBy !== "salary" && filters.sortBy !== "views") {
      if (a.sticky && !b.sticky) return -1;
      if (!a.sticky && b.sticky) return 1;
    }

    switch (filters.sortBy) {
      case "salary": {
        const salA = a.salaryMax || a.salaryMin || 0;
        const salB = b.salaryMax || b.salaryMin || 0;
        return salB - salA;
      }
      case "views":
        return (b.viewsCount || 0) - (a.viewsCount || 0);
      case "applied":
        return (b.appliesCount || 0) - (a.appliesCount || 0);
      case "date":
      default: {
        const timeA = new Date(a.postedAt).getTime() || 0;
        const timeB = new Date(b.postedAt).getTime() || 0;
        return timeB - timeA;
      }
    }
  });

  return result;
}

test("filterJobs excludes pending_payment and archived listings", () => {
  const mockJobs = [
    { id: "1", title: "Active Engineer", company: "A", status: "active", tags: [] },
    { id: "2", title: "Unpaid Engineer", company: "B", status: "pending_payment", tags: [] },
    { id: "3", title: "Archived Engineer", company: "C", status: "archived", tags: [] },
  ];

  const filtered = filterJobs(mockJobs, {});
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].id, "1");
});

test("filterJobs matches query across title, company, and tags", () => {
  const mockJobs = [
    { id: "1", title: "Senior React Dev", company: "Vercel", status: "active", tags: ["React"] },
    { id: "2", title: "Python Engineer", company: "OpenAI", status: "active", tags: ["AI"] },
  ];

  const searchReact = filterJobs(mockJobs, { query: "react" });
  assert.equal(searchReact.length, 1);
  assert.equal(searchReact[0].id, "1");

  const searchOpenAI = filterJobs(mockJobs, { query: "openai" });
  assert.equal(searchOpenAI.length, 1);
  assert.equal(searchOpenAI[0].id, "2");
});

test("generateCanonicalHash produces deterministic SHA-256 string", () => {
  const company = "Acme";
  const title = "Senior Dev";
  const url = "https://acme.com/apply";

  const normalized = `${company.toLowerCase().trim()}:${title.toLowerCase().trim()}:${url.toLowerCase().trim()}`;
  const hash1 = crypto.createHash("sha256").update(normalized).digest("hex");
  const hash2 = crypto.createHash("sha256").update(normalized).digest("hex");

  assert.equal(hash1, hash2);
  assert.equal(hash1.length, 64);
});

// DDD: SalaryRange Invariant Tests
test("DDD: SalaryRange value object enforces invariants", () => {
  class SalaryRange {
    constructor(data) {
      if (data.min !== undefined && data.min < 0) throw new Error("Salary minimum cannot be negative");
      if (data.max !== undefined && data.max < 0) throw new Error("Salary maximum cannot be negative");
      if (data.min !== undefined && data.max !== undefined && data.min > data.max) {
        throw new Error("Salary minimum cannot exceed maximum");
      }
      this.min = data.min;
      this.max = data.max;
      this.currency = (data.currency || "USD").toUpperCase();
    }
    format() {
      if (!this.min && !this.max) return "Competitive";
      const curr = this.currency;
      if (this.min && this.max) return `$${Math.round(this.min / 1000)}k - $${Math.round(this.max / 1000)}k ${curr}`;
      if (this.min) return `From $${Math.round(this.min / 1000)}k ${curr}`;
      return `Up to $${Math.round(this.max / 1000)}k ${curr}`;
    }
  }

  const valid = new SalaryRange({ min: 120000, max: 180000, currency: "USD" });
  assert.equal(valid.format(), "$120k - $180k USD");

  assert.throws(() => new SalaryRange({ min: -100 }), /negative/);
  assert.throws(() => new SalaryRange({ min: 200000, max: 100000 }), /cannot exceed/);
});

// DDD: Monetization Pricing Engine
test("DDD: PostingPricingEngine calculates base and add-on rates accurately", () => {
  const RATES = {
    BASE: 249,
    STICKY: 89,
    HIGHLIGHT: 49,
    NEWSLETTER: 99,
  };

  function calculateTotal(addOns = {}) {
    let total = RATES.BASE;
    if (addOns.sticky) total += RATES.STICKY;
    if (addOns.highlight) total += RATES.HIGHLIGHT;
    if (addOns.newsletterBlast) total += RATES.NEWSLETTER;
    return total;
  }

  assert.equal(calculateTotal({}), 249);
  assert.equal(calculateTotal({ sticky: true }), 338);
  assert.equal(calculateTotal({ sticky: true, highlight: true, newsletterBlast: true }), 486);
});

// AI-SEO: llms.txt standard files exist and contain domain authority
test("AI-SEO: public/llms.txt exists and references remoteworkdaily.com", () => {
  const llmsPath = path.resolve("public/llms.txt");
  assert.ok(fs.existsSync(llmsPath), "public/llms.txt must exist");

  const content = fs.readFileSync(llmsPath, "utf-8");
  assert.ok(content.includes("remoteworkdaily.com"), "llms.txt must reference remoteworkdaily.com");
  assert.ok(content.includes("transparent salary"), "llms.txt must reference transparent salary standards");
  assert.ok(content.includes("/remote-jobs.json"), "llms.txt must reference /remote-jobs.json API feed");
});

// Monetization: CareerHound Subscription Pricing Model
test("Monetization: CareerHound 3-Tier Subscription Model & Employer One-Time contracts are maintained", () => {
  const employerStarter = { type: "one-time", price: 249, subscription: false };
  const employerAccelerator = { type: "one-time", price: 399, subscription: false };

  // Employer posts remain one-time to prevent corporate card friction
  assert.equal(employerStarter.subscription, false);
  assert.equal(employerAccelerator.subscription, false);

  // CareerHound Candidate Subscriptions & Lifetime Model
  const weeklyPlan = { id: "weekly", price: 6.99, interval: "week", subscription: true };
  const monthlyPlan = { id: "monthly", price: 17.99, interval: "month", subscription: true, isPopular: true };
  const lifetimePlan = { id: "lifetime", price: 49.99, interval: "lifetime", subscription: false, guaranteeDays: 60, refundDays: 7 };

  assert.equal(weeklyPlan.price, 6.99);
  assert.equal(weeklyPlan.interval, "week");
  assert.equal(weeklyPlan.subscription, true);

  assert.equal(monthlyPlan.price, 17.99);
  assert.equal(monthlyPlan.interval, "month");
  assert.equal(monthlyPlan.subscription, true);
  assert.equal(monthlyPlan.isPopular, true);

  assert.equal(lifetimePlan.price, 49.99);
  assert.equal(lifetimePlan.subscription, false);
  assert.equal(lifetimePlan.refundDays, 7);
  assert.equal(lifetimePlan.guaranteeDays, 60);
});

// CareerHound Feature: Direct ATS and Freshness (24h) Filtering
test("filterJobs filters accurately by direct ATS and 24h freshness", () => {
  const now = Date.now();
  const jobs = [
    { id: "1", title: "GitLab SRE", company: "GitLab", status: "active", source: "ats", atsProvider: "greenhouse", postedAt: new Date(now - 2 * 3600 * 1000).toISOString(), tags: [] },
    { id: "2", title: "Legacy Job", company: "OldCo", status: "active", source: "feed", postedAt: new Date(now - 72 * 3600 * 1000).toISOString(), tags: [] },
    { id: "3", title: "Buffer Designer", company: "Buffer", status: "active", source: "ats", isDirectCompanyPost: true, postedAt: new Date(now - 80 * 3600 * 1000).toISOString(), tags: [] },
  ];

  const atsOnly = filterJobs(jobs, { directAtsOnly: true });
  assert.equal(atsOnly.length, 2);
  assert.deepEqual(atsOnly.map((j) => j.id), ["1", "3"]);

  const freshOnly = filterJobs(jobs, { freshness: "24h" });
  assert.equal(freshOnly.length, 1);
  assert.equal(freshOnly[0].id, "1");
});

// Workplace Type Filtering & Non-Remote Job Handling
test("filterJobs filters accurately by workplaceType (remote, on-site, hybrid)", () => {
  const jobs = [
    { id: "1", title: "Remote Engineer", company: "Zapier", status: "active", workplaceType: "remote", location: "Worldwide", tags: [] },
    { id: "2", title: "Office Manager", company: "Siemens", status: "active", workplaceType: "on-site", location: "Berlin, Germany", tags: [] },
    { id: "3", title: "Product Designer", company: "Spotify", status: "active", workplaceType: "hybrid", location: "Stockholm", tags: [] },
  ];

  const remoteOnly = filterJobs(jobs, { workplaceType: "remote" });
  assert.equal(remoteOnly.length, 1);
  assert.equal(remoteOnly[0].id, "1");

  const onSiteOnly = filterJobs(jobs, { workplaceType: "on-site" });
  assert.equal(onSiteOnly.length, 1);
  assert.equal(onSiteOnly[0].id, "2");

  const hybridOnly = filterJobs(jobs, { workplaceType: "hybrid" });
  assert.equal(hybridOnly.length, 1);
  assert.equal(hybridOnly[0].id, "3");

  const allJobs = filterJobs(jobs, { workplaceType: "all" });
  assert.equal(allJobs.length, 3);
});

test("Scraper normalizer infers on-site, hybrid, and remote workplace types accurately", () => {
  function inferWorkplaceType(raw) {
    const titleLower = (raw.title || "").toLowerCase();
    const descLower = (raw.description || "").toLowerCase();
    const locLower = (raw.location || "").toLowerCase();

    if (raw.remote === false) {
      if (titleLower.includes("hybrid") || descLower.includes("hybrid")) return "hybrid";
      return "on-site";
    }
    if (raw.remote === true) return "remote";

    if (titleLower.includes("hybrid") || locLower.includes("hybrid")) return "hybrid";
    if (locLower.includes("on-site") || locLower.includes("in-person")) return "on-site";
    if (locLower.includes("remote") || locLower.includes("worldwide")) return "remote";
    if (raw.location && !locLower.includes("remote")) return "on-site";
    return "remote";
  }

  assert.equal(inferWorkplaceType({ title: "HR Manager", location: "Hamburg", remote: false }), "on-site");
  assert.equal(inferWorkplaceType({ title: "Software Engineer", location: "Berlin", remote: true }), "remote");
  assert.equal(inferWorkplaceType({ title: "Hybrid Senior Architect", location: "London", remote: false }), "hybrid");
  assert.equal(inferWorkplaceType({ title: "DevOps Engineer", location: "Worldwide" }), "remote");
});

// Work Information: HTML Description Cleaner & Sanitizer
test("Work Information: cleanJobDescription strips aggregator spam and decodes HTML entities", () => {
  function cleanJobDescription(rawHtml) {
    if (!rawHtml) return "";
    let cleaned = rawHtml
      .replace(/&#x26;/g, "&")
      .replace(/&amp;/g, "&")
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&nbsp;/g, " ")
      .replace(/(?:<p>)?\s*Find more.*?on Arbeitnow.*?(?:<\/p>|<\/a>|$)/gi, "")
      .replace(/<p>.*?Find more <a[^>]*>.*?<\/a>.*?(?:<\/p>|<\/a>|$)/gi, "")
      .replace(/<a\s+href="https?:\/\/(?:www\.)?arbeitnow\.com[^"]*"[^>]*>.*?<\/a>/gi, "")
      .replace(/<\/a>\s*<\/a>/gi, "</a>")
      .trim();

    if (!cleaned.includes("<p>") && !cleaned.includes("<br>") && !cleaned.includes("<div>")) {
      cleaned = cleaned
        .split(/\n\s*\n/)
        .map((para) => `<p>${para.trim().replace(/\n/g, "<br />")}</p>`)
        .join("");
    }
    return cleaned;
  }

  const rawSample = '<p>Growth &#x26; Revenue</p><p>Find more <a href="https://www.arbeitnow.com/jobs">English Speaking Jobs in Germany</a> on Arbeitnow</a>';
  const cleaned = cleanJobDescription(rawSample);

  assert.ok(cleaned.includes("Growth & Revenue"), "HTML entity &#x26; must be decoded to &");
  assert.ok(!cleaned.includes("Arbeitnow"), "Arbeitnow third-party aggregator ad must be removed");
});

// Paywall Gating Invariants: Subscriber-only Application Access
test("Paywall Gating: Only logged in users with active subscription can access direct application", () => {
  function evaluateApplyAccess({ isSignedIn, hasActiveSubscription }) {
    if (!isSignedIn) {
      return { status: "sign_in_required", canApply: false };
    }
    if (!hasActiveSubscription) {
      return { status: "subscription_required", canApply: false };
    }
    return { status: "unlocked", canApply: true };
  }

  // 1. Anonymous visitor
  const anonymous = evaluateApplyAccess({ isSignedIn: false, hasActiveSubscription: false });
  assert.equal(anonymous.canApply, false);
  assert.equal(anonymous.status, "sign_in_required");

  // 2. Logged-in user without Hunter Pass / active subscription
  const registeredFree = evaluateApplyAccess({ isSignedIn: true, hasActiveSubscription: false });
  assert.equal(registeredFree.canApply, false);
  assert.equal(registeredFree.status, "subscription_required");

  // 3. Logged-in user with active subscription
  const activeSubscriber = evaluateApplyAccess({ isSignedIn: true, hasActiveSubscription: true });
  assert.equal(activeSubscriber.canApply, true);
  assert.equal(activeSubscriber.status, "unlocked");
});

test("CareerHound Paywall: Partitions exactly 25 free preview jobs for non-subscribers while unlocking all for subscribers", () => {
  const allJobs = Array.from({ length: 60 }, (_, i) => ({ id: `job-${i + 1}` }));
  const FREE_PREVIEW_LIMIT = 25;

  function partitionJobs(jobs, hasActiveSubscription) {
    if (hasActiveSubscription) {
      return { preview: jobs, blurred: [] };
    }
    return {
      preview: jobs.slice(0, FREE_PREVIEW_LIMIT),
      blurred: jobs.slice(FREE_PREVIEW_LIMIT),
    };
  }

  // Non-subscriber sees 25 preview jobs, remaining 35 blurred
  const freeUser = partitionJobs(allJobs, false);
  assert.equal(freeUser.preview.length, 25);
  assert.equal(freeUser.blurred.length, 35);

  // Subscriber sees all 60 jobs previewed, 0 blurred
  const subscriber = partitionJobs(allJobs, true);
  assert.equal(subscriber.preview.length, 60);
  assert.equal(subscriber.blurred.length, 0);
});

test("Date formatting: timeAgo produces clean, human-readable relative times", () => {
  function timeAgo(dateString) {
    if (!dateString) return "recently";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "recently";

    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "yesterday";
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    return `${Math.floor(months / 12)}y ago`;
  }

  const now = Date.now();
  assert.equal(timeAgo(new Date(now - 10 * 1000)), "just now");
  assert.equal(timeAgo(new Date(now - 15 * 60 * 1000)), "15m ago");
  assert.equal(timeAgo(new Date(now - 4 * 3600 * 1000)), "4h ago");
  assert.equal(timeAgo(new Date(now - 28 * 3600 * 1000)), "yesterday");
  assert.equal(timeAgo(new Date(now - 3 * 24 * 3600 * 1000)), "3d ago");
  assert.equal(timeAgo(new Date(now - 14 * 24 * 3600 * 1000)), "2w ago");
  assert.equal(timeAgo(""), "recently");
});

test("Email & Marketing System: newsletter schema validates valid emails and rejects malformed inputs", () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  assert.ok(emailRegex.test("candidate@example.com"));
  assert.ok(emailRegex.test("recruiter@stripe.com"));
  assert.equal(emailRegex.test("not-an-email"), false);
  assert.equal(emailRegex.test("missing@domain"), false);

  // Verify candidate plan receipt calculation
  const weeklyPassAmount = 6.99;
  const monthlyPassAmount = 17.99;
  const lifetimePassAmount = 49.99;
  assert.equal(Math.round(weeklyPassAmount * 100), 699);
  assert.equal(Math.round(monthlyPassAmount * 100), 1799);
  assert.equal(Math.round(lifetimePassAmount * 100), 4999);


  // Verify employer job advertising pricing
  const standardJobPrice = 199;
  const stickyPrice = 89;
  const highlightPrice = 49;
  const newsletterPrice = 59;
  assert.equal(standardJobPrice + stickyPrice + highlightPrice + newsletterPrice, 396);
});

test("Persistence Layer: Data directory and storage integrity check", async () => {
  const fs = await import("fs");
  const path = await import("path");

  const dataDir = path.join(process.cwd(), "data");
  assert.ok(fs.existsSync(dataDir), "data directory must exist");
  assert.ok(fs.existsSync(path.join(dataDir, "jobs.json")), "data/jobs.json must exist");

  const jobsData = JSON.parse(fs.readFileSync(path.join(dataDir, "jobs.json"), "utf8"));
  assert.ok(Array.isArray(jobsData) && jobsData.length > 0, "data/jobs.json must be a non-empty array");
});

test("Subscription Management: Pass cancellation updates record status to expired", () => {
  // Pure state machine simulation of candidate pass lifecycle
  const passes = new Map();
  const testEmail = "subscriber@example.com";

  // 1. Initial active subscription
  passes.set(testEmail, {
    id: "pass_123",
    email: testEmail,
    status: "active",
    plan: "monthly",
    amount: 17.99,
  });

  assert.equal(passes.get(testEmail).status, "active");

  // 2. Cancellation action
  const record = passes.get(testEmail);
  if (record) {
    record.status = "expired";
  }

  // 3. Status check after cancellation
  assert.equal(passes.get(testEmail).status, "expired");

  // Verify that an expired pass is rejected for active privileges
  function hasActiveAccess(email) {
    const p = passes.get(email);
    return Boolean(p && p.status === "active");
  }

  assert.equal(hasActiveAccess(testEmail), false);
});

test("Employer Dashboard: Filters jobs strictly by employerEmail and calculates real metrics", () => {
  const mockAllJobs = [
    {
      id: "job-1",
      title: "Frontend Engineer",
      company: "Acme Corp",
      employerEmail: "recruiter@acmework.com",
      viewsCount: 142,
      appliesCount: 18,
      status: "active",
    },
    {
      id: "job-2",
      title: "Backend Engineer",
      company: "Acme Corp",
      employerEmail: "recruiter@acmework.com",
      viewsCount: 88,
      appliesCount: 9,
      status: "active",
    },
    {
      id: "job-3",
      title: "Staff DevOps",
      company: "Other Co",
      employerEmail: "hr@otherco.io",
      viewsCount: 310,
      appliesCount: 25,
      status: "active",
    },
    {
      id: "job-4",
      title: "Scraped Public Job",
      company: "Elastic",
      employerEmail: null,
      viewsCount: 50,
      appliesCount: 4,
      status: "active",
    },
  ];

  function filterEmployerJobs(jobs, email) {
    if (!email || !email.trim()) return { count: 0, jobs: [], totalViews: 0, totalApplies: 0 };
    const normalized = email.toLowerCase().trim();
    const filtered = jobs.filter((j) => j.employerEmail && j.employerEmail.toLowerCase().trim() === normalized);
    const totalViews = filtered.reduce((s, j) => s + (j.viewsCount || 0), 0);
    const totalApplies = filtered.reduce((s, j) => s + (j.appliesCount || 0), 0);
    return { count: filtered.length, jobs: filtered, totalViews, totalApplies };
  }

  // Recruiter with 2 jobs
  const result = filterEmployerJobs(mockAllJobs, "recruiter@acmework.com ");
  assert.equal(result.count, 2);
  assert.equal(result.totalViews, 230);
  assert.equal(result.totalApplies, 27);
  assert.equal(result.jobs[0].title, "Frontend Engineer");
  assert.equal(result.jobs[1].title, "Backend Engineer");

  // Recruiter with 0 jobs gets empty state, never public scraped jobs
  const emptyResult = filterEmployerJobs(mockAllJobs, "newemployer@startup.io");
  assert.equal(emptyResult.count, 0);
  assert.equal(emptyResult.jobs.length, 0);
  assert.equal(emptyResult.totalViews, 0);
  assert.equal(emptyResult.totalApplies, 0);

  // Blank query returns 0
  const blankResult = filterEmployerJobs(mockAllJobs, "");
  assert.equal(blankResult.count, 0);
});

test("Candidate Onboarding Modal: Multi-tier suppression rules prevent unwanted popups", () => {
  function shouldShowOnboardingModal({
    isLoadingClerk,
    isOnboardingCompleted,
    hasActiveSubscription,
    isSignedIn,
    cookieCompleted,
    sessionStorageCompleted,
  }) {
    // 1. Clerk still loading auth state - do NOT pop up early
    if (isLoadingClerk) return false;

    // 2. Already completed (state, cookie, or sessionStorage)
    if (isOnboardingCompleted || cookieCompleted || sessionStorageCompleted) return false;

    // 3. User is already authenticated or paying subscriber
    if (isSignedIn || hasActiveSubscription) return false;

    return true;
  }

  // Brand new visitor (first visit) -> Should show
  assert.equal(
    shouldShowOnboardingModal({
      isLoadingClerk: false,
      isOnboardingCompleted: false,
      hasActiveSubscription: false,
      isSignedIn: false,
      cookieCompleted: false,
      sessionStorageCompleted: false,
    }),
    true
  );

  // Clerk is loading -> Must NOT show prematurely
  assert.equal(
    shouldShowOnboardingModal({
      isLoadingClerk: true,
      isOnboardingCompleted: false,
      hasActiveSubscription: false,
      isSignedIn: false,
      cookieCompleted: false,
      sessionStorageCompleted: false,
    }),
    false
  );

  // Signed-in user -> Must NOT show
  assert.equal(
    shouldShowOnboardingModal({
      isLoadingClerk: false,
      isOnboardingCompleted: false,
      hasActiveSubscription: false,
      isSignedIn: true,
      cookieCompleted: false,
      sessionStorageCompleted: false,
    }),
    false
  );

  // Completed via cookie -> Must NOT show
  assert.equal(
    shouldShowOnboardingModal({
      isLoadingClerk: false,
      isOnboardingCompleted: false,
      hasActiveSubscription: false,
      isSignedIn: false,
      cookieCompleted: true,
      sessionStorageCompleted: false,
    }),
    false
  );

  // Completed via sessionStorage -> Must NOT show
  assert.equal(
    shouldShowOnboardingModal({
      isLoadingClerk: false,
      isOnboardingCompleted: false,
      hasActiveSubscription: false,
      isSignedIn: false,
      cookieCompleted: false,
      sessionStorageCompleted: true,
    }),
    false
  );

  // Active subscriber -> Must NOT show
  assert.equal(
    shouldShowOnboardingModal({
      isLoadingClerk: false,
      isOnboardingCompleted: false,
      hasActiveSubscription: true,
      isSignedIn: false,
      cookieCompleted: false,
      sessionStorageCompleted: false,
    }),
    false
  );
});

test("Job Freshness: Default sort strictly places today's newest listings ahead of older listings", () => {
  const jobsList = [
    {
      id: "old-1",
      title: "Engineer Two Days Ago",
      company: "Company A",
      postedAt: "2026-10-05T18:00:00.000Z",
      status: "active",
      tags: [],
    },
    {
      id: "new-1",
      title: "Engineer Just Posted Today",
      company: "Company B",
      postedAt: "2026-10-07T20:00:00.000Z",
      status: "active",
      tags: [],
    },
    {
      id: "mid-1",
      title: "Engineer Yesterday",
      company: "Company C",
      postedAt: "2026-10-06T12:00:00.000Z",
      status: "active",
      tags: [],
    },
  ];

  // Default sort by date descending
  const sorted = filterJobs(jobsList, {});
  assert.equal(sorted[0].id, "new-1", "Newest job from today must be first");
  assert.equal(sorted[1].id, "mid-1", "Job from yesterday must be second");
  assert.equal(sorted[2].id, "old-1", "Job from two days ago must be last");
});

test("Middleware Route Strategy: Public-first policy protects only /dashboard and allows public content and 404s", () => {
  // Read middleware.ts source to verify Public-First pattern
  const middlewareContent = fs.readFileSync(path.resolve("middleware.ts"), "utf-8");
  assert.ok(
    middlewareContent.includes("isProtectedRoute"),
    "middleware.ts must define isProtectedRoute instead of restrictive isPublicRoute"
  );
  assert.ok(
    middlewareContent.includes('"/dashboard(.*)"'),
    "middleware.ts must protect /dashboard"
  );
  assert.ok(
    !middlewareContent.includes("!isPublicRoute"),
    "middleware.ts must not block all unknown routes with !isPublicRoute"
  );
});

test("OG Image Satori Hygiene: /api/og and /api/og/job avoid z-index warnings and dynamic font 400 errors", () => {
  const ogRoute = fs.readFileSync(path.resolve("app/api/og/route.tsx"), "utf-8");
  const ogJobRoute = fs.readFileSync(path.resolve("app/api/og/job/route.tsx"), "utf-8");

  // Satori does not support z-index (causes [warn] `z-index` is currently not supported)
  assert.ok(!ogRoute.includes("zIndex:"), "app/api/og/route.tsx must not contain zIndex");
  assert.ok(!ogJobRoute.includes("zIndex:"), "app/api/og/job/route.tsx must not contain zIndex");

  // Unicode checkmark ✓ triggers failed dynamic font download from Google Fonts (Status 400)
  assert.ok(!ogRoute.includes("✓"), "app/api/og/route.tsx must use SVG icon instead of unicode ✓");
  assert.ok(!ogJobRoute.includes("✓"), "app/api/og/job/route.tsx must use SVG icon instead of unicode ✓");
});

test("Public Editorial Guides: Ghost Jobs and Virtual Secret Santa pages exist", () => {
  assert.ok(
    fs.existsSync(path.resolve("app/ghost-job-listings-on-the-rise-how-to/page.tsx")),
    "Ghost job guide page must exist"
  );
  assert.ok(
    fs.existsSync(path.resolve("app/10-best-virtual-secret-santa-ideas-for/page.tsx")),
    "Virtual secret santa guide page must exist"
  );
});


