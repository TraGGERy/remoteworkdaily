import fs from "fs";
import path from "path";
import os from "os";
import { Job } from "./types";
import { INITIAL_JOBS } from "./sample-jobs";
import { getSupabaseClient, isSupabaseConfigured } from "./supabase";
export { filterJobs } from "./filter-jobs";

/**
 * Production Jobs Repository
 * 
 * Provides an abstracted data access layer for job listings.
 * - Primary persistence: PostgreSQL backed by Supabase when configured
 * - Local / CI fallback: File-backed JSON store in data/jobs.json & in-memory cache
 */

const DATA_FILE = path.join(process.cwd(), "data", "jobs.json");
const TMP_DATA_FILE = path.join(os.tmpdir(), "remotework-jobs.json");
let memoryCache: Job[] | null = null;
let lastCacheMtime: number = 0;
let lastCacheCheck: number = 0;

function ensureDataFile(forceReload: boolean = false): Job[] {
  const now = Date.now();
  // Fast path: memory cache is fresh and was verified within the last 15 seconds
  if (!forceReload && memoryCache && memoryCache.length > 0 && now - lastCacheCheck < 15000) {
    return memoryCache;
  }
  lastCacheCheck = now;

  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      try {
        fs.mkdirSync(dir, { recursive: true });
      } catch {
        // Read-only environment, fallback to INITIAL_JOBS
      }
    }

    // Determine whether to read from DATA_FILE or TMP_DATA_FILE
    // In serverless environments (Vercel/Lambda), DATA_FILE is read-only and
    // newly scraped jobs are saved to TMP_DATA_FILE.
    let targetPath = DATA_FILE;
    if (fs.existsSync(TMP_DATA_FILE)) {
      try {
        const tmpStat = fs.statSync(TMP_DATA_FILE);
        const mainStat = fs.existsSync(DATA_FILE) ? fs.statSync(DATA_FILE) : null;
        if (!mainStat || tmpStat.mtimeMs >= mainStat.mtimeMs) {
          targetPath = TMP_DATA_FILE;
        }
      } catch {
        targetPath = DATA_FILE;
      }
    }

    if (!fs.existsSync(targetPath)) {
      if (fs.existsSync(DATA_FILE)) {
        targetPath = DATA_FILE;
      } else {
        try {
          fs.writeFileSync(DATA_FILE, JSON.stringify(INITIAL_JOBS), "utf8");
        } catch {
          try {
            fs.writeFileSync(TMP_DATA_FILE, JSON.stringify(INITIAL_JOBS), "utf8");
          } catch {}
        }
        memoryCache = [...INITIAL_JOBS];
        return memoryCache;
      }
    }

    const stat = fs.statSync(targetPath);
    if (!forceReload && memoryCache && memoryCache.length > 0 && stat.mtimeMs === lastCacheMtime) {
      return memoryCache;
    }

    lastCacheMtime = stat.mtimeMs;
    const content = fs.readFileSync(targetPath, "utf8");
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed) && parsed.length > 0) {
      memoryCache = parsed;
      return memoryCache;
    }

    memoryCache = [...INITIAL_JOBS];
    return memoryCache;
  } catch {
    if (!memoryCache || memoryCache.length === 0) {
      memoryCache = [...INITIAL_JOBS];
    }
    return memoryCache;
  }
}

function saveJobs(jobs: Job[]) {
  // Always update in-memory cache immediately
  memoryCache = [...jobs];

  const payload = JSON.stringify(jobs);
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, payload, "utf8");
    lastCacheMtime = fs.statSync(DATA_FILE).mtimeMs;
  } catch {
    // Read-only filesystem fallback (e.g. AWS Lambda / Vercel Serverless)
    try {
      fs.writeFileSync(TMP_DATA_FILE, payload, "utf8");
      lastCacheMtime = fs.statSync(TMP_DATA_FILE).mtimeMs;
    } catch {
      // In-memory cache already updated
    }
  }
}

/**
 * Asynchronously persists or updates a job in Supabase if configured.
 */
