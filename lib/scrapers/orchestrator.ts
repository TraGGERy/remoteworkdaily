import { Job } from "../types";
import { normalizeScrapedJob, RawScrapedJob } from "../apify";
import { insertJobsBatch, getAllJobs } from "../jobs-repository";
import { recordSyncCompleted } from "../sync-tracker";
import {
  fetchArbeitnowJobs,
  fetchWeWorkRemotelyJobs,
  fetchJobicyJobs,
  fetchRemoteOKJobs,
  fetchRemotiveJobs,
  fetchHimalayasJobs,
} from "./native-scrapers";
import { fetchDirectAtsJobs } from "./ats-scrapers";
import { fetchApifyJobs } from "./apify-scraper";

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
 * High-Capacity Ingestion Orchestrator
 * Coordinates Apify Actors + Native High-Volume Scrapers to harvest ~2,000 jobs daily.
 */
export async function runDailyJobIngestionPipeline(
  options: PipelineOptions = {}
): Promise<PipelineResult> {
  const startTime = Date.now();
  const targetCount = options.targetCount || 2000;

  // Calculate Arbeitnow pages needed to satisfy volume target (250 jobs/page)
  const pagesNeeded = Math.min(Math.max(Math.ceil(targetCount / 200), 8), 12);

  console.log(`[Ingestion Pipeline] Initiating daily multi-source scrape (Target: ${targetCount} jobs, Arbeitnow pages: ${pagesNeeded})...`);

  // Parallel multi-stream harvesting
  const [
    arbeitnowRes,
    wwrRes,
    jobicyRes,
    remoteokRes,
    remotiveRes,
    himalayasRes,
    directAtsRes,
    apifyRes,
  ] = await Promise.allSettled([
    fetchArbeitnowJobs(pagesNeeded),
    fetchWeWorkRemotelyJobs(),
    fetchJobicyJobs(),
    fetchRemoteOKJobs(),
    fetchRemotiveJobs(),
    fetchHimalayasJobs(),
    fetchDirectAtsJobs(),
    fetchApifyJobs(options.apifyActorId, options.apifyConfig),
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
    apify: 0,
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

  if (apifyRes.status === "fulfilled" && apifyRes.value.length > 0) {
    sourcesBreakdown.apify = apifyRes.value.length;
    for (const j of apifyRes.value) rawJobs.push({ job: j, source: "apify" });
  }

  console.log(`[Ingestion Pipeline] Total raw jobs gathered: ${rawJobs.length}. Normalizing & deduplicating...`, sourcesBreakdown);

  // In-flight deduplication across multiple feeds using canonicalHash
  const seenHashes = new Set<string>();
  const normalizedJobs: Job[] = [];

  for (const { job, source } of rawJobs) {
    if (!job.title || (!job.company && !job.company_name)) continue;

    const normalized = normalizeScrapedJob(job);
    if (normalized.canonicalHash && seenHashes.has(normalized.canonicalHash)) {
      continue; // Duplicate within the incoming batch
    }
    if (normalized.canonicalHash) {
      seenHashes.add(normalized.canonicalHash);
    }

    // Preserve original ingest source
    normalized.source = source === "ats" ? "ats" : source === "apify" ? "apify" : "feed";
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
  console.log(`[Ingestion Pipeline] Completed in ${durationMs}ms: +${added} newly added, ${updated} updated, ${total} total active listings.`);

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
