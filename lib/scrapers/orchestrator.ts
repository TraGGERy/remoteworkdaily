import { Job } from "../types";
import { normalizeScrapedJob, RawScrapedJob } from "../apify";
import { insertJobsBatch, getAllJobs } from "../jobs-repository";
import { recordSyncCompleted } from "../sync-tracker";
import { notifyCronSyncCompleted, notifyScrapeBatchSummary } from "../telegram";
import {
  fetchArbeitnowJobs,
  fetchWeWorkRemotelyJobs,
  fetchJobicyJobs,
  fetchRemoteOKJobs,
  fetchRemotiveJobs,
  fetchHimalayasJobs,
  fetchReliefWebJobs,
} from "./native-scrapers";
import { fetchDirectAtsJobs } from "./ats-scrapers";
import { fetchApifyJobs } from "./apify-scraper";
import { fetchAllPublicSectorJobs } from "./public-sector-scrapers";
import { fetchAllTaskAndGigJobs } from "./task-scrapers";

export interface PipelineOptions {
  targetCount?: number;
  force?: boolean;
  apifyActorId?: string;
  apifyConfig?: Record<string, unknown>;
}

export interface PipelineResult {
  success: boolean;
  targetCount: number;
  totalSynced: number;
  addedCount: number;
  updatedCount: number;
  totalInDatabase: number;
  sources: Record<string, number>;
  durationMs: number;
}

/**
 * High-Capacity Universal Ingestion Orchestrator
 * Coordinates Multi-Sector Native Scrapers + Direct ATS Boards + ReliefWeb RSS.
 */
