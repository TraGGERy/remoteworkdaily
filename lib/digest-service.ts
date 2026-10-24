import { Job } from "./types";
import { getAllJobs } from "./jobs-repository";
import {
  getAllActiveCandidatePasses,
  updateCandidatePassDigestSent,
} from "./candidate-passes-repository";
import {
  getAllProUserProfiles,
  updateUserProfileDigestSent,
  getUserProfileByEmail,
} from "./user-profiles-repository";
import {
  getSubscriber,
  updateSubscriberDigestSent,
} from "./subscribers-repository";
import { sendPro3DayDigestEmail } from "./email/resend";
import { formatSalary, isEarlyAccessJob } from "./utils";
import { sendTelegramNotification } from "./telegram";

export const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000; // 72 hours

export interface CandidateAlertPreferences {
  email: string;
  target_roles?: string[];
  selected_categories?: string[];
  skills?: string[];
  min_salary?: number;
  preferred_location?: string;
  saved_job_ids?: string[];
  last_digest_sent_at?: string | null;
  plan?: string;
  is_pro: boolean;
}

export interface DigestJobItem {
  id: string;
  title: string;
  company: string;
  location?: string;
  salary?: string;
  url: string;
  category?: string;
  tags?: string[];
  isDirectAts?: boolean;
  isEarlyAccess?: boolean;
}

/**
 * Checks whether an active subscriber is due for their 3-day curated digest.
 * Returns true if never sent before, or if >= 72 hours have elapsed since last dispatch.
 */
export function isDueFor3DayDigest(lastSentAt?: string | null): boolean {
  if (!lastSentAt) return true;
  const lastTime = new Date(lastSentAt).getTime();
  if (isNaN(lastTime)) return true;
  return Date.now() - lastTime >= THREE_DAYS_MS;
}

/**
 * Calculates the exact future Date when the next 3-day digest is scheduled.
 */
export function getNextDigestDate(lastSentAt?: string | null): Date {
  if (!lastSentAt) return new Date();
  const lastTime = new Date(lastSentAt).getTime();
  if (isNaN(lastTime)) return new Date();
  return new Date(lastTime + THREE_DAYS_MS);
}

/**
 * Curates matching verified jobs specifically for the candidate's selected roles & preferences.
 */