async function syncJobToSupabase(job: Job) {
  if (!isSupabaseConfigured()) return;
  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    await supabase.from("jobs").upsert({
      id: job.id,
      slug: job.slug,
      title: job.title,
      company: job.company,
      company_slug: job.companySlug,
      company_logo: job.companyLogo ?? null,
      company_website: job.companyWebsite ?? null,
      verified: job.verified ?? true,
      featured: job.featured ?? false,
      sticky: job.sticky ?? false,
      location: job.location ?? "Worldwide",
      location_code: job.locationCode ?? "WW",
      workplace_type: job.workplaceType ?? "remote",
      category: job.category ?? "dev",
      tags: job.tags ?? [],
      benefits: job.benefits ?? [],
      salary_min: job.salaryMin ?? null,
      salary_max: job.salaryMax ?? null,
      salary_currency: job.salaryCurrency ?? "USD",
      description: job.description ?? "",
      apply_url: job.applyUrl,
      posted_at: job.postedAt ?? new Date().toISOString(),
      views_count: job.viewsCount ?? 0,
      applies_count: job.appliesCount ?? 0,
      source: job.source ?? "direct",
      status: job.status ?? "active",
      employer_email: job.employerEmail ?? null,
      canonical_hash: job.canonicalHash ?? null,
      work_arrangement: job.workArrangement ?? (job.workplaceType === "hybrid" ? "hybrid_high_pay" : "remote_global"),
      hybrid_city: job.hybridCity ?? null,
      hybrid_country: job.hybridCountry ?? null,
      days_in_office: job.daysInOffice ?? null,
      external_id: job.externalId ?? null,
      is_featured: job.isFeatured ?? job.featured ?? false,
      is_active: job.isActive ?? (job.status === "active"),
      updated_at: new Date().toISOString(),
    }, { onConflict: "id" });
  } catch (err) {
    console.error("[Supabase sync error]:", err);
  }
}

async function syncJobsBatchToSupabase(jobs: Job[]) {
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) return;
  const supabase = getSupabaseClient();
  if (!supabase) return;

  const CHUNK_SIZE = 250;
  for (let i = 0; i < jobs.length; i += CHUNK_SIZE) {
    const chunk = jobs.slice(i, i + CHUNK_SIZE);
    const records = chunk.map((job) => ({
      id: job.id,
      slug: job.slug,
      title: job.title,
      company: job.company,
      company_slug: job.companySlug,
      company_logo: job.companyLogo ?? null,
      company_website: job.companyWebsite ?? null,
      verified: job.verified ?? true,
      featured: job.featured ?? false,
      sticky: job.sticky ?? false,
      location: job.location ?? "Worldwide",
      location_code: job.locationCode ?? "WW",
      workplace_type: job.workplaceType ?? "remote",
      category: job.category ?? "dev",
      tags: job.tags ?? [],
      benefits: job.benefits ?? [],
      salary_min: job.salaryMin ?? null,
      salary_max: job.salaryMax ?? null,
      salary_currency: job.salaryCurrency ?? "USD",
      description: job.description ?? "",
      apply_url: job.applyUrl,
      posted_at: job.postedAt ?? new Date().toISOString(),
      views_count: job.viewsCount ?? 0,
      applies_count: job.appliesCount ?? 0,
      source: job.source ?? "direct",
      status: job.status ?? "active",
      employer_email: job.employerEmail ?? null,
      canonical_hash: job.canonicalHash ?? null,
      work_arrangement: job.workArrangement ?? (job.workplaceType === "hybrid" ? "hybrid_high_pay" : "remote_global"),
      hybrid_city: job.hybridCity ?? null,
      hybrid_country: job.hybridCountry ?? null,
      days_in_office: job.daysInOffice ?? null,
      external_id: job.externalId ?? null,
      is_featured: job.isFeatured ?? job.featured ?? false,
      is_active: job.isActive ?? (job.status === "active"),
      updated_at: new Date().toISOString(),
    }));

    try {
      await supabase.from("jobs").upsert(records, { onConflict: "canonical_hash" });
    } catch (err) {
      console.warn("[Supabase batch sync error]:", err);
    }
  }
}

let isBackgroundAutoSyncing = false;

/**
 * Triggers a non-blocking background ingestion sync if jobs are stale (>100 min or new day).
 * Ensures visitors always trigger fresh job harvesting in the background.
 */
export function triggerBackgroundSyncIfStale(): void {
  // In serverless environments (Vercel/Lambda), scheduled cron jobs handle ingestion.
  // Un-awaited background work gets frozen/severed when the HTTP response finishes.
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return;
  }
  if (isBackgroundAutoSyncing) return;
  // Dynamic import to prevent circular dependencies
  Promise.all([
    import("./sync-tracker"),
    import("./scrapers/orchestrator"),
  ])
    .then(([{ canSyncInterval }, { runDailyJobIngestionPipeline }]) => {
      const intervalCheck = canSyncInterval(false);
      if (intervalCheck.allowed && !isBackgroundAutoSyncing) {
        isBackgroundAutoSyncing = true;
        runDailyJobIngestionPipeline({ force: false, targetCount: 1500 })
          .catch((err: unknown) => {
            console.warn("[Jobs Repo] Auto-refresh on visit error:", err);
          })
          .finally(() => {
            isBackgroundAutoSyncing = false;
          });
      }
    })
    .catch(() => {
      // Non-blocking fallback
    });
}

export function getAllJobs(forceReload: boolean = false): Job[] {
  const jobs = ensureDataFile(forceReload);
  return [...jobs].sort(
    (a, b) => (new Date(b.postedAt).getTime() || 0) - (new Date(a.postedAt).getTime() || 0)
  );
}


