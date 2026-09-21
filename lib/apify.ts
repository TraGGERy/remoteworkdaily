import { ApifyClient } from "apify-client";
import { Job } from "./types";
import { insertJob } from "./jobs-repository";
import { recordSyncCompleted } from "./sync-tracker";
import crypto from "crypto";

const APIFY_TOKEN = process.env.APIFY_TOKEN;

export function getApifyClient(): ApifyClient | null {
  if (!APIFY_TOKEN) {
    return null;
  }
  return new ApifyClient({ token: APIFY_TOKEN });
}

export function generateCanonicalHash(company: string, title: string, applyUrl: string): string {
  const normalized = `${company.toLowerCase().trim()}:${title.toLowerCase().trim()}:${applyUrl.toLowerCase().trim()}`;
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

export interface RawScrapedJob {
  title?: string;
  position?: string;
  company?: string;
  company_name?: string;
  company_logo?: string;
  company_logo_url?: string;
  location?: string;
  candidate_required_location?: string;
  description?: string;
  tags?: string[] | string;
  salary?: string;
  salary_min?: number;
  salary_max?: number;
  url?: string;
  apply_url?: string;
  posted_at?: string;
  publication_date?: string;
  remote?: boolean;
  workplace_type?: "remote" | "hybrid" | "on-site";
}

export function normalizeScrapedJob(raw: RawScrapedJob): Job {
  const title = raw.title || raw.position || "Professional Specialist";
  const company = raw.company || raw.company_name || "Hiring Company";
  const companySlug = company.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const applyUrl = raw.apply_url || raw.url || "https://remoteworkdaily.com";

  // Parse tags
  let tags: string[] = [];
  if (Array.isArray(raw.tags)) {
    tags = raw.tags.map((t) => String(t).trim()).filter(Boolean);
  } else if (typeof raw.tags === "string") {
    tags = raw.tags.split(",").map((t) => t.trim()).filter(Boolean);
  }

  // Determine workplace type (remote, hybrid, on-site)
  const titleLower = title.toLowerCase();
  const descLower = (raw.description || "").toLowerCase();
  const locLower = (raw.candidate_required_location || raw.location || "").toLowerCase();
  const tagsLower = tags.map((t) => t.toLowerCase());

  let workplaceType: "remote" | "hybrid" | "on-site" = "remote";
  if (raw.workplace_type) {
    workplaceType = raw.workplace_type;
  } else if (raw.remote === false) {
    if (titleLower.includes("hybrid") || descLower.includes("hybrid") || tagsLower.includes("hybrid")) {
      workplaceType = "hybrid";
    } else {
      workplaceType = "on-site";
    }
  } else if (raw.remote === true) {
    workplaceType = "remote";
  } else {
    // Infer from location/title text
    if (titleLower.includes("hybrid") || locLower.includes("hybrid") || tagsLower.includes("hybrid")) {
      workplaceType = "hybrid";
    } else if (
      locLower.includes("on-site") ||
      locLower.includes("onsite") ||
      locLower.includes("in-person") ||
      locLower.includes("in office") ||
      tagsLower.includes("on-site") ||
      tagsLower.includes("onsite")
    ) {
      workplaceType = "on-site";
    } else if (
      locLower.includes("remote") ||
      locLower.includes("worldwide") ||
      locLower.includes("anywhere")
    ) {
      workplaceType = "remote";
    } else if (raw.location && !locLower.includes("remote")) {
      workplaceType = "on-site";
    } else {
      workplaceType = "remote";
    }
  }

  // Prepend workplace badge tag
  const workplaceTag = workplaceType === "on-site" ? "On-site" : workplaceType === "hybrid" ? "Hybrid" : "Remote";
  if (!tags.some((t) => t.toLowerCase() === workplaceTag.toLowerCase())) {
    tags.unshift(workplaceTag);
  }

  // Infer Category
  let category: Job["category"] = "dev";
  if (titleLower.includes("design") || tagsLower.includes("design") || titleLower.includes("ux") || titleLower.includes("ui")) {
    category = "design";
  } else if (titleLower.includes("marketing") || tagsLower.includes("marketing") || titleLower.includes("seo") || titleLower.includes("growth")) {
    category = "marketing";
  } else if (titleLower.includes("support") || tagsLower.includes("support") || titleLower.includes("customer success")) {
    category = "support";
  } else if (titleLower.includes("sales") || titleLower.includes("account executive") || titleLower.includes("business development") || titleLower.includes("buyer")) {
    category = "sales";
  } else if (titleLower.includes("ops") || titleLower.includes("devops") || titleLower.includes("sre") || titleLower.includes("cloud") || titleLower.includes("sysadmin")) {
    category = "ops";
  } else if (titleLower.includes("finance") || titleLower.includes("accounting") || titleLower.includes("payroll")) {
    category = "finance";
  } else if (titleLower.includes("cto") || titleLower.includes("vp") || titleLower.includes("head of") || titleLower.includes("director") || titleLower.includes("executive")) {
    category = "exec";
  }

  // Parse salary
  let salaryMin = raw.salary_min;
  let salaryMax = raw.salary_max;
  if (!salaryMin && !salaryMax && raw.salary) {
    const numbers = raw.salary.match(/\d+[\d,]*/g);
    if (numbers && numbers.length >= 2) {
      salaryMin = parseInt(numbers[0].replace(/,/g, ""), 10);
      salaryMax = parseInt(numbers[1].replace(/,/g, ""), 10);
    } else if (numbers && numbers.length === 1) {
      salaryMin = parseInt(numbers[0].replace(/,/g, ""), 10);
    }
  }

  // Normalize salary numbers written in shorthand thousands (e.g. 150 -> 150000)
  if (salaryMin && salaryMin < 1000) salaryMin = salaryMin * 1000;
  if (salaryMax && salaryMax < 1000) salaryMax = salaryMax * 1000;

  // Default realistic salary range for #OpenSalaries standard
  if (!salaryMin && !salaryMax) {
    if (category === "dev") {
      salaryMin = 135000;
      salaryMax = 185000;
    } else if (category === "design") {
      salaryMin = 115000;
      salaryMax = 160000;
    } else if (category === "marketing") {
      salaryMin = 100000;
      salaryMax = 145000;
    } else if (category === "exec") {
      salaryMin = 180000;
      salaryMax = 275000;
    } else {
      salaryMin = 90000;
      salaryMax = 130000;
    }
  }

  const id = `job-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${companySlug}`.replace(/--+/g, "-").slice(0, 80);
  let location = raw.candidate_required_location || raw.location || (workplaceType === "remote" ? "Worldwide" : "On-site");
  if (workplaceType === "on-site" && (!location || location.toLowerCase() === "worldwide")) {
    location = "In-Person / On-site";
  }
  const postedAt = raw.posted_at || raw.publication_date || new Date().toISOString();
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
    featured: Math.random() > 0.75,
    sticky: false,
    location,
    locationCode: location.toLowerCase().includes("us") ? "US" : location.toLowerCase().includes("germany") || location.toLowerCase().includes("berlin") ? "DE" : "WW",
    workplaceType,
    category,
    tags: tags.slice(0, 6),
    benefits: workplaceType === "remote" 
      ? ["distributed_team", "async", "unlimited_vacation", "home_office_budget"]
      : ["health_insurance", "401k", "paid_vacation", "commuter_benefits"],
    salaryMin,
    salaryMax,
    salaryCurrency: "USD",
    description: raw.description || `Join ${company} as ${title} (${workplaceType}). We offer competitive compensation with #OpenSalaries, generous benefits, and strong career progression.`,
    applyUrl,
    postedAt,
    viewsCount: Math.floor(Math.random() * 400) + 15,
    appliesCount: Math.floor(Math.random() * 25) + 1,
    source: "apify",
    status: "active",
    canonicalHash: generateCanonicalHash(company, title, applyUrl),
  };
}

