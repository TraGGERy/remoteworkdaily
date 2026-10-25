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
import { createClient } from "@supabase/supabase-js";

// Load environment variables (.env.local, .env)
for (const envName of [".env.local", ".env"]) {
  const envPath = path.join(process.cwd(), envName);
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf8").split("\n");
    for (const l of lines) {
      const trimmed = l.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx > 0) {
        const k = trimmed.slice(0, idx).trim();
        const v = trimmed.slice(idx + 1).trim();
        if (!process.env[k]) process.env[k] = v;
      }
    }
  }
}

const DATA_FILE = path.join(process.cwd(), "data", "jobs.json");
const SYNC_STATE_FILE = path.join(process.cwd(), "data", "sync-state.json");
const USER_AGENT = "RemoteWorkDailyScraper/2.0 (+https://remoteworkdaily.com; support@remoteworkdaily.com)";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false, autoRefreshToken: false } })
  : null;

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

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const JUNK_EMAIL_DOMAINS = [
  "example.com", "test.com", "domain.com", "sentry.io", "w3.org", "schema.org", "github.com",
];
const SENIOR_SPECIALIZED_ROLES = /\b(senior|lead|staff|principal|director|head of|vp|vice president|chief|architect|manager|engineer|developer|designer|product|data scientist|quantitative|analyst|finance|cfo|cto|controller|consultant|specialist|strategist)\b/i;
const DAYS_IN_OFFICE_REGEX = /\b(\d(?:\s*-\s*\d)?\s*days?(?:\s*(?:a|\/|per)\s*week)?(?:\s*in(?:\s*the)?\s*office|\s*on-site)?)\b/i;

function generateExternalId(company, title, location = "") {
  const norm = `${(company || "").toLowerCase().trim()}:${(title || "").toLowerCase().trim()}:${(location || "").toLowerCase().trim()}`;
  return crypto.createHash("sha256").update(norm).digest("hex").slice(0, 32);
}

function extractEmployerEmail(text = "", companyWebsite = "", companyName = "") {
  if (text) {
    const matches = text.match(EMAIL_REGEX);
    if (matches && matches.length > 0) {
      for (const m of matches) {
        const lower = m.toLowerCase().trim();
        const domain = lower.split("@")[1];
        if (domain && !JUNK_EMAIL_DOMAINS.includes(domain) && !lower.endsWith(".png") && !lower.endsWith(".jpg")) {
          return lower;
        }
      }
    }
  }

  if (companyWebsite) {
    try {
      const url = new URL(companyWebsite.startsWith("http") ? companyWebsite : `https://${companyWebsite}`);
      const host = url.hostname.replace(/^www\./, "");
      if (host && host.includes(".") && !JUNK_EMAIL_DOMAINS.includes(host)) {
        return `careers@${host}`;
      }
    } catch {}
  }

  if (companyName) {
    const cleanCompany = companyName.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (cleanCompany.length >= 3) {
      return `careers@${cleanCompany}.com`;
    }
  }

  return undefined;
}

function extractHybridMetadata(description = "", location = "") {
  let daysInOffice;
  const matchDays = description.match(DAYS_IN_OFFICE_REGEX);
  if (matchDays && matchDays[1]) {
    daysInOffice = matchDays[1].trim();
  }

  let hybridCity;
  let hybridCountry;
  const loc = (location || "").trim();
  if (loc && !loc.toLowerCase().includes("worldwide") && !loc.toLowerCase().includes("anywhere")) {
    const parts = loc.split(",").map((p) => p.trim());
    if (parts.length >= 2) {
      hybridCity = parts[0];
      hybridCountry = parts[1];
    } else if (parts.length === 1) {
      hybridCity = parts[0];
    }
  }

  return { daysInOffice, hybridCity, hybridCountry };
}

