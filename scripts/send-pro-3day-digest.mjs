#!/usr/bin/env node

/**
 * Remote Work Daily — 3-Day Pro Curated Job Digest Dispatcher
 *
 * Dispatches personalized curated remote jobs to active Pro subscribers
 * every 3 days based on their selected roles, categories, and salary criteria.
 *
 * Usage:
 *   node scripts/send-pro-3day-digest.mjs [--dry-run] [--force] [--email=user@example.com]
 */

import fs from "fs";
import path from "path";
import { Resend } from "resend";

// 1. Load .env
const envFile = path.join(process.cwd(), ".env");
if (fs.existsSync(envFile)) {
  const envContent = fs.readFileSync(envFile, "utf8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx > 0) {
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "Remote Work Daily <notifications@remoteworkdaily.com>";
const isDryRun = process.argv.includes("--dry-run");
const isForce = process.argv.includes("--force");
const emailArg = process.argv.find((a) => a.startsWith("--email="));
const targetEmail = emailArg ? emailArg.split("=")[1].trim().toLowerCase() : null;

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000; // 72 hours

function isDueFor3DayDigest(lastSentAt) {
  if (!lastSentAt) return true;
  const lastTime = new Date(lastSentAt).getTime();
  if (Number.isNaN(lastTime)) return true;
  return Date.now() - lastTime >= THREE_DAYS_MS;
}

function scoreJobForCandidate(job, prefs) {
  let score = 0;
  const targetRoles = (prefs.target_roles || []).map((r) => r.toLowerCase().trim()).filter(Boolean);
  const titleLower = (job.title || "").toLowerCase();
  const catLower = (job.category || "").toLowerCase();
  const tagsLower = Array.isArray(job.tags) ? job.tags.map((t) => t.toLowerCase()) : [];

  for (const role of targetRoles) {
    if (titleLower.includes(role)) score += 50;
    if (catLower.includes(role)) score += 40;
    if (tagsLower.some((t) => t.includes(role))) score += 30;
  }

  const jobSalary = job.salaryMax || job.salary_max || 0;
  if (prefs.min_salary && jobSalary >= prefs.min_salary) {
    score += 20;
  }

  const appUrl = job.applicationUrl || job.application_url || "";
  if (appUrl.includes("greenhouse") || appUrl.includes("lever") || appUrl.includes("workable")) {
    score += 15;
  }

  return score;
}

function getCuratedJobs(prefs, allJobs, limit = 8) {
  const scored = allJobs
    .map((j) => ({ job: j, score: scoreJobForCandidate(j, prefs) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.job);

  if (scored.length > 0) return scored;
  return allJobs.slice(0, limit);
}

async function main() {
  console.log("==========================================================");
  console.log("  Remote Work Daily — Pro 3-Day Curated Job Digest Engine ");
  console.log("==========================================================");
  console.log(`Mode: ${isDryRun ? "DRY RUN (no emails sent)" : "LIVE DISPATCH"}`);
  console.log(`Cadence: 3 Days (72 Hours) between digests`);
  if (isForce) console.log("Notice: --force flag active (bypasses 3-day interval check)");
  if (targetEmail) console.log(`Target Email: ${targetEmail}`);

  // 1. Gather active pro subscribers
  const subscribersMap = new Map();

  const passesPath = path.join(process.cwd(), "data", "candidate-passes.json");
  if (fs.existsSync(passesPath)) {
    try {
      const passes = JSON.parse(fs.readFileSync(passesPath, "utf-8"));
      for (const p of passes) {
        if (p.status === "active" && p.email) {
          subscribersMap.set(p.email.toLowerCase().trim(), {
            email: p.email.toLowerCase().trim(),
            target_roles: p.target_roles || ["Developer", "Marketing"],
            min_salary: p.min_salary || 0,
            preferred_location: p.preferred_location || "Worldwide",
            last_digest_sent_at: p.last_digest_sent_at || null,
            is_pro: true,
          });
        }
      }
    } catch (e) {
      console.warn("Could not load candidate-passes.json:", e.message);
    }
  }

  const profilesPath = path.join(process.cwd(), "data", "user-profiles.json");
  if (fs.existsSync(profilesPath)) {
    try {
      const profiles = JSON.parse(fs.readFileSync(profilesPath, "utf-8"));
      for (const p of profiles) {
        if (p.is_pro && p.email) {
          const key = p.email.toLowerCase().trim();
          const existing = subscribersMap.get(key);
          subscribersMap.set(key, {
            email: key,
            target_roles: p.target_roles?.length ? p.target_roles : existing?.target_roles || ["Developer", "Marketing"],
            min_salary: p.min_salary || existing?.min_salary || 0,
            preferred_location: p.preferred_location || existing?.preferred_location || "Worldwide",
            last_digest_sent_at: p.last_digest_sent_at || existing?.last_digest_sent_at || null,
            is_pro: true,
          });
        }
      }
    } catch (e) {
      console.warn("Could not load user-profiles.json:", e.message);
    }
  }

  const allSubscribers = Array.from(subscribersMap.values());
  console.log(`Found ${allSubscribers.length} total active Pro subscribers.`);

  // 2. Load active jobs
  const jobsPath = path.join(process.cwd(), "data", "jobs.json");
  let allJobs = [];
  if (fs.existsSync(jobsPath)) {
    try {
      allJobs = JSON.parse(fs.readFileSync(jobsPath, "utf-8")).filter((j) => j.status === "active");
    } catch (e) {
      console.warn("Could not load jobs.json:", e.message);
    }
  }
  console.log(`Loaded ${allJobs.length} active verified remote listings.`);

  let targetList = allSubscribers;
  if (targetEmail) {
    targetList = allSubscribers.filter((s) => s.email === targetEmail);
    if (targetList.length === 0) {
      console.log(`No active subscriber matching ${targetEmail}. Creating mock test subscriber.`);
      targetList = [{
        email: targetEmail,
        target_roles: ["Developer", "Marketing", "Executive"],
        min_salary: 100000,
        preferred_location: "Worldwide",
        last_digest_sent_at: null,
        is_pro: true,
      }];
    }
  }

  const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;
  let sentCount = 0;
  let skippedCount = 0;

  for (const sub of targetList) {
    const isDue = isForce || isDueFor3DayDigest(sub.last_digest_sent_at);
    if (!isDue) {
      console.log(`⏭ Skipping ${sub.email}: Sent recently on ${sub.last_digest_sent_at}. Not due yet (< 72h).`);
      skippedCount++;
      continue;
    }

    const curated = getCuratedJobs(sub, allJobs, 8);
    console.log(`\n🎯 Candidate: ${sub.email}`);
    console.log(`   Target Roles: ${sub.target_roles.join(", ")}`);
    console.log(`   Matched Jobs: ${curated.length} roles found`);

    if (isDryRun) {
      console.log(`   [DRY RUN] Would send digest with ${curated.length} jobs.`);
      sentCount++;
      continue;
    }

    if (!resend) {
      console.log(`   [SKIPPED] RESEND_API_KEY not configured. Preview only.`);
      sentCount++;
      continue;
    }

    try {
      const dateStr = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const rolesLabel = sub.target_roles.slice(0, 2).join(" & ");
      const subject = `🎯 Your 3-Day Curated Jobs Digest (${rolesLabel}) — Remote Work Daily Pro`;

      const jobCardsHtml = curated.map((job) => `
        <div style="border-bottom: 1px solid #e2e8f0; padding: 16px 0;">
          <span style="font-size: 11px; font-weight: 800; color: #ff4742; text-transform: uppercase;">${job.company}</span>
          <h3 style="font-size: 16px; font-weight: 700; color: #0f172a; margin: 4px 0 6px 0;">
            <a href="https://remoteworkdaily.com/jobs/${job.id}/${job.slug}" style="color: #0f172a; text-decoration: none;">${job.title}</a>
          </h3>
          <div style="font-size: 12px; color: #64748b; margin-bottom: 8px;">
            <span>📍 ${job.location || "100% Worldwide Remote"}</span>
            ${job.salaryMax ? `<span style="margin-left: 8px; color: #059669; font-weight: 700;">💰 Up to $${job.salaryMax.toLocaleString()}/yr</span>` : ""}
          </div>
          <div>
            <a href="${job.applicationUrl || `https://remoteworkdaily.com/jobs/${job.id}/${job.slug}`}" style="display: inline-block; font-size: 12px; font-weight: 800; background: #ff4742; color: #ffffff !important; padding: 8px 16px; border-radius: 8px; text-decoration: none;">
              Apply Direct via ATS &rarr;
            </a>
          </div>
        </div>
      `).join("");

      const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>${subject}</title></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; padding: 24px; color: #1e293b;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden;">
    <div style="background: #0f172a; padding: 28px 24px; text-align: center;">
      <h2 style="color: #ffffff; margin: 0; font-size: 20px;">RemoteWork<span style="color: #ff4742;">Daily</span></h2>
      <span style="background: #fef3c7; color: #92400e; font-size: 11px; font-weight: 800; padding: 2px 10px; border-radius: 9999px; margin-top: 6px; display: inline-block;">★ PRO CANDIDATE 3-DAY DIGEST</span>
    </div>
    <div style="padding: 24px;">
      <h3 style="margin-top: 0;">Your 3-Day Curated Job Digest</h3>
      <p style="font-size: 13px; color: #64748b;">Here are the verified remote roles matching your selected targets: <strong>${sub.target_roles.join(", ")}</strong></p>
      ${jobCardsHtml}
      <div style="text-align: center; margin-top: 24px;">
        <a href="https://remoteworkdaily.com" style="display: block; background: #0f172a; color: #ffffff !important; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: 700;">Browse All Verified Jobs &rarr;</a>
      </div>
    </div>
  </div>
</body>
</html>
      `;

      await resend.emails.send({
        from: FROM_EMAIL,
        to: sub.email,
        subject,
        html,
      });

      console.log(`   ✅ Sent 3-day digest to ${sub.email}`);
      sentCount++;
    } catch (err) {
      console.error(`   ❌ Failed sending to ${sub.email}:`, err.message);
    }
  }

  console.log("\n==========================================================");
  console.log(`Summary: ${sentCount} sent, ${skippedCount} skipped (not due).`);
  console.log("==========================================================");
}

main().catch((err) => {
  console.error("Execution error:", err);
  process.exit(1);
});
