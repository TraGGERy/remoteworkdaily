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

const UNPAIRED_SURROGATE_REGEX = /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g;

function cleanStr<T extends string | null | undefined>(val: T): T {
  if (typeof val !== "string") return val;
  return val.replace(UNPAIRED_SURROGATE_REGEX, "") as T;
}

function cleanArr(arr: string[] | null | undefined): string[] {
  if (!Array.isArray(arr)) return [];
  return arr.map((item) => (typeof item === "string" ? item.replace(UNPAIRED_SURROGATE_REGEX, "") : item));
}

/**
 * Maps a Job to its Supabase `jobs` row (single source of truth for both sync paths).
 */
function toSupabaseRow(job: Job) {
  return {
    id: job.id,
    slug: cleanStr(job.slug),
    title: cleanStr(job.title),
    company: cleanStr(job.company),
    company_slug: cleanStr(job.companySlug),
    company_logo: cleanStr(job.companyLogo ?? null),
    company_website: cleanStr(job.companyWebsite ?? null),
    verified: job.verified ?? true,
    featured: job.featured ?? false,
    sticky: job.sticky ?? false,
    location: cleanStr(job.location ?? "Worldwide"),
    location_code: cleanStr(job.locationCode ?? "WW"),
    workplace_type: job.workplaceType ?? "remote",
    category: cleanStr(job.category ?? "dev"),
    tags: cleanArr(job.tags),
    benefits: cleanArr(job.benefits),
    salary_min: job.salaryMin ?? null,
    salary_max: job.salaryMax ?? null,
    salary_currency: cleanStr(job.salaryCurrency ?? "USD"),
    description: cleanStr(job.description ?? ""),
    apply_url: cleanStr(job.applyUrl),
    posted_at: job.postedAt ?? new Date().toISOString(),
    views_count: job.viewsCount ?? 0,
    applies_count: job.appliesCount ?? 0,
    source: cleanStr(job.source ?? "direct"),
    status: job.status ?? "active",
    employer_email: cleanStr(job.employerEmail ?? null),
    canonical_hash: cleanStr(job.canonicalHash ?? null),
    work_arrangement: job.workArrangement ?? (job.workplaceType === "hybrid" ? "hybrid_high_pay" : "remote_global"),
    hybrid_city: cleanStr(job.hybridCity ?? null),
    hybrid_country: cleanStr(job.hybridCountry ?? null),
    days_in_office: job.daysInOffice ?? null,
    external_id: cleanStr(job.externalId ?? null),
    is_featured: job.isFeatured ?? job.featured ?? false,
    is_active: job.isActive ?? (job.status === "active"),
    is_public_sector: job.isPublicSector ?? job.isGovernment ?? false,
    is_government: job.isGovernment ?? job.isPublicSector ?? false,
    agency: cleanStr(job.agency ?? null),
    agency_logo: cleanStr(job.agencyLogo ?? null),
    jurisdiction: cleanStr(job.jurisdiction ?? null),
    public_sector_type: job.publicSectorType ?? null,
    grade: cleanStr(job.grade ?? null),
    eligibility_type: job.eligibilityType ?? null,
    citizenship_requirements: cleanArr(job.citizenshipRequirements),
    security_clearance_required: job.securityClearanceRequired ?? false,
    security_clearance_level: cleanStr(job.securityClearanceLevel ?? null),
    application_deadline: job.applicationDeadline ?? null,
    languages_required: cleanArr(job.languagesRequired),
    required_documents: cleanArr(job.requiredDocuments),
    original_apply_url: cleanStr(job.originalApplyUrl ?? job.applyUrl),
    selection_ref: cleanStr(job.selectionRef ?? null),
    europass_ready: job.europassReady ?? false,
    p11_ready: job.p11Ready ?? false,
    portal_type: cleanStr(job.portalType ?? null),
    updated_at: new Date().toISOString(),
  };
}

/**
 * Asynchronously persists or updates a job in Supabase if configured.
 */
async function syncJobToSupabase(job: Job) {
  await syncJobsBatchToSupabase([job]);
}

/**
 * Upserts jobs to Supabase keyed on `id` (local ids are stable after dedup merge).
 * supabase-js returns errors instead of throwing, so they are checked explicitly.
 */