export function getCuratedJobsForCandidate(
  prefs: CandidateAlertPreferences,
  allJobs: Job[],
  limit = 8
): DigestJobItem[] {
  const activeJobs = allJobs.filter(
    (j) => j.status !== "pending_payment" && j.status !== "archived" && j.isActive !== false
  );

  const roles = (prefs.target_roles || []).map((r) => r.toLowerCase().trim()).filter(Boolean);
  const categories = (prefs.selected_categories || []).map((c) => c.toLowerCase().trim()).filter(Boolean);
  const skills = (prefs.skills || []).map((s) => s.toLowerCase().trim()).filter(Boolean);
  const minSal = prefs.min_salary || 0;
  const savedIds = new Set(prefs.saved_job_ids || []);
  const preferredLoc = (prefs.preferred_location || "").toLowerCase().trim();

  const scored: Array<{ job: Job; score: number }> = [];

  for (const job of activeJobs) {
    let score = 0;
    const title = (job.title || "").toLowerCase();
    const tags = Array.isArray(job.tags) ? job.tags.map((t) => t.toLowerCase()) : [];
    const location = (job.location || "").toLowerCase();
    const cat = (job.category || "").toLowerCase();

    // 1. Explicitly saved / bookmarked jobs get highest priority
    if (savedIds.has(job.id)) {
      score += 1000;
    }

    // 2. Selected / Target Roles match
    if (roles.length > 0) {
      for (const r of roles) {
        if (title.includes(r)) score += 50;
        if (tags.some((t) => t.includes(r))) score += 30;
        if (cat === r) score += 40;
      }
    }

    // 3. Category match
    if (categories.length > 0) {
      if (categories.includes(cat)) score += 40;
    }

    // 4. Skills match
    if (skills.length > 0) {
      for (const s of skills) {
        if (tags.some((t) => t.includes(s))) score += 25;
        if (title.includes(s)) score += 20;
      }
    }

    // 5. Salary qualification
    if (minSal > 0) {
      const maxSal = job.salaryMax || job.salaryMin || 0;
      if (maxSal >= minSal) score += 20;
    }

    // 6. Preferred location match
    if (preferredLoc && preferredLoc !== "all" && preferredLoc !== "worldwide") {
      if (location.includes(preferredLoc)) score += 25;
    }

    // 7. Direct ATS boost
    if (job.source === "ats" || Boolean(job.atsProvider) || Boolean(job.isDirectCompanyPost)) {
      score += 15;
    }

    // 8. Low competition / Early-bird boost (<15 applicants or <24h)
    if (job.appliesCount < 15 || job.viewsCount < 50 || isEarlyAccessJob(job.postedAt)) {
      score += 15;
    }

    // 9. Freshness bonus (jobs added over the 3-day cycle = last 72 hours)
    if (job.postedAt) {
      const ageHours = (Date.now() - new Date(job.postedAt).getTime()) / (1000 * 3600);
      if (ageHours >= 0 && ageHours <= 72) {
        score += Math.max(0, 30 - Math.floor(ageHours / 2.5));
      }
    }

    if (score > 0 || (roles.length === 0 && categories.length === 0)) {
      scored.push({ job, score });
    }
  }

  // Sort descending by calculated relevance score
  scored.sort((a, b) => b.score - a.score);

  // Take top limit items
  const topList = scored.slice(0, limit);

  // If matches are below 4, backfill with top fresh active jobs so digest is always high value
  if (topList.length < 4) {
    const existingIds = new Set(topList.map((s) => s.job.id));
    for (const job of activeJobs) {
      if (!existingIds.has(job.id)) {
        topList.push({ job, score: 1 });
        existingIds.add(job.id);
        if (topList.length >= limit) break;
      }
    }
  }

  return topList.map(({ job }) => ({
    id: job.id,
    title: job.title,
    company: job.company,
    location: job.location || "100% Worldwide Remote",
    salary: formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency),
    url: `https://remoteworkdaily.com/jobs/${job.id}/${job.slug}`,
    category: job.category,
    tags: job.tags,
    isDirectAts: Boolean(job.source === "ats" || job.atsProvider || job.isDirectCompanyPost),
    isEarlyAccess: Boolean(job.appliesCount < 15 || isEarlyAccessJob(job.postedAt)),
  }));
}

/**
 * Retrieves all active Pro subscribers eligible for 3-day job alerts.
 * Merges CandidatePass records, UserProfiles, and newsletter subscriptions.
 */
export async function getActiveProSubscribers(): Promise<CandidateAlertPreferences[]> {
  const passes = getAllActiveCandidatePasses();
  const proProfiles = getAllProUserProfiles();
  const subscribersMap = new Map<string, CandidateAlertPreferences>();

  // 1. Ingest all active Candidate Passes (purchased subscriptions)
  for (const pass of passes) {
    const email = pass.email.toLowerCase().trim();
    subscribersMap.set(email, {
      email,
      target_roles: pass.target_roles || [],
      selected_categories: pass.selected_categories || [],
      saved_job_ids: pass.saved_job_ids || [],
      min_salary: pass.min_salary || 0,
      preferred_location: pass.preferred_location || "Worldwide",
      last_digest_sent_at: pass.last_digest_sent_at || null,
      plan: pass.plan || "pro_monthly",
      is_pro: true,
    });
  }

  // 2. Enrich with UserProfile data (onboarding preferences, skills, target roles)
  for (const prof of proProfiles) {
    if (!prof.email) continue;
    const email = prof.email.toLowerCase().trim();
    const existing = subscribersMap.get(email);

    subscribersMap.set(email, {
      email,
      target_roles: Array.from(new Set([...(prof.target_roles || []), ...(existing?.target_roles || [])])),
      selected_categories: existing?.selected_categories || [],
      skills: prof.skills || [],
      min_salary: prof.min_salary || existing?.min_salary || 90000,
      preferred_location: prof.preferred_location || existing?.preferred_location || "Worldwide",
      saved_job_ids: Array.from(new Set([...(prof.saved_job_ids || []), ...(existing?.saved_job_ids || [])])),
      last_digest_sent_at: prof.last_digest_sent_at || existing?.last_digest_sent_at || null,
      plan: prof.pro_plan || existing?.plan || "candidate_pro",
      is_pro: true,
    });
  }

  return Array.from(subscribersMap.values());
}