export function getJobById(id: string): Job | undefined {
  const jobs = getAllJobs();
  return jobs.find((j) => j.id === id);
}

export function getJobBySlug(slug: string): Job | undefined {
  const jobs = getAllJobs();
  return jobs.find((j) => j.slug === slug || j.id === slug);
}

export function insertJob(job: Job): Job {
  const jobs = getAllJobs();
  const idx = jobs.findIndex((j) => j.id === job.id || (job.canonicalHash && j.canonicalHash === job.canonicalHash));
  if (idx >= 0) {
    jobs[idx] = { ...jobs[idx], ...job };
  } else {
    jobs.unshift(job);
  }
  saveJobs(jobs);

  // Background sync to Supabase
  syncJobToSupabase(job).catch(() => {});

  return job;
}

/**
 * Promotes a job with Featured status (30-day Employer Boost).
 * Updates both the local repository and Supabase cloud.
 */
export async function boostJob(jobId: string, days: number = 30): Promise<Job | null> {
  const job = getJobById(jobId);
  if (!job) return null;

  job.featured = true;
  job.isFeatured = true;
  job.status = "active";
  job.isActive = true;
  insertJob(job);

  if (isSupabaseConfigured()) {
    try {
      const sb = getSupabaseClient();
      if (sb) {
        await sb.from("jobs").update({
          featured: true,
          is_featured: true,
          status: "active",
          is_active: true,
          updated_at: new Date().toISOString(),
        }).eq("id", jobId);
      }
    } catch (err) {
      console.warn("[Jobs Repo] Supabase boostJob update notice:", err);
    }
  }

  return job;
}

/**
 * High-Throughput Batch Job Inserter
 * Deduplicates in O(1) time using canonicalHash and id lookups.
 * Performs a single atomic write to disk and batches Supabase upserts.
 */
export function insertJobsBatch(newJobs: Job[]): { added: number; updated: number; total: number } {
  if (newJobs.length === 0) {
    const current = getAllJobs();
    return { added: 0, updated: 0, total: current.length };
  }

  const existingJobs = getAllJobs();
  const hashToIdx = new Map<string, number>();
  const idToIdx = new Map<string, number>();

  for (let i = 0; i < existingJobs.length; i++) {
    const j = existingJobs[i];
    if (j.id) idToIdx.set(j.id, i);
    if (j.canonicalHash) hashToIdx.set(j.canonicalHash, i);
  }

  let addedCount = 0;
  let updatedCount = 0;
  const toPrepend: Job[] = [];

  for (const job of newJobs) {
    let matchIdx: number | undefined;
    if (job.canonicalHash && hashToIdx.has(job.canonicalHash)) {
      matchIdx = hashToIdx.get(job.canonicalHash);
    } else if (job.id && idToIdx.has(job.id)) {
      matchIdx = idToIdx.get(job.id);
    }

    if (matchIdx !== undefined && matchIdx >= 0) {
      const existing = existingJobs[matchIdx];
      existingJobs[matchIdx] = {
        ...existing,
        ...job,
        id: existing.id || job.id,
        slug: existing.slug || job.slug,
      };
      updatedCount++;
    } else if (matchIdx === -1) {
      // Duplicate within incoming batch itself
      updatedCount++;
    } else {
      toPrepend.push(job);
      // Index newly added job so duplicates within newJobs itself are deduplicated
      if (job.canonicalHash) hashToIdx.set(job.canonicalHash, -1);
      if (job.id) idToIdx.set(job.id, -1);
      addedCount++;
    }
  }

  // Prepend new jobs and sort strictly by postedAt descending
  const merged = [...toPrepend, ...existingJobs];
  merged.sort((a, b) => (new Date(b.postedAt).getTime() || 0) - (new Date(a.postedAt).getTime() || 0));

  // Keep sliding window of latest 25,000 active jobs to maximize job diversity and capacity
  const MAX_LOCAL_JOBS = 25000;
  const pruned = merged.length > MAX_LOCAL_JOBS ? merged.slice(0, MAX_LOCAL_JOBS) : merged;

  saveJobs(pruned);

  // Background batch sync to Supabase in chunks of 50
  syncJobsBatchToSupabase(newJobs).catch(() => {});

  return { added: addedCount, updated: updatedCount, total: pruned.length };
}

export function incrementViews(id: string) {
  const jobs = getAllJobs();
  const job = jobs.find((j) => j.id === id);
  if (job) {
    job.viewsCount += 1;
    saveJobs(jobs);
    syncJobToSupabase(job).catch(() => {});
  }
}

export function incrementApplies(id: string) {
  const jobs = getAllJobs();
  const job = jobs.find((j) => j.id === id);
  if (job) {
    job.appliesCount += 1;
    saveJobs(jobs);
    syncJobToSupabase(job).catch(() => {});
  }
}