/**
 * Executes the daily job scraping pipeline.
 *
 * 1. Checks Apify Client if APIFY_TOKEN is configured.
 * 2. In fallback/resilient mode: Fetches real live remote jobs (Remotive) AND on-site/hybrid jobs (Arbeitnow).
 * 3. Prioritizes the latest jobs, normalizes to #OpenSalaries standard with workplaceType (remote, on-site, hybrid).
 * 4. Persists jobs to PostgreSQL (Supabase) and local store.
 * 5. Records completion timestamp to enforce the strictly once-per-day rule.
 */
export async function runApifyJobSync(
  actorId: string = "apify/web-scraper",
  inputConfig?: Record<string, unknown>
): Promise<{ synced: number; source: string }> {
  const client = getApifyClient();

  if (client) {
    try {
      console.log(`Starting Apify Actor run for actor: ${actorId}`);
      const run = await client.actor(actorId).call(inputConfig || {
        startUrls: [{ url: "https://remoteok.com/api" }],
        maxRequestsPerCrawl: 30,
      });

      const { items } = await client.dataset(run.defaultDatasetId).listItems();
      let count = 0;
      for (const raw of items as unknown as RawScrapedJob[]) {
        if (raw.title || raw.position) {
          const normalized = normalizeScrapedJob(raw);
          insertJob(normalized);
          count++;
        }
      }

      if (count > 0) {
        await recordSyncCompleted(count, "apify-cloud");
        return { synced: count, source: "apify-cloud" };
      }
    } catch (err) {
      console.error("Apify Actor encountered error or rate-limit, falling back to direct live feed:", err);
    }
  }

  // Resilient live scraper fallback: Fetch both remote AND non-remote (on-site / hybrid) jobs
  let syncedCount = 0;

  // 1. Fetch Remote jobs from Remotive
  try {
    const remotiveRes = await fetch("https://remotive.com/api/remote-jobs?limit=30", {
      headers: { "User-Agent": "RemoteWorkDailyScraper/1.0" },
      next: { revalidate: 0 },
    });

    if (remotiveRes.ok) {
      const data = await remotiveRes.json();
      if (Array.isArray(data.jobs)) {
        for (const job of data.jobs) {
          const raw: RawScrapedJob = {
            title: job.title,
            company_name: job.company_name,
            company_logo_url: job.company_logo_url,
            url: job.url,
            tags: Array.isArray(job.tags) ? job.tags : [],
            candidate_required_location: job.candidate_required_location,
            salary: job.salary,
            description: job.description,
            publication_date: job.publication_date,
            remote: true,
          };
          const normalized = normalizeScrapedJob(raw);
          insertJob(normalized);
          syncedCount++;
        }
      }
    }
  } catch (err) {
    console.warn("Live Remotive feed fetch error:", err);
  }

  // 2. Fetch Latest Non-Remote (On-Site & Hybrid) and Regional jobs from Arbeitnow
  try {
    const arbeitRes = await fetch("https://arbeitnow.com/api/job-board-api", {
      headers: { "User-Agent": "RemoteWorkDailyScraper/1.0" },
      next: { revalidate: 0 },
    });

    if (arbeitRes.ok) {
      const data = await arbeitRes.json();
      if (Array.isArray(data.data)) {
        // Take up to 40 latest postings (both non-remote and hybrid/remote)
        for (const item of data.data.slice(0, 40)) {
          const raw: RawScrapedJob = {
            title: item.title,
            company_name: item.company_name,
            url: item.url,
            tags: Array.isArray(item.tags) ? item.tags : [],
            location: item.location || (item.remote ? "Worldwide" : "On-site"),
            description: item.description,
            posted_at: item.created_at ? new Date(item.created_at * 1000).toISOString() : undefined,
            remote: Boolean(item.remote),
          };
          const normalized = normalizeScrapedJob(raw);
          insertJob(normalized);
          syncedCount++;
        }
      }
    }
  } catch (err) {
    console.warn("Live Arbeitnow feed fetch error:", err);
  }

  await recordSyncCompleted(syncedCount, "live-multi-stream");
  return { synced: syncedCount, source: "live-multi-stream" };
}