async function syncJobsBatchToSupabase(jobs: Job[]) {
  if (jobs.length === 0 || !isSupabaseConfigured()) return;
  const supabase = getSupabaseClient();
  if (!supabase) return;

  const CHUNK_SIZE = 100;
  for (let i = 0; i < jobs.length; i += CHUNK_SIZE) {
    const chunkJobs = jobs.slice(i, i + CHUNK_SIZE);
    const seenBatchExts = new Set<string>();
    const records = chunkJobs.map((j) => {
      const row = toSupabaseRow(j);
      if (row.external_id) {
        if (seenBatchExts.has(row.external_id)) {
          row.external_id = `${row.external_id}_${j.id}`;
        }
        seenBatchExts.add(row.external_id);
      }
      return row;
    });

    const { error } = await supabase.from("jobs").upsert(records, { onConflict: "id" });
    if (error) console.warn(`[Supabase batch sync error] chunk ${i / CHUNK_SIZE}:`, error.message);
  }
}

/**
 * Marks jobs pruned/expired locally as archived/inactive in Supabase so both stores stay aligned.
 */
async function archiveJobsInSupabase(ids: string[]) {
  if (ids.length === 0 || !isSupabaseConfigured()) return;
  const supabase = getSupabaseClient();
  if (!supabase) return;

  for (let i = 0; i < ids.length; i += 200) {
    const batch = ids.slice(i, i + 200);
    const { error } = await supabase
      .from("jobs")
      .update({ status: "archived", is_active: false, updated_at: new Date().toISOString() })
      .in("id", batch);
    if (error) {
      // Fallback: if RLS check prevents changing status enum with anon key, deactivate
      const fallback = await supabase
        .from("jobs")
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .in("id", batch);
      if (fallback.error) {
        console.warn("[Supabase archive error]:", fallback.error.message);
      }
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
  const now = Date.now();

  // Automated Public Sector & General Deadline Expiration (mirrored to Supabase)
  const expiredIds: string[] = [];
  for (const j of jobs) {
    if (j.applicationDeadline) {
      const deadlineMs = new Date(j.applicationDeadline).getTime();
      if (!isNaN(deadlineMs) && deadlineMs < now && j.status === "active") {
        j.status = "archived";
        j.isActive = false;
        expiredIds.push(j.id);
      }
    }
  }
  if (expiredIds.length > 0) archiveJobsInSupabase(expiredIds).catch(() => {});

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

export function getJobsByCompanySlug(companySlug: string): Job[] {
  const jobs = getAllJobs();
  const normalized = companySlug.toLowerCase();
  return jobs.filter(
    (j) =>
      (j.companySlug || "").toLowerCase() === normalized ||
      (j.company || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") === normalized
  );
}

export function getTopCompanies(limit: number = 100): { slug: string; name: string; count: number; logo?: string; website?: string }[] {
  const jobs = getAllJobs();
  const map = new Map<string, { slug: string; name: string; count: number; logo?: string; website?: string }>();

  for (const j of jobs) {
    if (!j.company) continue;
    const slug = j.companySlug || j.company.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    if (!slug) continue;

    if (!map.has(slug)) {
      map.set(slug, {
        slug,
        name: j.company,
        count: 0,
        logo: j.companyLogo,
        website: j.companyWebsite,
      });
    }

    const entry = map.get(slug)!;
    entry.count++;
    if (!entry.logo && j.companyLogo) entry.logo = j.companyLogo;
    if (!entry.website && j.companyWebsite) entry.website = j.companyWebsite;
  }

  return Array.from(map.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
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

  // Keep sliding window of latest 20,000 active jobs.
  // MUST match MAX_JOBS in scripts/sync-jobs.mjs so the website and Telegram report identical totals.
  const MAX_LOCAL_JOBS = 20000;
  const pruned = merged.length > MAX_LOCAL_JOBS ? merged.slice(0, MAX_LOCAL_JOBS) : merged;

  saveJobs(pruned);

  // Sync the MERGED records (existing ids preserved) so Supabase ids never drift from local ids,
  // and archive anything pruned out of the local sliding window.
  const touchedIds = new Set<string>();
  for (const job of newJobs) {
    const idx = job.canonicalHash ? hashToIdx.get(job.canonicalHash) : undefined;
    touchedIds.add(idx !== undefined && idx >= 0 ? existingJobs[idx].id : job.id);
  }
  const keptIds = new Set(pruned.map((j) => j.id));
  const toSync = pruned.filter((j) => touchedIds.has(j.id));
  const prunedIds = merged.filter((j) => !keptIds.has(j.id)).map((j) => j.id);
  syncJobsBatchToSupabase(toSync)
    .then(() => archiveJobsInSupabase(prunedIds))
    .catch(() => {});

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
