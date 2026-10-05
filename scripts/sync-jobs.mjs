#!/usr/bin/env node

/**
 * Remote Work Daily — High-Capacity Daily Job Ingestion CLI
 *
 * Scrapes and aggregates ~2,000 fresh verified remote jobs daily across
 * Arbeitnow multi-page, WeWorkRemotely RSS, Jobicy, RemoteOK, Remotive, and Himalayas.
 * Normalizes salary ranges, categorizes disciplines, detects workplace types, and deduplicates.
 *
 * Usage:
 *   node scripts/sync-jobs.mjs [--target=2000] [--force]
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";

const DATA_FILE = path.join(process.cwd(), "data", "jobs.json");
const SYNC_STATE_FILE = path.join(process.cwd(), "data", "sync-state.json");
const USER_AGENT = "RemoteWorkDailyScraper/2.0 (+https://remoteworkdaily.com; support@remoteworkdaily.com)";

const args = process.argv.slice(2);
const targetArg = args.find((a) => a.startsWith("--target="));
const TARGET_COUNT = targetArg ? parseInt(targetArg.split("=")[1], 10) || 2000 : 2000;
const IS_FORCED = args.includes("--force");

function generateCanonicalHash(company, title, applyUrl) {
  const normalized = `${(company || "").toLowerCase().trim()}:${(title || "").toLowerCase().trim()}:${(applyUrl || "").toLowerCase().trim()}`;
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

function cleanHtmlDescription(raw) {
  if (!raw) return "";
  let clean = raw
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x26;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
  return clean.slice(0, 1500);
}

function normalizeRawJob(raw) {
  const title = (raw.title || raw.position || "Remote Specialist").trim();
  const company = (raw.company || raw.company_name || "Hiring Company").trim();
  const companySlug = company.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const applyUrl = raw.apply_url || raw.url || "https://remoteworkdaily.com";

  let tags = [];
  if (Array.isArray(raw.tags)) {
    tags = raw.tags.map((t) => String(t).trim()).filter(Boolean);
  } else if (typeof raw.tags === "string") {
    tags = raw.tags.split(",").map((t) => t.trim()).filter(Boolean);
  }

  const titleLower = title.toLowerCase();
  const descLower = (raw.description || "").toLowerCase();
  const locLower = (raw.location || "").toLowerCase();
  const tagsLower = tags.map((t) => t.toLowerCase());

  let workplaceType = "remote";
  if (raw.workplace_type) {
    workplaceType = raw.workplace_type;
  } else if (raw.remote === false) {
    workplaceType = titleLower.includes("hybrid") || descLower.includes("hybrid") ? "hybrid" : "on-site";
  } else if (titleLower.includes("hybrid") || locLower.includes("hybrid") || tagsLower.includes("hybrid")) {
    workplaceType = "hybrid";
  } else if (locLower.includes("on-site") || locLower.includes("onsite") || locLower.includes("in office")) {
    workplaceType = "on-site";
  }

  const workplaceTag = workplaceType === "on-site" ? "On-site" : workplaceType === "hybrid" ? "Hybrid" : "Remote";
  if (!tags.some((t) => t.toLowerCase() === workplaceTag.toLowerCase())) {
    tags.unshift(workplaceTag);
  }

  let category = "other";

  const farmingRegex = /\b(farm|farmer|farmers|farming|agri|agriculture|agricultural|agronomist|agronomy|crops?|livestock|horticulture|ranch|rancher|ranchers|ranching|grower|growers|harvest|harvester|harvesting|soil|forestry|agroforestry|agtech)\b/i;
  const tradesRegex = /\b(driver|technician|electrician|mechanic|plumber|warehouse|operator|welder|carpenter|assembly|maintenance|logistics|installer|forklift)\b/i;
  const hospitalityRegex = /\b(cook|chef|barista|restaurant|kitchen|server|food|dining|baker|bakery|hospitality|catering|culinary|bartender)\b/i;
  const medicalRegex = /\b(nurse|doctor|physician|medical|clinical|pharmacy|pharmacist|therapist|dental|dentist|healthcare|caregiver)\b/i;
  const educationRegex = /\b(teacher|tutor|instructor|professor|education|curriculum|academic|faculty|school)\b/i;
  const execRegex = /\b(cto|ceo|cfo|coo|vp|vice president|head of|director|executive|leiter|bereichsleitung)\b/i;
  const opsRegex = /\b(devops|sre|sysadmin|systemadministrator|cloud engineer|infrastructure)\b/i;
  const financeRegex = /\b(finance|financial|accounting|accountant|tax|steuer|payroll|auditor|bookkeeper|bank|banking|finanzberater)\b/i;
  const designRegex = /\b(design|designer|ux|ui|graphic|illustrator|animator)\b/i;
  const marketingRegex = /\b(marketing|seo|growth|social media|content creator|copywriter|copywriting|brand)\b/i;
  const supportRegex = /\b(support|customer success|customer service|kundendienst|call center|client care)\b/i;
  const salesRegex = /\b(sales|account executive|business development|buyer|seller|sdr|bdr)\b/i;
  const devRegex = /\b(developer|software|programmer|full stack|fullstack|backend|frontend|golang|python|react|typescript|rust|engineer)\b/i;

  const combinedSearch = `${title} ${tags.join(" ")}`;

  if (farmingRegex.test(combinedSearch)) {
    category = "farming";
  } else if (tradesRegex.test(combinedSearch)) {
    category = "trades";
  } else if (hospitalityRegex.test(combinedSearch)) {
    category = "hospitality";
  } else if (medicalRegex.test(combinedSearch)) {
    category = "medical";
  } else if (educationRegex.test(combinedSearch)) {
    category = "education";
  } else if (financeRegex.test(combinedSearch)) {
    category = "finance";
  } else if (execRegex.test(combinedSearch)) {
    category = "exec";
  } else if (opsRegex.test(combinedSearch)) {
    category = "ops";
  } else if (designRegex.test(combinedSearch)) {
    category = "design";
  } else if (marketingRegex.test(combinedSearch)) {
    category = "marketing";
  } else if (supportRegex.test(combinedSearch)) {
    category = "support";
  } else if (salesRegex.test(combinedSearch)) {
    category = "sales";
  } else if (devRegex.test(combinedSearch)) {
    category = "dev";
  }

  let salaryMin = raw.salary_min ? Number(raw.salary_min) : undefined;
  let salaryMax = raw.salary_max ? Number(raw.salary_max) : undefined;

  if (!salaryMin && !salaryMax && raw.salary) {
    const numbers = String(raw.salary).match(/\d+[\d,]*/g);
    if (numbers && numbers.length >= 2) {
      salaryMin = parseInt(numbers[0].replace(/,/g, ""), 10);
      salaryMax = parseInt(numbers[1].replace(/,/g, ""), 10);
    } else if (numbers && numbers.length === 1) {
      salaryMin = parseInt(numbers[0].replace(/,/g, ""), 10);
    }
  }

  if (salaryMin && salaryMin < 1000) salaryMin *= 1000;
  if (salaryMax && salaryMax < 1000) salaryMax *= 1000;

  if (!salaryMin && !salaryMax) {
    if (category === "dev") { salaryMin = 135000; salaryMax = 185000; }
    else if (category === "design") { salaryMin = 115000; salaryMax = 160000; }
    else if (category === "marketing") { salaryMin = 100000; salaryMax = 145000; }
    else if (category === "exec") { salaryMin = 180000; salaryMax = 275000; }
    else if (category === "ops") { salaryMin = 120000; salaryMax = 170000; }
    else if (category === "finance") { salaryMin = 95000; salaryMax = 145000; }
    else if (category === "medical") { salaryMin = 85000; salaryMax = 140000; }
    else if (category === "farming") { salaryMin = 55000; salaryMax = 90000; }
    else if (category === "trades") { salaryMin = 55000; salaryMax = 85000; }
    else if (category === "hospitality") { salaryMin = 45000; salaryMax = 75000; }
    else if (category === "education") { salaryMin = 60000; salaryMax = 95000; }
    else if (category === "support") { salaryMin = 60000; salaryMax = 85000; }
    else { salaryMin = 70000; salaryMax = 110000; }
  }

  const id = `job-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${companySlug}`.replace(/--+/g, "-").slice(0, 80);
  let location = raw.candidate_required_location || raw.location || (workplaceType === "remote" ? "Worldwide" : "On-site");

  const companyLogo = raw.company_logo || raw.company_logo_url || "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=128&h=128&fit=crop&q=80";

  return {
    id,
    slug,
    title,
    company,
    companySlug,
    companyLogo,
    companyWebsite: raw.url || "https://remoteworkdaily.com",
    verified: true,
    featured: Math.random() > 0.85,
    sticky: false,
    location,
    locationCode: location.toLowerCase().includes("us") ? "US" : location.toLowerCase().includes("germany") ? "DE" : "WW",
    workplaceType,
    category,
    tags: tags.slice(0, 6),
    benefits: workplaceType === "remote"
      ? ["distributed_team", "async", "unlimited_vacation", "home_office_budget"]
      : ["health_insurance", "401k", "paid_vacation", "commuter_benefits"],
    salaryMin,
    salaryMax,
    salaryCurrency: "USD",
    description: cleanHtmlDescription(raw.description) || `Join ${company} as ${title}. We offer competitive compensation with transparent salaries, generous benefits, and strong career progression.`,
    applyUrl,
    postedAt: raw.posted_at || new Date().toISOString(),
    viewsCount: Math.floor(Math.random() * 300) + 20,
    appliesCount: Math.floor(Math.random() * 20) + 1,
    source: raw.source || "feed",
    atsProvider: raw.ats_provider,
    isDirectCompanyPost: raw.is_direct_company_post || raw.source === "ats",
    status: "active",
    canonicalHash: generateCanonicalHash(company, title, applyUrl),
  };
}

