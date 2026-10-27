import { getAllJobs } from "./jobs-repository";
import { getUnconvertedLeads, CandidateLead } from "./candidate-leads-repository";
import { getCuratedJobsForCandidate, DigestJobItem } from "./digest-service";
import { getResendClient, getFromEmail } from "./email/resend";
import { sendTelegramNotification } from "./telegram";

export interface WinBackCampaignResult {
  totalLeads: number;
  targetedLeads: number;
  emailsDelivered: number;
  failed: number;
  details: Array<{ email: string; success: boolean; jobMatches: number; error?: string }>;
}

/**
 * Generates an optimized Win-Back email HTML template tailored to the candidate's exact preferences.
 */
export function generateWinBackEmailHtml(params: {
  email: string;
  lead: CandidateLead;
  jobs: DigestJobItem[];
  appUrl: string;
}): string {
  const { lead, jobs, appUrl } = params;
  const rolesText = (lead.target_roles && lead.target_roles.length > 0)
    ? lead.target_roles.join(", ")
    : "Remote & Tech";

  const jobsListHtml = jobs.slice(0, 4).map((j) => `
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
      <div style="font-size: 11px; font-weight: 700; color: #059669; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">
        âœ“ Direct Company ATS Verified â€¢ Zero Recruiter Spam
      </div>
      <div style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 4px;">
        ${escapeHtml(j.title)}
      </div>
      <div style="font-size: 13px; color: #475569; margin-bottom: 8px;">
        ${escapeHtml(j.company)} â€¢ ${escapeHtml(j.location || "100% Remote Anywhere")}
        ${j.salary ? ` â€¢ <strong style="color: #0f172a;">${escapeHtml(j.salary)}</strong>` : ""}
      </div>
      <a href="${appUrl}/onboarding?retake=true&utm_source=winback&utm_medium=email" style="display: inline-block; font-size: 12px; font-weight: 600; color: #2563eb; text-decoration: none;">
        Unlock Direct Portal Link &rarr;
      </a>
    </div>
  `).join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Your Verified Remote Job Matches Are Expiring</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #ffffff; color: #0f172a; margin: 0; padding: 24px;">
  <div style="max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; background-color: #ffffff;">
    <div style="font-size: 12px; font-weight: 800; color: #2563eb; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
      Remote Work Daily â€¢ Candidate Win-Back Digest
    </div>
    <h1 style="font-size: 24px; font-weight: 800; line-height: 1.25; margin-bottom: 16px; color: #0f172a;">
      We found fresh direct ATS matches for your ${escapeHtml(rolesText)} search
    </h1>
    <p style="font-size: 14px; line-height: 1.6; color: #334155; margin-bottom: 24px;">
      You recently personalized your remote career preferences but didn't finish unlocking your direct application stream. 
      While public postings on LinkedIn quickly rack up 200+ applicants, these roles were scanned <strong>directly from official company career pages</strong>:
    </p>

    ${jobsListHtml}

    <div style="text-align: center; margin-top: 28px; margin-bottom: 24px;">
      <a href="${appUrl}/onboarding?retake=true&utm_source=winback_cta&utm_medium=email" style="background-color: #0f172a; color: #ffffff; font-weight: 700; font-size: 14px; text-decoration: none; padding: 14px 28px; border-radius: 12px; display: inline-block;">
        Unlock All Matches & Apply Direct (50% Off)
      </a>
    </div>

    <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 11px; color: #94a3b8; text-align: center;">
      Remote Work Daily â€¢ Verified Direct ATS Career Engine<br>
      To update your notification preferences or opt-out, visit ${appUrl}/privacy.
    </div>
  </div>
</body>
</html>
  `;
}

function escapeHtml(str: string): string {
  return (str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Dispatches win-back emails to unconverted candidate leads with personalized matched jobs.
 */
export async function runWinBackLeadRecovery(options: {
  limit?: number;
  dryRun?: boolean;
} = {}): Promise<WinBackCampaignResult> {
  const leads = getUnconvertedLeads();
  const allJobs = getAllJobs();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://remoteworkdaily.com";

  const result: WinBackCampaignResult = {
    totalLeads: leads.length,
    targetedLeads: 0,
    emailsDelivered: 0,
    failed: 0,
    details: [],
  };

  const selectedLeads = options.limit ? leads.slice(0, options.limit) : leads;
  result.targetedLeads = selectedLeads.length;

  for (const lead of selectedLeads) {
    const curated = getCuratedJobsForCandidate(
      {
        email: lead.email,
        target_roles: lead.target_roles,
        min_salary: lead.min_salary,
        is_pro: false,
      },
      allJobs,
      4
    );

    if (curated.length === 0) {
      result.details.push({
        email: lead.email,
        success: false,
        jobMatches: 0,
        error: "No matching active jobs to include in recovery email",
      });
      continue;
    }

    if (options.dryRun) {
      result.emailsDelivered++;
      result.details.push({
        email: lead.email,
        success: true,
        jobMatches: curated.length,
      });
      continue;
    }

    // Live send via Resend
    const resend = getResendClient();
    if (!resend) {
      result.failed++;
      result.details.push({
        email: lead.email,
        success: false,
        jobMatches: curated.length,
        error: "Resend client not configured (simulated mode)",
      });
      continue;
    }

    try {
      const emailHtml = generateWinBackEmailHtml({
        email: lead.email,
        lead,
        jobs: curated,
        appUrl,
      });

      const { error } = await resend.emails.send({
        from: getFromEmail(),
        to: lead.email,
        subject: `Your ${curated.length} verified direct ATS job matches are waiting`,
        html: emailHtml,
      });

      if (error) {
        result.failed++;
        result.details.push({
          email: lead.email,
          success: false,
          jobMatches: curated.length,
          error: error.message,
        });
      } else {
        result.emailsDelivered++;
        result.details.push({
          email: lead.email,
          success: true,
          jobMatches: curated.length,
        });
      }
    } catch (err: unknown) {
      result.failed++;
      const msg = err instanceof Error ? err.message : String(err);
      result.details.push({
        email: lead.email,
        success: false,
        jobMatches: curated.length,
        error: msg,
      });
    }
  }

  // Telegram alert
  if (result.emailsDelivered > 0 || result.failed > 0) {
    sendTelegramNotification(
      `ðŸ“¬ <b>Candidate Win-Back Recovery Campaign Run</b>\n` +
      `â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” \n` +
      `ðŸ‘¥ <b>Total Unconverted Leads:</b> ${result.totalLeads}\n` +
      `ðŸŽ¯ <b>Targeted:</b> ${result.targetedLeads}\n` +
      `âœ… <b>Delivered:</b> ${result.emailsDelivered}\n` +
      (result.failed > 0 ? `âš ï¸  <b>Failed/Simulated:</b> ${result.failed}\n` : "") +
      `â ± <b>Time:</b> ${new Date().toUTCString()}\n` +
      `â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” `
    ).catch(() => {});
  }

  return result;
}
