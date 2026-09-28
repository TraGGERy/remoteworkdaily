#!/usr/bin/env node

/**
 * Remote Work Daily — Automated Daily Newsletter & Job Alert Digest Dispatcher
 *
 * Usage:
 *   node scripts/send-daily-digest.mjs [--limit=10] [--dry-run]
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

if (!RESEND_API_KEY && !isDryRun) {
  console.error("❌ RESEND_API_KEY is not configured in .env");
  process.exit(1);
}

const resend = new Resend(RESEND_API_KEY);

async function main() {
  console.log("=================================================");
  console.log("  Remote Work Daily — Automated Email Digest     ");
  console.log("=================================================");

  // 1. Load Subscribers
  const subscribersFile = path.join(process.cwd(), "data", "subscribers.json");
  let subscribers = [];
  if (fs.existsSync(subscribersFile)) {
    try {
      const raw = JSON.parse(fs.readFileSync(subscribersFile, "utf8"));
      if (Array.isArray(raw)) {
        subscribers = raw.filter((s) => s.status === "active");
      }
    } catch (e) {
      console.error("Error reading subscribers file:", e);
    }
  }

  console.log(`Found ${subscribers.length} active subscribers.`);
  if (subscribers.length === 0) {
    console.log("No subscribers to email. Done.");
    return;
  }

  // 2. Load Jobs
  const jobsFile = path.join(process.cwd(), "data", "jobs.json");
  let jobs = [];
  if (fs.existsSync(jobsFile)) {
    try {
      jobs = JSON.parse(fs.readFileSync(jobsFile, "utf8")).filter((j) => j.status === "active");
    } catch (e) {
      console.error("Error reading jobs file:", e);
    }
  }

  console.log(`Loaded ${jobs.length} active verified jobs.`);
  const digestJobs = jobs.slice(0, 8);

  const dateStr = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const subject = `🔥 Today's Top Remote Jobs (${dateStr}) — ${digestJobs[0]?.title || "Fresh Openings"}`;

  const jobRowsHtml = digestJobs.map((job) => `
    <div style="border-bottom: 1px solid #e2e8f0; padding: 16px 0;">
      <span style="font-size: 11px; font-weight: 800; color: #ff4742; text-transform: uppercase;">${job.company}</span>
      <h3 style="font-size: 16px; font-weight: 700; color: #0f172a; margin: 4px 0 6px 0;">
        <a href="https://remoteworkdaily.com/jobs/${job.id}/${job.slug}" style="color: #0f172a; text-decoration: none;">${job.title}</a>
      </h3>
      <div style="font-size: 12px; color: #64748b;">
        <span>📍 ${job.location || "Worldwide"}</span>
        ${job.salaryMin ? `<span style="margin-left: 8px; color: #059669; font-weight: 600;">💰 $${job.salaryMin.toLocaleString()}${job.salaryMax ? ` - $${job.salaryMax.toLocaleString()}` : ""}</span>` : ""}
      </div>
      <div style="margin-top: 10px;">
        <a href="https://remoteworkdaily.com/jobs/${job.id}/${job.slug}" style="display: inline-block; font-size: 12px; font-weight: 700; background: #f1f5f9; color: #0f172a; padding: 6px 14px; border-radius: 6px; text-decoration: none;">
          Apply Direct &rarr;
        </a>
      </div>
    </div>
  `).join("");

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden;">
    <div style="background: #0f172a; padding: 28px 24px; text-align: center;">
      <a href="https://remoteworkdaily.com" style="color: #ffffff; font-size: 22px; font-weight: 900; text-decoration: none;">RemoteWork<span style="color: #ff4742;">Daily</span></a>
    </div>
    <div style="padding: 28px 24px;">
      <h1 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 8px;">Morning Remote Digest • ${dateStr}</h1>
      <p style="font-size: 14px; color: #64748b; margin: 0 0 20px;">
        Here are today's top direct-apply positions with verified salaries. ${jobs.length}+ fresh jobs available right now.
      </p>
      <div style="border-top: 1px solid #e2e8f0;">
        ${jobRowsHtml}
      </div>
      <a href="https://remoteworkdaily.com" style="display: block; text-align: center; background: #ff4742; color: #ffffff; font-weight: 700; font-size: 15px; padding: 14px 24px; border-radius: 10px; text-decoration: none; margin: 28px 0 16px;">
        View All ${jobs.length}+ Jobs on Remote Work Daily &rarr;
      </a>
    </div>
    <div style="background: #f1f5f9; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
      <p>© ${new Date().getFullYear()} Remote Work Daily</p>
    </div>
  </div>
</body>
</html>
`;

  // 3. Dispatch
  console.log(`\nDispatching digest to ${subscribers.length} recipients...`);
  let sent = 0;
  for (const sub of subscribers) {
    if (isDryRun) {
      console.log(`[DRY RUN] Would send to: ${sub.email}`);
      sent++;
      continue;
    }

    try {
      const res = await resend.emails.send({
        from: FROM_EMAIL,
        to: sub.email,
        subject,
        html,
      });
      console.log(`✅ Sent to ${sub.email} (id: ${res.data?.id})`);
      sent++;
    } catch (err) {
      console.error(`❌ Failed sending to ${sub.email}:`, err.message);
    }
  }

  console.log(`\n✨ Digest dispatch finished. Successfully sent to ${sent}/${subscribers.length} subscribers.`);
}

main().catch(console.error);