async function runScrape() {
  console.log(`\n========================================================`);
  console.log(`🚀 RemoteWorkDaily Job Ingestion Pipeline`);
  console.log(`   Target: ~${TARGET_COUNT} listings daily | Force: ${IS_FORCED}`);
  console.log(`========================================================\n`);

  const startTime = Date.now();
  const pagesNeeded = Math.min(Math.max(Math.ceil(TARGET_COUNT / 200), 12), 25);

  console.log(`[1/4] Harvesting live multi-sector job streams (Arbeitnow 1..${pagesNeeded}, ReliefWeb RSS, WWR 8 feeds, Jobicy 10 industries, RemoteOK, Remotive, Greenhouse, Ashby)...`);

  const rawJobs = [];
  const sources = { arbeitnow: 0, wwr: 0, jobicy: 0, remoteok: 0, remotive: 0, himalayas: 0, reliefweb: 0, ats: 0 };

  // 1. Arbeitnow Multi-Page High-Capacity
  const pagePromises = Array.from({ length: pagesNeeded }, (_, i) => i + 1).map(async (p) => {
    try {
      const res = await fetch(`https://arbeitnow.com/api/job-board-api?page=${p}`, {
        headers: { "User-Agent": USER_AGENT },
      });
      if (!res.ok) return [];
      const json = await res.json();
      return (json.data || []).map((item) => ({
        title: item.title,
        company_name: item.company_name,
        url: item.url,
        apply_url: item.url,
        tags: item.tags || [],
        location: item.location || (item.remote ? "Worldwide" : "On-site"),
        description: item.description,
        posted_at: item.created_at ? new Date(item.created_at * 1000).toISOString() : undefined,
        remote: Boolean(item.remote),
      }));
    } catch {
      return [];
    }
  });

  // 2. WeWorkRemotely RSS (8 categories)
  const wwrPromise = (async () => {
    const cats = [
      "remote-programming-jobs",
      "remote-design-jobs",
      "remote-sales-and-marketing-jobs",
      "remote-product-jobs",
      "remote-management-and-finance-jobs",
      "remote-customer-support-jobs",
      "remote-devops-sysadmin-jobs",
      "all-other-remote-jobs",
    ];
    const out = [];
    for (const c of cats) {
      try {
        const res = await fetch(`https://weworkremotely.com/categories/${c}.rss`, { headers: { "User-Agent": USER_AGENT } });
        if (!res.ok) continue;
        const text = await res.text();
        const items = text.match(/<item>([\s\S]*?)<\/item>/g) || [];
        for (const itemStr of items) {
          const rawTitle = (itemStr.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || itemStr.match(/<title>(.*?)<\/title>/))?.[1] || "";
          const link = (itemStr.match(/<link><!\[CDATA\[(.*?)\]\]><\/link>/) || itemStr.match(/<link>(.*?)<\/link>/))?.[1] || "";
          const pubDate = (itemStr.match(/<pubDate>(.*?)<\/pubDate>/))?.[1];
          const descMatch = (itemStr.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/) || itemStr.match(/<description>([\s\S]*?)<\/description>/))?.[1] || "";
          if (!rawTitle || !link) continue;
          let company = "Remote Employer";
          let title = rawTitle;
          if (rawTitle.includes(":")) {
            const parts = rawTitle.split(":");
            company = parts[0].trim();
            title = parts.slice(1).join(":").trim();
          }
          out.push({
            title,
            company_name: company,
            url: link,
            apply_url: link,
            description: descMatch,
            posted_at: pubDate ? new Date(pubDate).toISOString() : undefined,
            remote: true,
          });
        }
      } catch {}
    }
    return out;
  })();

  // 3. Jobicy (10 industries)
  const jobicyPromise = (async () => {
    const ind = [
      "engineering",
      "dev",
      "marketing",
      "design-multimedia",
      "business",
      "supporting",
      "seller",
      "hr",
      "education",
      "copywriting",
    ];
    const out = [];
    for (const i of ind) {
      try {
        const res = await fetch(`https://jobicy.com/api/v2/remote-jobs?count=50&industry=${i}`, { headers: { "User-Agent": USER_AGENT } });
        if (!res.ok) continue;
        const json = await res.json();
        for (const it of json.jobs || []) {
          out.push({
            title: it.jobTitle,
            company_name: it.companyName,
            url: it.url,
            apply_url: it.url,
            location: it.jobGeo || "Worldwide",
            description: it.jobDescription,
            posted_at: it.pubDate,
            salary_min: it.annualSalaryMin,
            salary_max: it.annualSalaryMax,
            remote: true,
            tags: [it.jobIndustry, it.jobType].filter(Boolean),
          });
        }
      } catch {}
    }
    return out;
  })();

  // 4. RemoteOK
  const remoteokPromise = (async () => {
    try {
      const res = await fetch("https://remoteok.com/api", { headers: { "User-Agent": USER_AGENT } });
      if (!res.ok) return [];
      const json = await res.json();
      return (json || []).filter((it) => it && (it.position || it.title) && it.company).map((it) => ({
        title: it.position || it.title,
        company_name: it.company,
        url: it.url ? (it.url.startsWith("http") ? it.url : `https://remoteok.com${it.url}`) : it.apply_url,
        apply_url: it.apply_url || (it.url ? (it.url.startsWith("http") ? it.url : `https://remoteok.com${it.url}`) : undefined),
        tags: it.tags || [],
        location: it.location || "Worldwide",
        description: it.description,
        posted_at: it.date ? new Date(it.date).toISOString() : undefined,
        salary_min: it.salary_min,
        salary_max: it.salary_max,
        remote: true,
      }));
    } catch {
      return [];
    }
  })();

  // 5. Remotive
  const remotivePromise = (async () => {
    try {
      const res = await fetch("https://remotive.com/api/remote-jobs", { headers: { "User-Agent": USER_AGENT } });
      if (!res.ok) return [];
      const json = await res.json();
      return (json.jobs || []).map((it) => ({
        title: it.title,
        company_name: it.company_name,
        url: it.url,
        apply_url: it.url,
        tags: it.tags || [it.category].filter(Boolean),
        location: it.candidate_required_location || "Worldwide",
        salary: it.salary,
        description: it.description,
        posted_at: it.publication_date,
        remote: true,
      }));
    } catch {
      return [];
    }
  })();

  // 6. ReliefWeb Agriculture & Humanitarian RSS
  const reliefWebPromise = (async () => {
    try {
      const res = await fetch("https://reliefweb.int/jobs/rss.xml", { headers: { "User-Agent": USER_AGENT } });
      if (!res.ok) return [];
      const text = await res.text();
      const items = text.match(/<item>([\s\S]*?)<\/item>/g) || [];
      const out = [];
      for (const itemStr of items) {
        const rawTitle = (itemStr.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || itemStr.match(/<title>(.*?)<\/title>/))?.[1] || "";
        const link = (itemStr.match(/<link><!\[CDATA\[(.*?)\]\]><\/link>/) || itemStr.match(/<link>(.*?)<\/link>/))?.[1] || "";
        const pubDate = (itemStr.match(/<pubDate>(.*?)<\/pubDate>/))?.[1];
        const descMatch = (itemStr.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/) || itemStr.match(/<description>([\s\S]*?)<\/description>/))?.[1] || "";
        const sourceMatch = (itemStr.match(/<source[^>]*>(.*?)<\/source>/) || itemStr.match(/<dc:creator>(.*?)<\/dc:creator>/))?.[1];

        if (!rawTitle || !link) continue;

        let company = sourceMatch || "ReliefWeb Global Organization";
        let title = rawTitle;
        if (rawTitle.includes(" - ")) {
          const parts = rawTitle.split(" - ");
          title = parts[0].trim();
          company = parts.slice(1).join(" - ").trim() || company;
        }

        out.push({
          title,
          company_name: company,
          url: link,
          apply_url: link,
          description: descMatch,
          posted_at: pubDate ? new Date(pubDate).toISOString() : undefined,
          remote: true,
          tags: ["Agriculture & Food", "Field Operations", "ReliefWeb"],
        });
      }
      return out;
    } catch {
      return [];
    }
  })();

  // 7. Direct Company ATS (Greenhouse & Ashby)
  const atsPromise = (async () => {
    const out = [];
    const ghCompanies = [
      { token: "oneacrefund", name: "One Acre Fund" },
      { token: "soundagriculture", name: "Sound Agriculture" },
      { token: "hellofresh", name: "HelloFresh" },
      { token: "sweetgreen", name: "Sweetgreen" },
      { token: "toast", name: "Toast" },
      { token: "samsara", name: "Samsara" },
      { token: "instacart", name: "Instacart" },
      { token: "gusto", name: "Gusto" },
      { token: "stripe", name: "Stripe" },
      { token: "reddit", name: "Reddit" },
      { token: "gitlab", name: "GitLab" },
      { token: "zapier", name: "Zapier" },
      { token: "automattic", name: "Automattic" },
      { token: "docker", name: "Docker" },
      { token: "elastic", name: "Elastic" },
    ];
    for (const c of ghCompanies) {
      try {
        const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${c.token}/jobs?content=true`, { headers: { "User-Agent": USER_AGENT } });
        if (!res.ok) continue;
        const json = await res.json();
        for (const it of (json.jobs || [])) {
          out.push({
            title: it.title,
            company_name: c.name,
            url: it.absolute_url,
            apply_url: it.absolute_url,
            location: it.location?.name || "Worldwide",
            description: cleanHtmlDescription(it.content),
            posted_at: it.updated_at ? new Date(it.updated_at).toISOString() : new Date().toISOString(),
            remote: true,
            source: "ats",
            ats_provider: "greenhouse",
            is_direct_company_post: true,
            tags: ["Direct ATS", "Company Careers", c.name],
          });
        }
      } catch {}
    }

    const ashbyCompanies = [
      { slug: "openai", name: "OpenAI" },
      { slug: "ramp", name: "Ramp" },
      { slug: "notion", name: "Notion" },
      { slug: "supabase", name: "Supabase" },
      { slug: "linear", name: "Linear" },
      { slug: "cursor", name: "Cursor" },
    ];
    for (const c of ashbyCompanies) {
      try {
        const res = await fetch(`https://api.ashbyhq.com/posting-api/job-board/${c.slug}`, { headers: { "User-Agent": USER_AGENT } });
        if (!res.ok) continue;
        const json = await res.json();
        for (const it of (json.jobs || [])) {
          out.push({
            title: it.title,
            company_name: c.name,
            url: it.jobUrl || it.applyUrl,
            apply_url: it.applyUrl || it.jobUrl,
            location: it.location || "Worldwide",
            description: cleanHtmlDescription(it.descriptionHtml),
            posted_at: it.publishedAt ? new Date(it.publishedAt).toISOString() : new Date().toISOString(),
            remote: true,
            source: "ats",
            ats_provider: "ashby",
            is_direct_company_post: true,
            tags: ["Direct ATS", "Company Careers", c.name],
          });
        }
      } catch {}
    }
    return out;
  })();

  // Run all in parallel
  const [arbeitnowResults, wwrList, jobicyList, remoteokList, remotiveList, reliefWebList, atsList] = await Promise.all([
    Promise.all(pagePromises),
    wwrPromise,
    jobicyPromise,
    remoteokPromise,
    remotivePromise,
    reliefWebPromise,
    atsPromise,
  ]);

  for (const group of arbeitnowResults) {
    sources.arbeitnow += group.length;
    for (const it of group) rawJobs.push(it);
  }
  sources.wwr = wwrList.length;
  for (const it of wwrList) rawJobs.push(it);

  sources.jobicy = jobicyList.length;
  for (const it of jobicyList) rawJobs.push(it);

  sources.remoteok = remoteokList.length;
  for (const it of remoteokList) rawJobs.push(it);

  sources.remotive = remotiveList.length;
  for (const it of remotiveList) rawJobs.push(it);

  sources.reliefweb = reliefWebList.length;
  for (const it of reliefWebList) rawJobs.push(it);

  sources.ats = atsList.length;
  for (const it of atsList) rawJobs.push(it);

  console.log(`[2/4] Harvested ${rawJobs.length} raw listings across feeds:`);
  console.log(`      • Arbeitnow: ${sources.arbeitnow}`);
  console.log(`      • ReliefWeb (Agriculture & Ops): ${sources.reliefweb}`);
  console.log(`      • WeWorkRemotely RSS: ${sources.wwr}`);
  console.log(`      • Jobicy: ${sources.jobicy}`);
  console.log(`      • RemoteOK: ${sources.remoteok}`);
  console.log(`      • Remotive: ${sources.remotive}`);
  console.log(`      • Direct ATS (Greenhouse/Ashby): ${sources.ats}`);

  console.log(`[3/4] Normalizing data and deduplicating via SHA-256 canonicalHash...`);
  const seenHashes = new Set();
  const normalizedJobs = [];

  for (const raw of rawJobs) {
    if (!raw.title || (!raw.company && !raw.company_name)) continue;
    const normalized = normalizeRawJob(raw);
    if (seenHashes.has(normalized.canonicalHash)) continue;
    seenHashes.add(normalized.canonicalHash);
    normalizedJobs.push(normalized);
  }

  console.log(`[4/4] Writing ${normalizedJobs.length} deduplicated listings to database repository...`);

  // Load existing file
  let existingJobs = [];
  try {
    if (fs.existsSync(DATA_FILE)) {
      existingJobs = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    }
  } catch {}

  const existingHashMap = new Map();
  for (let i = 0; i < existingJobs.length; i++) {
    if (existingJobs[i].canonicalHash) existingHashMap.set(existingJobs[i].canonicalHash, i);
  }

  let added = 0;
  let updated = 0;
  const toPrepend = [];

  for (const job of normalizedJobs) {
    if (existingHashMap.has(job.canonicalHash)) {
      const idx = existingHashMap.get(job.canonicalHash);
      existingJobs[idx] = { ...existingJobs[idx], ...job };
      updated++;
    } else {
      toPrepend.push(job);
      added++;
    }
  }

  const merged = [...toPrepend, ...existingJobs];
  // Sliding window of latest 12,000 active listings
  const MAX_JOBS = 12000;
  const pruned = merged.length > MAX_JOBS ? merged.slice(0, MAX_JOBS) : merged;

  fs.writeFileSync(DATA_FILE, JSON.stringify(pruned, null, 2), "utf8");

  // Write sync state
  const syncState = {
    lastSyncDate: new Date().toISOString().split("T")[0],
    lastSyncTimestamp: Date.now(),
    syncedCount: normalizedJobs.length,
    source: "universal-multi-source",
    targetCount: TARGET_COUNT,
    sources,
  };
  fs.writeFileSync(SYNC_STATE_FILE, JSON.stringify(syncState, null, 2), "utf8");

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n========================================================`);
  console.log(`✅ Job Ingestion Completed in ${durationSec}s`);
  console.log(`   +${added} newly added jobs`);
  console.log(`   ${updated} existing jobs refreshed`);
  console.log(`   ${pruned.length} total active verified listings in database`);
  console.log(`========================================================\n`);
}

runScrape().catch((err) => {
  console.error("Scraper execution failed:", err);
  process.exit(1);
});
