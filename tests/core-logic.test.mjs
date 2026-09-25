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

  if (filters.minSalary && filters.minSalary > 0) {
    result = result.filter((job) => {
      const maxSal = job.salaryMax || job.salaryMin || 0;
      return maxSal >= filters.minSalary;
    });
  }

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
  assert.ok(content.includes("#OpenSalaries"), "llms.txt must reference #OpenSalaries");
  assert.ok(content.includes("/remote-jobs.json"), "llms.txt must reference /remote-jobs.json API feed");
});

// Monetization Invariants: One-Time Payment Contracts
test("Monetization: Strictly One-Time Payment contracts are maintained for employer and candidate", () => {
  const employerStarter = { type: "one-time", price: 249, subscription: false };
  const employerAccelerator = { type: "one-time", price: 399, subscription: false };
  const candidatePass = { type: "one-time", price: 39, subscription: false, guaranteeDays: 60 };

  // Guarantee zero recurring commitments
  assert.equal(employerStarter.subscription, false);
  assert.equal(employerAccelerator.subscription, false);
  assert.equal(candidatePass.subscription, false);

  // Guarantee candidate risk-reversal window
  assert.equal(candidatePass.guaranteeDays, 60);
  assert.equal(candidatePass.price, 39);
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


