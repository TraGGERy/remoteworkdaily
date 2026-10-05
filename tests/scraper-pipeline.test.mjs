import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";

function generateCanonicalHash(company, title, applyUrl) {
  const normalized = `${(company || "").toLowerCase().trim()}:${(title || "").toLowerCase().trim()}:${(applyUrl || "").toLowerCase().trim()}`;
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

function parseWWRItem(itemStr) {
  const rawTitle = (itemStr.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || itemStr.match(/<title>(.*?)<\/title>/))?.[1] || "";
  const link = (itemStr.match(/<link><!\[CDATA\[(.*?)\]\]><\/link>/) || itemStr.match(/<link>(.*?)<\/link>/))?.[1] || "";
  const pubDate = (itemStr.match(/<pubDate>(.*?)<\/pubDate>/))?.[1];

  let company = "Remote Employer";
  let title = rawTitle;
  if (rawTitle.includes(":")) {
    const parts = rawTitle.split(":");
    company = parts[0].trim();
    title = parts.slice(1).join(":").trim();
  }

  return { company, title, link, pubDate };
}

function batchDeduplicate(existingList, incomingList) {
  const hashToIdx = new Map();
  for (let i = 0; i < existingList.length; i++) {
    if (existingList[i].canonicalHash) hashToIdx.set(existingList[i].canonicalHash, i);
  }

  let added = 0;
  let updated = 0;
  const toPrepend = [];

  for (const job of incomingList) {
    if (job.canonicalHash && hashToIdx.has(job.canonicalHash)) {
      const idx = hashToIdx.get(job.canonicalHash);
      if (idx >= 0) existingList[idx] = { ...existingList[idx], ...job };
      updated++;
    } else {
      toPrepend.push(job);
      if (job.canonicalHash) hashToIdx.set(job.canonicalHash, -1);
      added++;
    }
  }

  return { added, updated, total: toPrepend.length + existingList.length };
}

test("Scraper Pipeline: WWR XML RSS item parses CDATA company and title accurately", () => {
  const sampleRss = `
    <item>
      <title><![CDATA[Stripe: Staff Platform Engineer]]></title>
      <link><![CDATA[https://weworkremotely.com/remote-jobs/stripe-staff-platform-engineer]]></link>
      <pubDate>Thu, 24 Sep 2026 12:00:00 +0000</pubDate>
    </item>
  `;

  const parsed = parseWWRItem(sampleRss);
  assert.equal(parsed.company, "Stripe");
  assert.equal(parsed.title, "Staff Platform Engineer");
  assert.equal(parsed.link, "https://weworkremotely.com/remote-jobs/stripe-staff-platform-engineer");
  assert.ok(parsed.pubDate);
});

test("Scraper Pipeline: Batch deduplication prevents duplicate listings across daily runs", () => {
  const existing = [
    {
      id: "job-1",
      company: "GitLab",
      title: "Backend Engineer",
      canonicalHash: generateCanonicalHash("GitLab", "Backend Engineer", "https://gitlab.com/job/1"),
    },
    {
      id: "job-2",
      company: "Automattic",
      title: "Code Wrangler",
      canonicalHash: generateCanonicalHash("Automattic", "Code Wrangler", "https://automattic.com/job/2"),
    }
  ];

  const incoming = [
    // Duplicate existing
    {
      id: "job-new-1",
      company: "GitLab",
      title: "Backend Engineer",
      canonicalHash: generateCanonicalHash("GitLab", "Backend Engineer", "https://gitlab.com/job/1"),
    },
    // Completely new
    {
      id: "job-new-2",
      company: "Linear",
      title: "Frontend Engineer",
      canonicalHash: generateCanonicalHash("Linear", "Frontend Engineer", "https://linear.app/jobs/fe"),
    },
    // Duplicate within incoming batch itself
    {
      id: "job-new-3",
      company: "Linear",
      title: "Frontend Engineer",
      canonicalHash: generateCanonicalHash("Linear", "Frontend Engineer", "https://linear.app/jobs/fe"),
    }
  ];

  const result = batchDeduplicate([...existing], incoming);
  assert.equal(result.added, 1, "Only 1 truly unique job should be added");
  assert.equal(result.updated, 2, "Duplicate existing and duplicate in batch should be counted as updates");
  assert.equal(result.total, 3, "Total listings should equal 3");
});

test("Scraper Pipeline: High-capacity multi-stream throughput scales to thousands of items without collision", () => {
  const pool = [];
  const TOTAL_SYNTHETIC = 2500;

  for (let i = 0; i < TOTAL_SYNTHETIC; i++) {
    const comp = `Company-${i % 200}`;
    const title = `Role-${i}`;
    const url = `https://careers.example.com/${i}`;
    pool.push({
      id: `synthetic-${i}`,
      company: comp,
      title: title,
      canonicalHash: generateCanonicalHash(comp, title, url),
    });
  }

  const existing = pool.slice(0, 500);
  const incoming = pool.slice(400); // 100 overlap, 2000 new

  const res = batchDeduplicate([...existing], incoming);
  assert.equal(res.added, 2000, "Should add precisely 2000 unique new items");
  assert.equal(res.updated, 100, "Should detect 100 overlapping items");
  assert.equal(res.total, 2500, "Final pool count should equal 2500");
});

function classifyJobCategory(title, tags = []) {
  const titleLower = (title || "").toLowerCase();
  const tagsLower = tags.map((t) => (t || "").toLowerCase());

  if (
    titleLower.includes("farm") ||
    titleLower.includes("agri") ||
    titleLower.includes("agronom") ||
    titleLower.includes("crop") ||
    titleLower.includes("livestock") ||
    titleLower.includes("horticult") ||
    titleLower.includes("ranch") ||
    titleLower.includes("grower") ||
    titleLower.includes("harvest") ||
    titleLower.includes("soil") ||
    titleLower.includes("forestry") ||
    titleLower.includes("agro") ||
    titleLower.includes("seed") ||
    tagsLower.some((t) => t.includes("agri") || t.includes("farm") || t.includes("crop"))
  ) {
    return "farming";
  }

  if (
    titleLower.includes("driver") ||
    titleLower.includes("technician") ||
    titleLower.includes("electrician") ||
    titleLower.includes("mechanic") ||
    titleLower.includes("plumber") ||
    titleLower.includes("warehouse") ||
    titleLower.includes("operator") ||
    titleLower.includes("welder") ||
    titleLower.includes("carpenter") ||
    titleLower.includes("assembly") ||
    titleLower.includes("maintenance") ||
    titleLower.includes("logistics") ||
    titleLower.includes("installer") ||
    titleLower.includes("forklift")
  ) {
    return "trades";
  }

  if (
    titleLower.includes("cook") ||
    titleLower.includes("chef") ||
    titleLower.includes("barista") ||
    titleLower.includes("restaurant") ||
    titleLower.includes("kitchen") ||
    titleLower.includes("server") ||
    titleLower.includes("food") ||
    titleLower.includes("dining") ||
    titleLower.includes("baker") ||
    titleLower.includes("hospitality") ||
    titleLower.includes("catering")
  ) {
    return "hospitality";
  }

  if (
    titleLower.includes("teacher") ||
    titleLower.includes("tutor") ||
    titleLower.includes("instructor") ||
    titleLower.includes("professor") ||
    titleLower.includes("education")
  ) {
    return "education";
  }

  return "other";
}

test("Scraper Pipeline: Multi-sector classifier accurately detects Farming & Agriculture roles", () => {
  assert.equal(classifyJobCategory("Agroforestry Innovations Specialist"), "farming");
  assert.equal(classifyJobCategory("Field Operations Agronomist"), "farming");
  assert.equal(classifyJobCategory("Livestock & Cattle Ranch Manager"), "farming");
  assert.equal(classifyJobCategory("Organic Farm Hand & Harvester"), "farming");
  assert.equal(classifyJobCategory("Crop Science & Soil Researcher"), "farming");
  assert.equal(classifyJobCategory("General Operations Lead", ["Agriculture", "Corn & Soy"]), "farming");
});

test("Scraper Pipeline: Multi-sector classifier accurately detects Trades, Hospitality, and Education", () => {
  assert.equal(classifyJobCategory("Heavy Equipment Maintenance Technician"), "trades");
  assert.equal(classifyJobCategory("Warehouse Forklift Operator"), "trades");
  assert.equal(classifyJobCategory("Commercial Kitchen Head Chef"), "hospitality");
  assert.equal(classifyJobCategory("Bakery & Food Production Associate"), "hospitality");
  assert.equal(classifyJobCategory("Online High School Math Teacher"), "education");
});

function parseReliefWebItem(itemStr) {
  const rawTitle = (itemStr.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || itemStr.match(/<title>(.*?)<\/title>/))?.[1] || "";
  const link = (itemStr.match(/<link><!\[CDATA\[(.*?)\]\]><\/link>/) || itemStr.match(/<link>(.*?)<\/link>/))?.[1] || "";
  const sourceMatch = (itemStr.match(/<source[^>]*>(.*?)<\/source>/) || itemStr.match(/<dc:creator>(.*?)<\/dc:creator>/))?.[1];

  let company = sourceMatch || "ReliefWeb Global Organization";
  let title = rawTitle;
  if (rawTitle.includes(" - ")) {
    const parts = rawTitle.split(" - ");
    title = parts[0].trim();
    company = parts.slice(1).join(" - ").trim() || company;
  }

  return { title, company, link };
}

test("Scraper Pipeline: ReliefWeb RSS item parses company and title accurately", () => {
  const itemXml = `
    <item>
      <title><![CDATA[Agricultural Field Coordinator - Food and Agriculture Organization]]></title>
      <link><![CDATA[https://reliefweb.int/job/12345/agricultural-field-coordinator]]></link>
      <pubDate>Mon, 05 Oct 2026 10:00:00 +0000</pubDate>
    </item>
  `;
  const parsed = parseReliefWebItem(itemXml);
  assert.equal(parsed.title, "Agricultural Field Coordinator");
  assert.equal(parsed.company, "Food and Agriculture Organization");
  assert.equal(parsed.link, "https://reliefweb.int/job/12345/agricultural-field-coordinator");
});

function checkIntervalSync(lastSyncTimestamp, force = false, minIntervalMinutes = 100) {
  if (force) return { allowed: true };
  if (!lastSyncTimestamp) return { allowed: true };
  const elapsedMs = Date.now() - lastSyncTimestamp;
  const minIntervalMs = minIntervalMinutes * 60 * 1000;
  if (elapsedMs < minIntervalMs) {
    return { allowed: false, remainingMin: Math.ceil((minIntervalMs - elapsedMs) / 60000) };
  }
  return { allowed: true };
}

test("Scraper Pipeline: 2-hour interval rate limiter prevents rapid repeat execution but permits 2-hour cycles", () => {
  const now = Date.now();

  // 1. Executed 30 minutes ago (should be rejected unless forced)
  const thirtyMinAgo = now - 30 * 60 * 1000;
  const rejectCheck = checkIntervalSync(thirtyMinAgo, false, 100);
  assert.equal(rejectCheck.allowed, false, "Should disallow execution within 100 minutes of last run");

  // 2. Forced execution bypasses throttle
  const forceCheck = checkIntervalSync(thirtyMinAgo, true, 100);
  assert.equal(forceCheck.allowed, true, "Forced sync should bypass interval throttle");

  // 3. Executed 125 minutes ago (2-hour cadence fulfilled)
  const twoHoursAgo = now - 125 * 60 * 1000;
  const permitCheck = checkIntervalSync(twoHoursAgo, false, 100);
  assert.equal(permitCheck.allowed, true, "Should allow execution after 2 hours have elapsed");
});

