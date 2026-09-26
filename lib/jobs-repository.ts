import fs from "fs";
import path from "path";
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
let memoryCache: Job[] | null = null;

function ensureDataFile(): Job[] {
  if (memoryCache && memoryCache.length > 0) {
    return memoryCache;
  }

  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      try {
        fs.mkdirSync(dir, { recursive: true });
      } catch {
        // Read-only environment, fallback to INITIAL_JOBS
      }
    }

    if (!fs.existsSync(DATA_FILE)) {
      try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(INITIAL_JOBS, null, 2), "utf8");
      } catch {
        // Ephemeral or read-only filesystem
      }
      memoryCache = [...INITIAL_JOBS];
      return memoryCache;
    }

    const content = fs.readFileSync(DATA_FILE, "utf8");
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed) && parsed.length > 0) {
      memoryCache = parsed;
      return memoryCache;
    }

    memoryCache = [...INITIAL_JOBS];
    return memoryCache;
  } catch (error) {
    console.warn("Notice: Using in-memory fallback for jobs data:", error);
    memoryCache = [...INITIAL_JOBS];
    return memoryCache;
  }
}

function saveJobs(jobs: Job[]) {
  // Always update in-memory cache immediately
  memoryCache = [...jobs];

  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(jobs, null, 2), "utf8");
  } catch (error) {
    console.warn("Notice: File write skipped in current runtime environment (in-memory updated):", error);
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
      status: job.status ?? "pending_payment",
      employer_email: job.employerEmail ?? null,
      canonical_hash: job.canonicalHash ?? null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "id" });
  } catch (err) {
    console.error("[Supabase sync error]:", err);
  }
}

async function syncJobsBatchToSupabase(jobs: Job[]) {
  if (!isSupabaseConfigured()) return;
  const supabase = getSupabaseClient();
  if (!supabase) return;

  const CHUNK_SIZE = 50;
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
      status: job.status ?? "pending_payment",
      employer_email: job.employerEmail ?? null,
      canonical_hash: job.canonicalHash ?? null,
      updated_at: new Date().toISOString(),
    }));

    try {
      await supabase.from("jobs").upsert(records, { onConflict: "id" });
    } catch (err) {
      console.warn("[Supabase batch sync error]:", err);
    }
  }
}

export function getAllJobs(): Job[] {
  return ensureDataFile();
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

    if (matchIdx !== undefined) {
      existingJobs[matchIdx] = { ...existingJobs[matchIdx], ...job };
      updatedCount++;
    } else {
      toPrepend.push(job);
      // Index newly added job so duplicates within newJobs itself are deduplicated
      if (job.canonicalHash) hashToIdx.set(job.canonicalHash, -1);
      if (job.id) idToIdx.set(job.id, -1);
      addedCount++;
    }
  }

  // Prepend new jobs to keep newest on top
  const merged = [...toPrepend, ...existingJobs];

  // Keep sliding window of latest 3,500 active jobs locally to prevent file bloat
  const MAX_LOCAL_JOBS = 3500;
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
