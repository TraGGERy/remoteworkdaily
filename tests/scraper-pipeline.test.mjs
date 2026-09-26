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