/**
 * Dispatches a 3-day curated digest for a single candidate.
 */
export async function dispatchPro3DayDigest(
  prefs: CandidateAlertPreferences,
  options: { force?: boolean } = {}
): Promise<{ success: boolean; jobsCount: number; id?: string; error?: string; skipped?: boolean }> {
  // Check 3-day interval condition
  if (!options.force && !isDueFor3DayDigest(prefs.last_digest_sent_at)) {
    return {
      success: true,
      skipped: true,
      jobsCount: 0,
      error: `Skipped: 3-day cadence interval not yet elapsed (last sent: ${prefs.last_digest_sent_at})`,
    };
  }

  const allJobs = getAllJobs();
  const curatedJobs = getCuratedJobsForCandidate(prefs, allJobs, 8);

  if (curatedJobs.length === 0) {
    return {
      success: false,
      jobsCount: 0,
      error: "No matching active jobs available to send",
    };
  }

  const result = await sendPro3DayDigestEmail({
    email: prefs.email,
    roles: prefs.target_roles && prefs.target_roles.length > 0 ? prefs.target_roles : ["Remote Roles"],
    jobs: curatedJobs,
    totalFreshMatchesCount: allJobs.length,
  });

  if (result.success) {
    const nowIso = new Date().toISOString();
    await Promise.allSettled([
      updateCandidatePassDigestSent(prefs.email, nowIso),
      updateUserProfileDigestSent(prefs.email, nowIso),
      updateSubscriberDigestSent(prefs.email, nowIso),
    ]);
  }

  return {
    success: result.success,
    jobsCount: curatedJobs.length,
    id: result.id,
    error: result.error,
  };
}

/**
 * Automated batch dispatcher: finds all active Pro subscribers due for their 3-day digest and sends them.
 */
export async function dispatchAllDuePro3DayDigests(options: { dryRun?: boolean; force?: boolean } = {}) {
  const subscribers = await getActiveProSubscribers();
  const dueSubscribers = options.force
    ? subscribers
    : subscribers.filter((s) => isDueFor3DayDigest(s.last_digest_sent_at));

  const stats = {
    totalActive: subscribers.length,
    dueCount: dueSubscribers.length,
    sentCount: 0,
    failedCount: 0,
    skippedCount: subscribers.length - dueSubscribers.length,
    details: [] as Array<{ email: string; success: boolean; jobsCount: number; error?: string }>,
  };

  if (options.dryRun) {
    return {
      ...stats,
      dryRun: true,
      message: `Dry run complete. ${dueSubscribers.length} subscribers are due for their 3-day digest.`,
    };
  }

  for (const sub of dueSubscribers) {
    try {
      const res = await dispatchPro3DayDigest(sub, { force: options.force });
      if (res.success && !res.skipped) {
        stats.sentCount++;
        stats.details.push({ email: sub.email, success: true, jobsCount: res.jobsCount });
      } else if (res.skipped) {
        stats.skippedCount++;
      } else {
        stats.failedCount++;
        stats.details.push({ email: sub.email, success: false, jobsCount: 0, error: res.error });
      }
    } catch (err: unknown) {
      stats.failedCount++;
      const errorMsg = err instanceof Error ? err.message : String(err);
      stats.details.push({ email: sub.email, success: false, jobsCount: 0, error: errorMsg });
    }
  }

  // Telegram alert summary for administration
  if (stats.sentCount > 0 || stats.failedCount > 0) {
    await sendTelegramNotification(
      `⭐ <b>3-Day Pro Curated Job Digest Dispatched</b>\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `👥 <b>Active Pro Subscribers:</b> ${stats.totalActive}\n` +
      `📬 <b>Delivered Today:</b> ${stats.sentCount}\n` +
      `⏳ <b>Skipped (Cadence < 3 Days):</b> ${stats.skippedCount}\n` +
      (stats.failedCount > 0 ? `⚠️ <b>Failed:</b> ${stats.failedCount}\n` : "") +
      `⏱ <b>Timestamp:</b> ${new Date().toUTCString()}\n` +
      `━━━━━━━━━━━━━━━━━━━━`
    ).catch(() => {});
  }

  return stats;
}