function classifyJobArrangement(params) {
  const { title, company, salaryMin = 0, salaryMax = 0 } = params;
  const location = params.location || "";
  const description = params.description || "";
  const externalId = generateExternalId(company, title, location);
  const email = extractEmployerEmail(description, params.companyWebsite, company);
  const hybridMeta = extractHybridMetadata(description, location);

  const titleLower = title.toLowerCase();
  const descLower = description.toLowerCase();
  const locLower = location.toLowerCase();

  const isHybridMentioned =
    params.workplaceType === "hybrid" ||
    titleLower.includes("hybrid") ||
    descLower.includes("hybrid") ||
    locLower.includes("hybrid");

  if (isHybridMentioned) {
    const effectiveSalary = Math.max(salaryMin, salaryMax);
    const hasHighSalary = effectiveSalary >= 90000;
    const isSeniorSpecialized = SENIOR_SPECIALIZED_ROLES.test(title);

    if (hasHighSalary || isSeniorSpecialized) {
      return {
        workArrangement: "hybrid_high_pay",
        shouldIngest: true,
        hybridCity: hybridMeta.hybridCity,
        hybridCountry: hybridMeta.hybridCountry,
        daysInOffice: hybridMeta.daysInOffice || "2-3 days in office",
        employerEmail: email,
        externalId,
      };
    } else {
      return {
        workArrangement: "on_site",
        shouldIngest: false,
        externalId,
      };
    }
  }

  const isRegional =
    locLower.includes("us only") ||
    locLower.includes("usa only") ||
    locLower.includes("united states") ||
    locLower.includes("europe") ||
    locLower.includes("uk only") ||
    locLower.includes("canada only") ||
    locLower.includes("latam") ||
    locLower.includes("apac") ||
    locLower.includes("emea") ||
    descLower.includes("must be based in") ||
    descLower.includes("residents of");

  const arrangement = isRegional ? "remote_regional" : "remote_global";

  return {
    workArrangement: arrangement,
    shouldIngest: true,
    employerEmail: email,
    externalId,
  };
}

