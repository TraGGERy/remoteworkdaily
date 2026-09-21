import fs from "fs";
import path from "path";
import crypto from "crypto";

const DATA_FILE = path.join(process.cwd(), "data", "jobs.json");
const SYNC_STATE_FILE = path.join(process.cwd(), "data", "sync-state.json");

function generateCanonicalHash(company, title, applyUrl) {
  const normalized = `${(company || "").toLowerCase().trim()}:${(title || "").toLowerCase().trim()}:${(applyUrl || "").toLowerCase().trim()}`;
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

function inferCategory(title, tags) {
  const t = (title || "").toLowerCase();
  const tagList = (tags || []).map((x) => String(x).toLowerCase());
  if (t.includes("design") || tagList.includes("design") || t.includes("ux") || t.includes("ui")) return "design";
  if (t.includes("marketing") || tagList.includes("marketing") || t.includes("seo") || t.includes("growth")) return "marketing";
  if (t.includes("support") || tagList.includes("support") || t.includes("customer")) return "support";
  if (t.includes("sales") || t.includes("account executive") || t.includes("growth")) return "sales";
  if (t.includes("ops") || t.includes("devops") || t.includes("sre") || t.includes("cloud") || t.includes("security")) return "ops";
  if (t.includes("finance") || t.includes("accounting")) return "finance";
  if (t.includes("cto") || t.includes("vp") || t.includes("director") || t.includes("head of") || t.includes("lead")) return "exec";
  return "dev";
}

async function fetchRemotiveJobs() {
  try {
    const res = await fetch("https://remotive.com/api/remote-jobs?limit=50", {
      headers: { "User-Agent": "RemoteWorkDailyScraper/1.0" },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.jobs) ? data.jobs : [];
  } catch (err) {
    console.warn("Remotive fetch error:", err.message);
    return [];
  }
}

async function fetchArbeitnowJobs() {
  try {
    const res = await fetch("https://arbeitnow.com/api/job-board-api", {
      headers: { "User-Agent": "RemoteWorkDailyScraper/1.0" },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.data) ? data.data : [];
  } catch (err) {
    console.warn("Arbeitnow fetch error:", err.message);
    return [];
  }
}

async function main() {
  console.log("Fetching live remote jobs from active scraping feeds...");
  const [remotiveJobs, arbeitJobs] = await Promise.all([
    fetchRemotiveJobs(),
    fetchArbeitnowJobs(),
  ]);

  console.log(`Fetched ${remotiveJobs.length} jobs from Remotive and ${arbeitJobs.length} jobs from Arbeitnow.`);

  let existingJobs = [];
  if (fs.existsSync(DATA_FILE)) {
    try {
      existingJobs = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    } catch {
      existingJobs = [];
    }
  }

  const existingHashes = new Set(existingJobs.map((j) => j.canonicalHash).filter(Boolean));
  const newJobs = [];

  for (const item of remotiveJobs) {
    const title = item.title || "Remote Specialist";
    const company = item.company_name || "Remote Company";
    const companySlug = company.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const applyUrl = item.url || "https://remoteworkdaily.com";
    const hash = generateCanonicalHash(company, title, applyUrl);

    if (existingHashes.has(hash)) continue;
    existingHashes.add(hash);

    const tags = Array.isArray(item.tags) ? item.tags.slice(0, 6) : ["Remote", "Tech"];
    if (!tags.includes("Remote")) tags.unshift("Remote");
    const category = inferCategory(title, tags);

    // Realistic #OpenSalaries calculation
    let salaryMin = 130000;
    let salaryMax = 180000;
    if (item.salary) {
      const nums = item.salary.match(/\d+[\d,]*/g);
      if (nums && nums.length >= 2) {
        salaryMin = parseInt(nums[0].replace(/,/g, ""), 10);
        salaryMax = parseInt(nums[1].replace(/,/g, ""), 10);
      }
    } else {
      if (category === "dev") { salaryMin = 140000; salaryMax = 195000; }
      else if (category === "design") { salaryMin = 120000; salaryMax = 165000; }
      else if (category === "marketing") { salaryMin = 105000; salaryMax = 150000; }
      else if (category === "exec") { salaryMin = 180000; salaryMax = 260000; }
    }

    if (salaryMin < 1000) salaryMin *= 1000;
    if (salaryMax < 1000) salaryMax *= 1000;

    const job = {
      id: `job-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      slug: `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${companySlug}`.replace(/--+/g, "-").slice(0, 80),
      title,
      company,
      companySlug,
      companyLogo: item.company_logo_url || "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=128&h=128&fit=crop&q=80",
      companyWebsite: item.url || "https://remoteworkdaily.com",
      verified: true,
      featured: Math.random() > 0.8,
      sticky: false,
      location: item.candidate_required_location || "Worldwide",
      locationCode: (item.candidate_required_location || "").toLowerCase().includes("us") ? "US" : "Worldwide",
      workplaceType: "remote",
      category,
      tags,
      benefits: ["distributed_team", "async", "unlimited_vacation", "home_office_budget"],
      salaryMin,
      salaryMax,
      salaryCurrency: "USD",
      description: item.description || `Join ${company} as a remote ${title}. Transparent compensation with #OpenSalaries, asynchronous communication, and flexible hours.`,
      applyUrl,
      postedAt: item.publication_date || new Date().toISOString(),
      viewsCount: Math.floor(Math.random() * 300) + 20,
      appliesCount: Math.floor(Math.random() * 20) + 1,
      source: "apify",
      status: "active",
      canonicalHash: hash,
    };

    newJobs.push(job);
  }

  // Process Arbeitnow jobs (both on-site, hybrid, and remote)
  for (const item of arbeitJobs.slice(0, 50)) {
    const title = item.title || "Specialist";
    const company = item.company_name || "Enterprise Partner";
    const companySlug = company.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const applyUrl = item.url || "https://remoteworkdaily.com";
    const hash = generateCanonicalHash(company, title, applyUrl);

    if (existingHashes.has(hash)) continue;
    existingHashes.add(hash);

    const isRemote = Boolean(item.remote);
    const titleLower = title.toLowerCase();
    const descLower = (item.description || "").toLowerCase();
    let workplaceType = "remote";
    if (!isRemote) {
      if (titleLower.includes("hybrid") || descLower.includes("hybrid")) {
        workplaceType = "hybrid";
      } else {
        workplaceType = "on-site";
      }
    } else {
      workplaceType = "remote";
    }

    const workplaceTag = workplaceType === "on-site" ? "On-site" : workplaceType === "hybrid" ? "Hybrid" : "Remote";
    const tags = Array.isArray(item.tags) ? item.tags.slice(0, 5) : ["Engineering"];
    if (!tags.includes(workplaceTag)) tags.unshift(workplaceTag);

    const category = inferCategory(title, tags);
    const location = item.location || (isRemote ? "Worldwide" : "In-Person / On-site");

    let salaryMin = 115000;
    let salaryMax = 165000;
    if (category === "dev") { salaryMin = 135000; salaryMax = 185000; }
    else if (category === "exec") { salaryMin = 175000; salaryMax = 250000; }

    const job = {
      id: `job-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      slug: `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${companySlug}`.replace(/--+/g, "-").slice(0, 80),
      title,
      company,
      companySlug,
      companyLogo: "https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=128&h=128&fit=crop&q=80",
      companyWebsite: item.url || "https://remoteworkdaily.com",
      verified: true,
      featured: false,
      sticky: false,
      location,
      locationCode: location.toLowerCase().includes("us") ? "US" : location.toLowerCase().includes("germany") ? "DE" : "WW",
      workplaceType,
      category,
      tags,
      benefits: workplaceType === "remote"
        ? ["distributed_team", "async", "home_office_budget"]
        : ["health_insurance", "401k", "commuter_benefits", "paid_vacation"],
      salaryMin,
      salaryMax,
      salaryCurrency: "USD",
      description: item.description || `Join ${company} as ${title} (${workplaceType}). Location: ${location}.`,
      applyUrl,
      postedAt: item.created_at ? new Date(item.created_at * 1000).toISOString() : new Date().toISOString(),
      viewsCount: Math.floor(Math.random() * 200) + 10,
      appliesCount: Math.floor(Math.random() * 15) + 1,
      source: "apify",
      status: "active",
      canonicalHash: hash,
    };

    newJobs.push(job);
  }

  // Ensure all existing jobs have workplaceType
  const updatedExisting = existingJobs.map((j) => {
    if (!j.workplaceType) {
      const loc = (j.location || "").toLowerCase();
      if (loc.includes("worldwide") || loc.includes("anywhere") || loc.includes("remote")) {
        return { ...j, workplaceType: "remote" };
      }
      return { ...j, workplaceType: "remote" };
    }
    return j;
  });

  console.log(`Added ${newJobs.length} new unique scraped jobs.`);
  const allJobs = [...newJobs, ...updatedExisting];
  fs.writeFileSync(DATA_FILE, JSON.stringify(allJobs, null, 2), "utf-8");

  // Record daily sync
  const today = new Date().toISOString().split("T")[0];
  const syncState = {
    lastSyncDate: today,
    lastSyncTimestamp: Date.now(),
    syncedCount: newJobs.length,
    source: "seed-multi-workplace-scraper",
  };
  fs.writeFileSync(SYNC_STATE_FILE, JSON.stringify(syncState, null, 2), "utf-8");

  console.log(`Successfully updated ${DATA_FILE}. Total jobs on site: ${allJobs.length}`);
}

main().catch(console.error);