export async function runDailyJobIngestionPipeline(
  options: PipelineOptions = {}
): Promise<PipelineResult> {
  const startTime = Date.now();
  const targetCount = options.targetCount || 5000;

  // Calculate Arbeitnow pages needed to satisfy volume target (100-325 jobs/page)
  const pagesNeeded = Math.min(Math.max(Math.ceil(targetCount / 250), 3), 15);

  console.log(`[Ingestion Pipeline] Initiating universal multi-source scrape (Target: ${targetCount} jobs, Arbeitnow pages: ${pagesNeeded})...`);

  // Parallel multi-stream harvesting
  const [
    arbeitnowRes,
    wwrRes,
    jobicyRes,
    remoteokRes,
    remotiveRes,
    himalayasRes,
    directAtsRes,
    reliefWebRes,
    apifyRes,
    publicSectorRes,
    tasksRes,
  ] = await Promise.allSettled([
    fetchArbeitnowJobs(pagesNeeded),
    fetchWeWorkRemotelyJobs(),
    fetchJobicyJobs(),
    fetchRemoteOKJobs(),
    fetchRemotiveJobs(),
    fetchHimalayasJobs(),
    fetchDirectAtsJobs(),
    fetchReliefWebJobs(),
    fetchApifyJobs(options.apifyActorId, options.apifyConfig),
    fetchAllPublicSectorJobs(),
    fetchAllTaskAndGigJobs(),
  ]);

  const rawJobs: { job: RawScrapedJob; source: string }[] = [];
  const sourcesBreakdown: Record<string, number> = {
    arbeitnow: 0,
    wwr: 0,
    jobicy: 0,
    remoteok: 0,
    remotive: 0,
    himalayas: 0,
    ats: 0,
    reliefweb: 0,
    apify: 0,
    public_sector: 0,
    tasks: 0,
  };

  if (arbeitnowRes.status === "fulfilled" && arbeitnowRes.value.length > 0) {
    sourcesBreakdown.arbeitnow = arbeitnowRes.value.length;
    for (const j of arbeitnowRes.value) rawJobs.push({ job: j, source: "arbeitnow" });
  }

  if (wwrRes.status === "fulfilled" && wwrRes.value.length > 0) {
    sourcesBreakdown.wwr = wwrRes.value.length;
    for (const j of wwrRes.value) rawJobs.push({ job: j, source: "wwr" });
  }

  if (jobicyRes.status === "fulfilled" && jobicyRes.value.length > 0) {
    sourcesBreakdown.jobicy = jobicyRes.value.length;
    for (const j of jobicyRes.value) rawJobs.push({ job: j, source: "jobicy" });
  }

  if (remoteokRes.status === "fulfilled" && remoteokRes.value.length > 0) {
    sourcesBreakdown.remoteok = remoteokRes.value.length;
    for (const j of remoteokRes.value) rawJobs.push({ job: j, source: "remoteok" });
  }

  if (remotiveRes.status === "fulfilled" && remotiveRes.value.length > 0) {
    sourcesBreakdown.remotive = remotiveRes.value.length;
    for (const j of remotiveRes.value) rawJobs.push({ job: j, source: "remotive" });
  }

  if (himalayasRes.status === "fulfilled" && himalayasRes.value.length > 0) {
    sourcesBreakdown.himalayas = himalayasRes.value.length;
    for (const j of himalayasRes.value) rawJobs.push({ job: j, source: "himalayas" });
  }

  if (directAtsRes.status === "fulfilled" && directAtsRes.value.length > 0) {
    sourcesBreakdown.ats = directAtsRes.value.length;
    for (const j of directAtsRes.value) rawJobs.push({ job: j, source: "ats" });
  }

  if (reliefWebRes.status === "fulfilled" && reliefWebRes.value.length > 0) {
    sourcesBreakdown.reliefweb = reliefWebRes.value.length;
    for (const j of reliefWebRes.value) rawJobs.push({ job: j, source: "reliefweb" });
  }

  if (apifyRes.status === "fulfilled" && apifyRes.value.length > 0) {
    sourcesBreakdown.apify = apifyRes.value.length;
    for (const j of apifyRes.value) rawJobs.push({ job: j, source: "apify" });
  }

  if (publicSectorRes.status === "fulfilled" && publicSectorRes.value.length > 0) {
    sourcesBreakdown.public_sector = publicSectorRes.value.length;
    for (const j of publicSectorRes.value) rawJobs.push({ job: j, source: "ats" });
  }

  if (tasksRes.status === "fulfilled" && tasksRes.value.length > 0) {
    sourcesBreakdown.tasks = tasksRes.value.length;
    for (const j of tasksRes.value) rawJobs.push({ job: j, source: "tasks" });
  }

  console.log(`[Ingestion Pipeline] Total raw jobs gathered: ${rawJobs.length}. Normalizing & deduplicating...`, sourcesBreakdown);

  // In-flight deduplication across multiple feeds using canonicalHash
  const seenHashes = new Set<string>();
  const normalizedJobs: Job[] = [];

  for (const { job, source } of rawJobs) {
    if (!job.title || (!job.company && !job.company_name)) continue;

    const normalized = normalizeScrapedJob(job);
    if (!normalized) continue;
    // Skip low-skill local on-site jobs that did not pass the Remote / High-Paying Hybrid filter (preserve public sector & civil service posts)
    if (!normalized.isPublicSector && !normalized.isTask && normalized.workArrangement === "on_site" && normalized.workplaceType === "on-site") {
      continue;
    }
    if (normalized.canonicalHash && seenHashes.has(normalized.canonicalHash)) {
      continue; // Duplicate within the incoming batch
    }
    if (normalized.canonicalHash) {
      seenHashes.add(normalized.canonicalHash);
    }

    // Preserve original ingest source
    normalized.source = source === "ats" ? "ats" : source === "apify" ? "apify" : source === "tasks" ? "direct" : "feed";
    if (source === "ats") {
      normalized.isDirectCompanyPost = true;
    }
    normalizedJobs.push(normalized);
  }

  console.log(`[Ingestion Pipeline] Deduplicated batch size: ${normalizedJobs.length}. Batch inserting into repository...`);

  // Batch insert into repository
  const { added, updated, total } = insertJobsBatch(normalizedJobs);

  // Record daily sync telemetry
  await recordSyncCompleted(normalizedJobs.length, "hybrid-multi-source", {
    targetCount,
    sources: sourcesBreakdown,
  });

  const durationMs = Date.now() - startTime;
  const durationSec = (durationMs / 1000).toFixed(1);
  console.log(`[Ingestion Pipeline] Completed in ${durationMs}ms: +${added} newly added, ${updated} updated, ${total} total active listings.`);

  // Calculate Remote vs High-Paying Hybrid breakdown & Extracted Emails
  let remoteCount = 0;
  let hybridCount = 0;
  let emailsExtracted = 0;

  for (const j of normalizedJobs) {
    if (j.workArrangement === "hybrid_high_pay" || j.workplaceType === "hybrid") {
      hybridCount++;
    } else {
      remoteCount++;
    }
    if (j.employerEmail) {
      emailsExtracted++;
    }
  }

  // Broadcast real-time sync notification and private admin batch summary to Telegram bot
  // IMPORTANT: Must be awaited so serverless functions (Vercel Cron / Webhooks) do not terminate before Telegram API calls complete
  const topNewJobs = getAllJobs()
    .slice(0, 5)
    .map((j) => ({
      title: j.title,
      company: j.company,
      location: j.location,
      salary: j.salaryMin && j.salaryMax ? `$${j.salaryMin.toLocaleString()} - $${j.salaryMax.toLocaleString()}` : undefined,
      url: `https://www.remoteworkdaily.com/jobs/${j.id}/${j.slug}`,
      workplaceType: j.workplaceType,
    }));

  await Promise.allSettled([
    notifyScrapeBatchSummary({
      remoteCount,
      hybridCount,
      emailsExtracted,
      totalListings: total,
    }).catch((err) => {
      console.warn("[Ingestion Pipeline] Telegram admin batch summary notice:", err);
    }),
    notifyCronSyncCompleted({
      added,
      updated,
      total,
      durationSec,
      sources: sourcesBreakdown,
      topNewJobs,
    }).catch((err) => {
      console.warn("[Ingestion Pipeline] Telegram notification notice:", err);
    }),
  ]);

  return {
    success: true,
    targetCount,
    totalSynced: normalizedJobs.length,
    addedCount: added,
    updatedCount: updated,
    totalInDatabase: total,
    sources: sourcesBreakdown,
    durationMs,
  };
}