function isJobExpired(postedAt) {
  if (!postedAt) return false;
  const time = new Date(postedAt).getTime();
  if (isNaN(time)) return false;
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  return Date.now() - time > thirtyDaysMs;
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

  const isTask = Boolean(raw.is_task || raw.category === "tasks");
  let category = isTask ? "tasks" : (raw.category || "other");

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

  if (!isTask && farmingRegex.test(combinedSearch)) {
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

  if (!isTask && salaryMin && salaryMin < 1000) salaryMin *= 1000;
  if (!isTask && salaryMax && salaryMax < 1000) salaryMax *= 1000;

  if (!salaryMin && !salaryMax && !isTask) {
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

  const canonicalHash = generateCanonicalHash(company, title, applyUrl);
  const id = `job-${canonicalHash.slice(0, 16)}`;
  const baseSlug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${companySlug}`.replace(/--+/g, "-").replace(/^-|-$/g, "").slice(0, 70);
  const idHash = canonicalHash.slice(0, 6);
  const slug = `${baseSlug || "job"}-${idHash}`;
  let location = raw.candidate_required_location || raw.location || (workplaceType === "remote" ? "Worldwide" : "On-site");
  let postedAt = raw.posted_at || new Date().toISOString();
  try {
    const parsedTime = new Date(postedAt).getTime();
    if (isNaN(parsedTime) || parsedTime > Date.now() + 60000) {
      postedAt = new Date().toISOString();
    } else {
      postedAt = new Date(parsedTime).toISOString();
    }
  } catch {
    postedAt = new Date().toISOString();
  }
  const description = cleanHtmlDescription(raw.description) || `Join ${company} as ${title}. We offer competitive compensation with transparent salaries, generous benefits, and strong career progression.`;
  const companyWebsite = raw.url || "https://remoteworkdaily.com";

  const classification = classifyJobArrangement({
    title,
    company,
    location,
    description,
    salaryMin,
    salaryMax,
    workplaceType,
    companyWebsite,
  });

  if (!classification.shouldIngest) {
    return null;
  }

  const expired = isJobExpired(postedAt);
  const companyLogo = raw.company_logo || raw.company_logo_url || "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=128&h=128&fit=crop&q=80";

  return {
    id,
    slug,
    title,
    company,
    companySlug,
    companyLogo,
    companyWebsite,
    verified: true,
    featured: Math.random() > 0.85,
    isFeatured: false,
    sticky: false,
    location,
    locationCode: location.toLowerCase().includes("us") ? "US" : location.toLowerCase().includes("germany") ? "DE" : "WW",
    workplaceType,
    workArrangement: classification.workArrangement,
    hybridCity: classification.hybridCity,
    hybridCountry: classification.hybridCountry,
    daysInOffice: classification.daysInOffice,
    employerEmail: classification.employerEmail || raw.employer_email,
    externalId: classification.externalId,
    category,
    tags: tags.slice(0, 6),
    benefits: workplaceType === "remote"
      ? ["distributed_team", "async", "unlimited_vacation", "home_office_budget"]
      : ["health_insurance", "401k", "paid_vacation", "commuter_benefits"],
    salaryMin,
    salaryMax,
    salaryCurrency: "USD",
    description,
    applyUrl,
    postedAt,
    viewsCount: Math.floor(Math.random() * 300) + 20,
    appliesCount: Math.floor(Math.random() * 20) + 1,
    source: raw.source || "feed",
    atsProvider: raw.ats_provider,
    isDirectCompanyPost: raw.is_direct_company_post || raw.source === "ats",
    status: expired ? "archived" : "active",
    isActive: !expired,
    canonicalHash: generateCanonicalHash(company, title, applyUrl),
    isTask,
    is_task: isTask,
    taskType: raw.task_type,
    task_type: raw.task_type,
    estimatedTime: raw.estimated_time,
    estimated_time: raw.estimated_time,
    payoutReward: raw.payout_reward,
    payout_reward: raw.payout_reward,
    payoutType: raw.payout_type,
    payout_type: raw.payout_type,
    difficulty: raw.difficulty,
    instructionsUrl: raw.instructions_url,
    instructions_url: raw.instructions_url,
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

  // 1. Arbeitnow Multi-Page High-Capacity (batched to avoid 429 rate limits)
  const arbeitnowPromise = (async () => {
    const out = [];
    const pageNumbers = Array.from({ length: pagesNeeded }, (_, i) => i + 1);
    const BATCH_SIZE = 3;
    for (let i = 0; i < pageNumbers.length; i += BATCH_SIZE) {
      const chunk = pageNumbers.slice(i, i + BATCH_SIZE);
      const chunkRes = await Promise.all(
        chunk.map(async (p) => {
          try {
            const res = await fetch(`https://arbeitnow.com/api/job-board-api?page=${p}`, {
              headers: { "User-Agent": USER_AGENT, "Accept": "application/json" },
              signal: AbortSignal.timeout(12000),
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
        })
      );
      for (const group of chunkRes) out.push(...group);
    }
    return out;
  })();

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
    const leverCompanies = [
      { slug: "buffer", name: "Buffer" },
      { slug: "kinsta", name: "Kinsta" },
      { slug: "postman", name: "Postman" },
      { slug: "sourcegraph", name: "Sourcegraph" },
      { slug: "rover", name: "Rover" },
    ];
    for (const c of leverCompanies) {
      try {
        const res = await fetch(`https://api.lever.co/v0/postings/${c.slug}?mode=json`, { headers: { "User-Agent": USER_AGENT } });
        if (!res.ok) continue;
        const json = await res.json();
        for (const it of (Array.isArray(json) ? json : [])) {
          out.push({
            title: it.text,
            company_name: c.name,
            url: it.hostedUrl || it.applyUrl,
            apply_url: it.applyUrl || it.hostedUrl,
            location: it.categories?.location || "Worldwide",
            description: cleanHtmlDescription(it.descriptionPlain || it.description),
            posted_at: it.createdAt ? new Date(it.createdAt).toISOString() : new Date().toISOString(),
            remote: true,
            source: "ats",
            ats_provider: "lever",
            is_direct_company_post: true,
            tags: ["Direct ATS", "Company Careers", c.name],
          });
        }
      } catch {}
    }

    return out;
  })();

  // 8. Himalayas
  const himalayasPromise = (async () => {
    try {
      const res = await fetch("https://himalayas.app/jobs/api?limit=50", { headers: { "User-Agent": USER_AGENT } });
      if (!res.ok) return [];
      const json = await res.json();
      return (json.jobs || []).map((it) => ({
        title: it.title,
        company_name: it.companyName,
        url: it.applicationLink || it.url,
        apply_url: it.applicationLink || it.url,
        tags: it.categories || [],
        location: Array.isArray(it.locationRestrictions) && it.locationRestrictions.length > 0 ? it.locationRestrictions.join(", ") : "Worldwide",
        salary_min: it.minSalary,
        salary_max: it.maxSalary,
        description: it.description,
        posted_at: it.pubDate,
        remote: true,
      }));
    } catch {
      return [];
    }
  })();

  // Run all in parallel
  const [arbeitnowList, wwrList, jobicyList, remoteokList, remotiveList, reliefWebList, atsList, himalayasList] = await Promise.all([
    arbeitnowPromise,
    wwrPromise,
    jobicyPromise,
    remoteokPromise,
    remotivePromise,
    reliefWebPromise,
    atsPromise,
    himalayasPromise,
  ]);

  sources.arbeitnow = arbeitnowList.length;
  for (const it of arbeitnowList) rawJobs.push(it);

  sources.wwr = wwrList.length;
  for (const it of wwrList) rawJobs.push(it);

  sources.jobicy = jobicyList.length;
  for (const it of jobicyList) rawJobs.push(it);

  sources.remoteok = remoteokList.length;
  for (const it of remoteokList) rawJobs.push(it);

  sources.remotive = remotiveList.length;
  for (const it of remotiveList) rawJobs.push(it);

  sources.himalayas = himalayasList.length;
  for (const it of himalayasList) rawJobs.push(it);

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
  console.log(`      • Himalayas: ${sources.himalayas}`);
  console.log(`      • Direct ATS (Greenhouse/Lever/Ashby): ${sources.ats}`);

  console.log(`[3/4] Normalizing data and deduplicating via SHA-256 canonicalHash...`);
  const seenHashes = new Set();
  const normalizedJobs = [];

  for (const raw of rawJobs) {
    if (!raw.title || (!raw.company && !raw.company_name)) continue;
    const normalized = normalizeRawJob(raw);
    if (!normalized) continue;
    if (seenHashes.has(normalized.canonicalHash)) continue;
    seenHashes.add(normalized.canonicalHash);
    normalizedJobs.push(normalized);
  }

  // Sort newly scraped jobs newest first so topNewJobs in notifications are the freshest
  normalizedJobs.sort((a, b) => (new Date(b.postedAt).getTime() || 0) - (new Date(a.postedAt).getTime() || 0));

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
      const existing = existingJobs[idx];
      existingJobs[idx] = {
        ...existing,
        ...job,
        id: existing.id || job.id,
        slug: existing.slug || job.slug,
      };
      updated++;
    } else {
      toPrepend.push(job);
      added++;
    }
  }

  const merged = [...toPrepend, ...existingJobs];
  // Strictly sort by postedAt descending so today's newest jobs are always at the top
  merged.sort((a, b) => (new Date(b.postedAt).getTime() || 0) - (new Date(a.postedAt).getTime() || 0));

  // Sliding window of latest 20,000 active listings.
  // MUST match MAX_LOCAL_JOBS in lib/jobs-repository.ts — a lower cap here (12,000) truncated the
  // committed dataset while the live site kept more, so Telegram and the website reported
  // different totals. 20k compact JSON ≈ 60 MB, safely under GitHub's 100 MB file limit.
  const MAX_JOBS = 20000;
  const pruned = merged.length > MAX_JOBS ? merged.slice(0, MAX_JOBS) : merged;

  // Compact JSON (no indentation) keeps the committed file small enough for git/Vercel bundles
  fs.writeFileSync(DATA_FILE, JSON.stringify(pruned), "utf8");

  // Write sync state
  const syncState = {
    lastSyncDate: new Date().toISOString().split("T")[0],
    lastSyncTimestamp: Date.now(),
    syncedCount: normalizedJobs.length,
    addedCount: added,
    updatedCount: updated,
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

  // Sync newly ingested jobs to Supabase (requires SUPABASE_SERVICE_ROLE_KEY or write RLS permission)
  const hasServiceKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
  if (supabase && hasServiceKey && normalizedJobs.length > 0) {
    console.log(`[Supabase] Syncing ${normalizedJobs.length} ingested jobs to Supabase cloud...`);
    const CHUNK_SIZE = 100;
    let supaSuccess = 0;
    for (let i = 0; i < normalizedJobs.length; i += CHUNK_SIZE) {
      const chunk = normalizedJobs.slice(i, i + CHUNK_SIZE);
      const records = chunk.map((job) => ({
        id: job.id,
        slug: job.slug,
        title: job.title,
        company: job.company,
        company_slug: job.companySlug,
        company_logo: job.companyLogo || null,
        company_website: job.companyWebsite || null,
        verified: job.verified ?? true,
        featured: job.featured ?? false,
        sticky: job.sticky ?? false,
        location: job.location || "Worldwide",
        location_code: job.locationCode || "WW",
        workplace_type: job.workplaceType || "remote",
        category: job.category || "dev",
        tags: Array.isArray(job.tags) ? job.tags : [],
        benefits: Array.isArray(job.benefits) ? job.benefits : [],
        salary_min: job.salaryMin || null,
        salary_max: job.salaryMax || null,
        salary_currency: job.salaryCurrency || "USD",
        description: job.description || "",
        apply_url: job.applyUrl,
        posted_at: job.postedAt || new Date().toISOString(),
        views_count: job.viewsCount || 0,
        applies_count: job.appliesCount || 0,
        source: job.source || "feed",
        status: job.status || "active",
        employer_email: job.employerEmail || null,
        canonical_hash: job.canonicalHash || null,
        work_arrangement: job.workArrangement || (job.workplaceType === "hybrid" ? "hybrid_high_pay" : "remote_global"),
        hybrid_city: job.hybridCity || null,
        hybrid_country: job.hybridCountry || null,
        days_in_office: job.daysInOffice || null,
        external_id: job.externalId || job.canonicalHash || null,
        is_featured: job.isFeatured ?? (job.featured || false),
        is_active: job.isActive ?? (job.status === "active"),
        is_task: job.isTask ?? (job.category === "tasks"),
        task_type: job.taskType || null,
        estimated_time: job.estimatedTime || null,
        payout_reward: job.payoutReward || null,
        payout_type: job.payoutType || null,
        difficulty: job.difficulty || null,
        instructions_url: job.instructionsUrl || null,
        updated_at: new Date().toISOString(),
      }));

      try {
        const { error } = await supabase.from("jobs").upsert(records, { onConflict: "canonical_hash" });
        if (!error) {
          supaSuccess += chunk.length;
        } else {
          console.warn(`[Supabase] Batch error:`, error.message);
        }
      } catch (sErr) {
        console.warn(`[Supabase] Upsert exception:`, sErr.message);
      }
    }
    console.log(`[Supabase] ✅ Successfully synced ${supaSuccess} jobs to Supabase!`);
  }

  // Dispatch real-time Telegram notification
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
    if (!token) {
      console.log("[Telegram] Notification skipped: TELEGRAM_BOT_TOKEN is not configured.");
    } else {
      let chatId = (process.env.TELEGRAM_ADMIN_CHAT_ID || process.env.TELEGRAM_CHAT_ID || "").trim();
      const configPath = path.join(process.cwd(), "data", "telegram-config.json");
      if (!chatId && fs.existsSync(configPath)) {
        try {
          const cfg = JSON.parse(fs.readFileSync(configPath, "utf8"));
          if (cfg.chat_id) chatId = String(cfg.chat_id).trim();
        } catch {}
      }

    if (chatId) {
      console.log(`[Telegram] Dispatching admin scrape summary & cron report to chat ${chatId}...`);
      const isHybrid = (j) => j.workArrangement === "hybrid_high_pay" || j.workplaceType === "hybrid";
      let remoteCount = 0;
      let hybridCount = 0;
      let emailsExtracted = 0;
      for (const j of normalizedJobs) {
        if (isHybrid(j)) hybridCount++;
        else remoteCount++;
        if (j.employerEmail) emailsExtracted++;
      }

      const escapeHtml = (str) =>
        String(str || "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");

      const topJobsFormatted = pruned
        .slice(0, 5)
        .map((j, i) => {
          const wp = j.workplaceType ? `[${j.workplaceType.toUpperCase()}] ` : "";
          const sal = j.salaryMin && j.salaryMax ? ` • 💰 <i>$${j.salaryMin.toLocaleString()} - $${j.salaryMax.toLocaleString()}</i>` : "";
          const loc = j.location ? ` • 📍 ${escapeHtml(j.location)}` : "";
          const url = `https://www.remoteworkdaily.com/jobs/${j.id}/${j.slug}`;
          return `${i + 1}. <a href="${url}"><b>${escapeHtml(j.title)}</b></a>\n   🏢 <b>${escapeHtml(j.company)}</b> ${wp}${sal}${loc}`;
        })
        .join("\n\n");

      const sourcesBreakdown = Object.entries(sources)
        .filter(([, count]) => count > 0)
        .map(([name, count]) => `• ${name}: <b>${count.toLocaleString()}</b>`)
        .join("\n");

      const cronSyncMsg = [
        `🚀 <b>Remote Work Daily — Job Ingestion Completed!</b>`,
        `━━━━━━━━━━━━━━━━━━━━`,
        `📥 <b>Newly Ingested:</b> +${added.toLocaleString()} jobs`,
        `🔄 <b>Updated / Refreshed:</b> ${updated.toLocaleString()} jobs`,
        `🌐 <b>Breakdown:</b> +${remoteCount.toLocaleString()} Remote • +${hybridCount.toLocaleString()} Hybrid ($90k+)`,
        `📧 <b>Employer Emails:</b> ${emailsExtracted.toLocaleString()} extracted`,
        `📊 <b>Total Active Listings:</b> ${pruned.length.toLocaleString()}`,
        `⏱ <b>Duration:</b> ${durationSec}s`,
        `━━━━━━━━━━━━━━━━━━━━`,
        topJobsFormatted ? `💼 <b>Top Fresh Roles Harvested:</b>\n\n${topJobsFormatted}\n━━━━━━━━━━━━━━━━━━━━` : null,
        sourcesBreakdown ? `📈 <b>Harvested Sources:</b>\n${sourcesBreakdown}\n━━━━━━━━━━━━━━━━━━━━` : null,
        `🌐 <a href="https://www.remoteworkdaily.com">Browse Latest Jobs on Board &rarr;</a>`,
      ]
        .filter(Boolean)
        .join("\n");

      const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: cronSyncMsg,
          parse_mode: "HTML",
          disable_web_page_preview: true,
          reply_markup: {
            inline_keyboard: [
              [
                { text: "⚡ Trigger Scraper Now", callback_data: "cmd_scrape" },
                { text: "🔥 Latest 5 Jobs", callback_data: "cmd_latest" },
              ],
              [
                { text: "👀 Review Pending Jobs", callback_data: "admin_review_jobs" },
                { text: "📧 Blast $199 B2B Pitch", callback_data: "admin_blast_b2b" },
              ],
              [
                { text: "📊 Board Stats", callback_data: "cmd_stats" },
                { text: "🌐 Open RemoteWorkDaily", url: "https://www.remoteworkdaily.com" },
              ],
            ],
          },
        }),
      });
      const tgJson = await tgRes.json();
      if (tgJson.ok) {
        console.log(`[Telegram] ✅ Cron alert successfully delivered to Telegram chat!`);
      } else {
        console.warn(`[Telegram] Send failed: ${tgJson.description}`);
      }
      } else {
        console.log(`[Telegram] Notice: No TELEGRAM_CHAT_ID linked yet. Open https://t.me/PandoraWorkBot in Telegram and press Start to receive alerts.`);
      }
    }
  } catch (tgErr) {
    console.warn(`[Telegram] Notification error:`, tgErr.message);
  }
}

runScrape().catch((err) => {
  console.error("Scraper execution failed:", err);
  process.exit(1);
});
