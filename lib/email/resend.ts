import { Resend } from "resend";
import { CANDIDATE_PRICING, JOB_POSTING_PRICING } from "@/lib/constants";

let resendInstance: Resend | null = null;

export function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.includes("placeholder")) {
    return null;
  }
  if (!resendInstance) {
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

export function getFromEmail(): string {
  return process.env.RESEND_FROM_EMAIL || "Remote Work Daily <notifications@remoteworkdaily.com>";
}


/**
 * Sends a candidate payment confirmation & welcome email after purchasing a Pass / Subscription.
 */
export async function sendCandidatePaymentConfirmationEmail(params: {
  email: string;
  planId: string;
  amount: number;
  currency?: string;
  sessionId?: string;
  isRenewal?: boolean;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  const resend = getResendClient();
  if (!resend) {
    console.log(`[Resend Email Skipped - No API Key] Candidate receipt for ${params.email}`);
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  const plan = CANDIDATE_PRICING.plans[params.planId as keyof typeof CANDIDATE_PRICING.plans] || CANDIDATE_PRICING.plans.monthly;
  const isSubscription = plan.billingType === "subscription";
  const renewalText = isSubscription
    ? plan.interval === "week"
      ? "Auto-renews weekly at $6.99 (cancel anytime in your dashboard)"
      : "Auto-renews monthly at $17.99 (cancel anytime in your dashboard)"
    : "One-time payment (Lifetime access forever, zero recurring fees)";

  const subject = params.isRenewal
    ? `Receipt: Remote Work Daily ${plan.name} Renewal ($${params.amount.toFixed(2)})`
    : `🎉 Welcome to Remote Work Daily Pro — Order Confirmation`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background: #0f172a; padding: 32px 24px; text-align: center; }
    .logo { color: #ffffff; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; text-decoration: none; }
    .logo span { color: #ff4742; }
    .content { padding: 32px 28px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; text-transform: uppercase; background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; margin-bottom: 16px; }
    h1 { font-size: 22px; font-weight: 800; color: #0f172a; margin-top: 0; line-height: 1.3; }
    p { font-size: 14px; line-height: 1.6; color: #475569; margin: 12px 0; }
    .receipt-box { background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; padding: 20px; margin: 24px 0; }
    .receipt-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; border-bottom: 1px dashed #cbd5e1; }
    .receipt-row:last-child { border-bottom: none; font-weight: 800; font-size: 16px; color: #0f172a; padding-top: 12px; }
    .perks-list { padding: 0; list-style: none; margin: 20px 0; }
    .perks-list li { display: flex; align-items: flex-start; gap: 10px; font-size: 14px; margin-bottom: 10px; color: #334155; }
    .perks-list li span { color: #10b981; font-weight: bold; }
    .btn { display: block; text-align: center; background: #ff4742; color: #ffffff !important; font-weight: 700; font-size: 15px; padding: 14px 24px; border-radius: 10px; text-decoration: none; margin: 28px 0 16px; box-shadow: 0 2px 4px rgba(255, 71, 66, 0.25); }
    .footer { background: #f1f5f9; padding: 20px 28px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
    .footer a { color: #64748b; text-decoration: underline; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <a href="https://remoteworkdaily.com" class="logo">RemoteWork<span>Daily</span></a>
    </div>
    <div class="content">
      <span class="badge">✓ Access Unlocked</span>
      <h1>${params.isRenewal ? "Your subscription renewed successfully" : "Welcome! Your Hunter Pass is active."}</h1>
      <p>Thank you for subscribing to <strong>Remote Work Daily Pro</strong>. You now have full, unrestricted access to direct company ATS applications, early-bird alerts, and transparent compensation data.</p>
      
      <div class="receipt-box">
        <div class="receipt-row">
          <span>Plan</span>
          <span><strong>${plan.name}</strong></span>
        </div>
        <div class="receipt-row">
          <span>Billing Type</span>
          <span>${plan.interval === "week" ? "Weekly" : plan.interval === "month" ? "Monthly" : "Lifetime"}</span>
        </div>
        <div class="receipt-row">
          <span>Account Email</span>
          <span>${params.email}</span>
        </div>
        ${params.sessionId ? `
        <div class="receipt-row">
          <span>Reference</span>
          <span style="font-family: monospace; font-size: 11px;">${params.sessionId.slice(-14)}</span>
        </div>
        ` : ""}
        <div class="receipt-row">
          <span>Total Paid</span>
          <span>$${params.amount.toFixed(2)} ${(params.currency || "USD").toUpperCase()}</span>
        </div>
      </div>

      <p style="font-size: 12px; color: #64748b; margin-top: -12px; margin-bottom: 20px;">
        ℹ️ ${renewalText}
      </p>

      <h3 style="font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 24px; margin-bottom: 12px;">What's included in your pass:</h3>
      <ul class="perks-list">
        <li><span>✓</span> Direct Company ATS Links (bypass aggregator queues on Greenhouse, Lever, Ashby)</li>
        <li><span>✓</span> 3,500+ Verified 100% Remote Listings with Transparent Pay</li>
        <li><span>✓</span> 2-Hour Early-Bird Alerts before roles reach LinkedIn/Indeed</li>
        <li><span>✓</span> Remote Salary Negotiation Playbook & Email Scripts ($97 value)</li>
      </ul>

      <a href="https://remoteworkdaily.com" class="btn">Explore 3,500+ Verified Remote Jobs →</a>

      <p style="font-size: 13px; color: #64748b; margin-top: 24px;">
        <strong>7-Day Money-Back Guarantee:</strong> If you're not completely satisfied for any reason, reply directly to this email or contact <a href="mailto:support@remoteworkdaily.com" style="color: #ff4742;">support@remoteworkdaily.com</a> for an immediate 100% refund.
      </p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Remote Work Daily • High-Impact Remote Jobs with Transparent Pay</p>
      <p><a href="https://remoteworkdaily.com">Browse Jobs</a> • <a href="https://remoteworkdaily.com/privacy">Privacy Policy</a> • <a href="https://remoteworkdaily.com/terms">Terms</a></p>
    </div>
  </div>
</body>
</html>
`;

  try {
    const data = await resend.emails.send({
      from: getFromEmail(),
      to: params.email,
      subject,
      html,
    });
    console.log(`[Resend Email Sent] Candidate receipt to ${params.email}:`, data);
    return { success: true, id: data.data?.id };
  } catch (error: any) {
    console.error(`[Resend Email Error] Failed sending candidate receipt to ${params.email}:`, error);
    return { success: false, error: error.message || String(error) };
  }
}

/**
 * Sends an employer payment confirmation & live advertisement notification.
 */
export async function sendEmployerJobConfirmationEmail(params: {
  email: string;
  companyName: string;
  jobTitle: string;
  jobId: string;
  jobSlug: string;
  amountPaid: number;
  currency?: string;
  sticky?: boolean;
  featured?: boolean;
  newsletter?: boolean;
  social?: boolean;
  sessionId?: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  const resend = getResendClient();
  if (!resend) {
    console.log(`[Resend Email Skipped - No API Key] Employer receipt for ${params.email}`);
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  const liveJobUrl = `https://remoteworkdaily.com/jobs/${params.jobId}/${params.jobSlug}`;
  const subject = `🚀 Your Job is LIVE on Remote Work Daily — ${params.jobTitle} at ${params.companyName}`;

  const addOnsList: string[] = [];
  if (params.sticky) addOnsList.push("📌 30-Day Pinned Sticky at Top (+$89)");
  if (params.featured) addOnsList.push("✨ Coral Background Highlight (+$49)");
  if (params.newsletter) addOnsList.push("📬 Newsletter Blast to 120k+ Subscribers (+$59)");
  if (params.social) addOnsList.push("📢 Social & Community Broadcast (+$39)");

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background: #0f172a; padding: 32px 24px; text-align: center; }
    .logo { color: #ffffff; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; text-decoration: none; }
    .logo span { color: #ff4742; }
    .content { padding: 32px 28px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; text-transform: uppercase; background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; margin-bottom: 16px; }
    h1 { font-size: 22px; font-weight: 800; color: #0f172a; margin-top: 0; line-height: 1.3; }
    p { font-size: 14px; line-height: 1.6; color: #475569; margin: 12px 0; }
    .receipt-box { background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; padding: 20px; margin: 24px 0; }
    .receipt-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; border-bottom: 1px dashed #cbd5e1; }
    .receipt-row:last-child { border-bottom: none; font-weight: 800; font-size: 16px; color: #0f172a; padding-top: 12px; }
    .job-preview { background: #fff5f5; border: 1px solid #fecdd3; border-radius: 12px; padding: 18px; margin: 20px 0; }
    .btn { display: block; text-align: center; background: #ff4742; color: #ffffff !important; font-weight: 700; font-size: 15px; padding: 14px 24px; border-radius: 10px; text-decoration: none; margin: 28px 0 16px; box-shadow: 0 2px 4px rgba(255, 71, 66, 0.25); }
    .footer { background: #f1f5f9; padding: 20px 28px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <a href="https://remoteworkdaily.com" class="logo">RemoteWork<span>Daily</span></a>
    </div>
    <div class="content">
      <span class="badge">🚀 Listing Published</span>
      <h1>Your Job Listing is Now Live!</h1>
      <p>Congratulations! Your job listing has been verified, indexed in Google Jobs Schema, and is now actively being broadcast to top remote tech talent.</p>

      <div class="job-preview">
        <h3 style="margin: 0 0 6px; font-size: 16px; color: #0f172a;">${params.jobTitle}</h3>
        <p style="margin: 0; font-size: 13px; color: #475569;"><strong>${params.companyName}</strong> • Verified Remote Posting</p>
        <p style="margin: 8px 0 0; font-size: 12px; color: #059669; font-weight: bold;">
          Status: Active (Indexed & Distributed)
        </p>
      </div>

      <div class="receipt-box">
        <div class="receipt-row">
          <span>Standard 30-Day Listing</span>
          <span>$199.00</span>
        </div>
        ${addOnsList.map((addon) => `
        <div class="receipt-row" style="color: #64748b;">
          <span>${addon}</span>
          <span>Included</span>
        </div>
        `).join("")}
        <div class="receipt-row">
          <span>Employer Billing Email</span>
          <span>${params.email}</span>
        </div>
        <div class="receipt-row">
          <span>Total Paid</span>
          <span>$${params.amountPaid.toFixed(2)} ${(params.currency || "USD").toUpperCase()}</span>
        </div>
      </div>

      <a href="${liveJobUrl}" class="btn">View Your Live Job Listing →</a>

      <h4 style="font-size: 14px; font-weight: 700; color: #0f172a; margin-top: 24px; margin-bottom: 8px;">What happens next?</h4>
      <p style="font-size: 13px; color: #475569; margin-bottom: 6px;">• Candidates click directly through to your specified application tracking system (ATS) URL with zero intermediary fees.</p>
      <p style="font-size: 13px; color: #475569; margin-bottom: 6px;">• Your listing stays live for 30 consecutive days.</p>
      <p style="font-size: 13px; color: #475569;">• Need to edit or update your listing? Simply reply to this email.</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Remote Work Daily • Employer Success Team</p>
      <p>Questions? Reach us anytime at <a href="mailto:support@remoteworkdaily.com" style="color: #64748b;">support@remoteworkdaily.com</a></p>
    </div>
  </div>
</body>
</html>
`;

  try {
    const data = await resend.emails.send({
      from: getFromEmail(),
      to: params.email,
      subject,
      html,
    });
    console.log(`[Resend Email Sent] Employer receipt to ${params.email}:`, data);
    return { success: true, id: data.data?.id };
  } catch (error: any) {
    console.error(`[Resend Email Error] Failed sending employer receipt to ${params.email}:`, error);
    return { success: false, error: error.message || String(error) };
  }
}

/**
 * Sends a welcome email when a candidate subscribes to daily/weekly remote job alerts.
 */
export async function sendJobAlertWelcomeEmail(params: {
  email: string;
  category?: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  const resend = getResendClient();
  if (!resend) {
    console.log(`[Resend Email Skipped - No API Key] Newsletter alert for ${params.email}`);
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  const catName = params.category && params.category !== "all" ? `${params.category.toUpperCase()} ` : "";
  const subject = `🎯 You're Subscribed: Daily ${catName}Remote Job Alerts — Remote Work Daily`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background: #0f172a; padding: 32px 24px; text-align: center; }
    .logo { color: #ffffff; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; text-decoration: none; }
    .logo span { color: #ff4742; }
    .content { padding: 32px 28px; }
    h1 { font-size: 22px; font-weight: 800; color: #0f172a; margin-top: 0; line-height: 1.3; }
    p { font-size: 14px; line-height: 1.6; color: #475569; margin: 12px 0; }
    .btn { display: block; text-align: center; background: #ff4742; color: #ffffff !important; font-weight: 700; font-size: 15px; padding: 14px 24px; border-radius: 10px; text-decoration: none; margin: 28px 0 16px; }
    .footer { background: #f1f5f9; padding: 20px 28px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <a href="https://remoteworkdaily.com" class="logo">RemoteWork<span>Daily</span></a>
    </div>
    <div class="content">
      <h1>You're on the list for verified remote alerts! 🚀</h1>
      <p>Welcome to <strong>Remote Work Daily</strong>. You'll receive our morning digest of verified remote positions with transparent salaries and direct company ATS links before they get crowded on LinkedIn or Indeed.</p>
      
      <p>Over <strong>500+ fresh remote positions</strong> were ingested and verified today from top tech companies including GitLab, Zapier, Automattic, Supabase, Linear, and Cursor.</p>

      <a href="https://remoteworkdaily.com" class="btn">View Today's 500+ Fresh Jobs →</a>

      <p style="font-size: 12px; color: #64748b; margin-top: 24px;">
        Tip: To guarantee our daily digest reaches your primary inbox, please reply to this email with "Hi" or move it out of Promotions/Spam.
      </p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Remote Work Daily</p>
      <p>You received this because you subscribed to remote job alerts on <a href="https://remoteworkdaily.com" style="color: #64748b;">remoteworkdaily.com</a>.</p>
    </div>
  </div>
</body>
</html>
`;

  try {
    const data = await resend.emails.send({
      from: getFromEmail(),
      to: params.email,
      subject,
      html,
    });
    console.log(`[Resend Email Sent] Job alert welcome to ${params.email}:`, data);
    return { success: true, id: data.data?.id };
  } catch (error: any) {
    console.error(`[Resend Email Error] Failed sending job alert welcome to ${params.email}:`, error);
    return { success: false, error: error.message || String(error) };
  }
}

/**
 * Sends a daily automated remote job digest to newsletter subscribers.
 */
export async function sendDailyDigestEmail(params: {
  email: string;
  jobs: Array<{
    title: string;
    company: string;
    location?: string;
    salary?: string;
    url: string;
    category?: string;
  }>;
  totalFreshJobsCount?: number;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  const resend = getResendClient();
  if (!resend) {
    console.log(`[Resend Email Skipped - No API Key] Daily digest for ${params.email}`);
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  const dateStr = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const totalCount = params.totalFreshJobsCount || 500;
  const subject = `🔥 Today's Top Remote Jobs (${dateStr}) — ${params.jobs[0]?.title || "Fresh Openings"}`;

  const jobRowsHtml = params.jobs.map((job) => `
    <div style="border-bottom: 1px solid #e2e8f0; padding: 16px 0;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <span style="font-size: 11px; font-weight: 800; color: #ff4742; text-transform: uppercase; letter-spacing: 0.5px;">${job.company}</span>
          <h3 style="font-size: 16px; font-weight: 700; color: #0f172a; margin: 4px 0 6px 0;">
            <a href="${job.url}" style="color: #0f172a; text-decoration: none;">${job.title}</a>
          </h3>
          <div style="font-size: 12px; color: #64748b;">
            <span>📍 ${job.location || "Worldwide"}</span>
            ${job.salary ? `<span style="margin-left: 8px; color: #059669; font-weight: 600;">💰 ${job.salary}</span>` : ""}
          </div>
        </div>
      </div>
      <div style="margin-top: 10px;">
        <a href="${job.url}" style="display: inline-block; font-size: 12px; font-weight: 700; background: #f1f5f9; color: #0f172a; padding: 6px 14px; border-radius: 6px; text-decoration: none;">
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
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background: #0f172a; padding: 28px 24px; text-align: center; }
    .logo { color: #ffffff; font-size: 22px; font-weight: 900; letter-spacing: -0.5px; text-decoration: none; }
    .logo span { color: #ff4742; }
    .content { padding: 28px 24px; }
    .btn { display: block; text-align: center; background: #ff4742; color: #ffffff !important; font-weight: 700; font-size: 15px; padding: 14px 24px; border-radius: 10px; text-decoration: none; margin: 28px 0 16px; }
    .footer { background: #f1f5f9; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <a href="https://remoteworkdaily.com" class="logo">RemoteWork<span>Daily</span></a>
    </div>
    <div class="content">
      <h1 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 8px;">Morning Remote Digest • ${dateStr}</h1>
      <p style="font-size: 14px; color: #64748b; margin: 0 0 20px;">
        Here are today's top direct-apply positions with verified salaries. ${totalCount}+ additional positions added today.
      </p>

      <div style="border-top: 1px solid #e2e8f0;">
        ${jobRowsHtml}
      </div>

      <a href="https://remoteworkdaily.com" class="btn">
        View All ${totalCount}+ Jobs on Remote Work Daily &rarr;
      </a>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Remote Work Daily • Daily Remote Ingestion Engine</p>
      <p>You received this because you are an active subscriber to Remote Work Daily job alerts.</p>
    </div>
  </div>
</body>
</html>
`;

  try {
    const data = await resend.emails.send({
      from: getFromEmail(),
      to: params.email,
      subject,
      html,
    });
    console.log(`[Resend Email Sent] Daily digest to ${params.email}:`, data);
    return { success: true, id: data.data?.id };
  } catch (error: any) {
    console.error(`[Resend Email Error] Failed sending daily digest to ${params.email}:`, error);
    return { success: false, error: error.message || String(error) };
  }
}

