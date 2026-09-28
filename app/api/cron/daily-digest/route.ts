import { NextResponse } from "next/server";
import { getAllActiveSubscribers } from "@/lib/subscribers-repository";
import { getAllJobs } from "@/lib/jobs-repository";
import { sendDailyDigestEmail } from "@/lib/email/resend";
import { formatSalary } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * Automated Daily Job Digest Cron Endpoint
 *
 * Can be triggered daily via Vercel Cron, GitHub Actions, or standard curl.
 * Secure with Bearer token matching CRON_SECRET or development environment.
 */
export async function GET(request: Request) {
  return handleDailyDigest(request);
}

export async function POST(request: Request) {
  return handleDailyDigest(request);
}

async function handleDailyDigest(request: Request) {
  // 1. Authorization check
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    // Check url search params as secondary fallback
    const { searchParams } = new URL(request.url);
    if (searchParams.get("key") !== cronSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    // 2. Fetch all active subscribers from persistent database
    const subscribers = getAllActiveSubscribers();
    if (subscribers.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No active subscribers found in database.",
        subscribersCount: 0,
      });
    }

    // 3. Fetch freshest verified remote jobs
    const allJobs = getAllJobs();
    const activeJobs = allJobs.filter((j) => j.status === "active");

    // Take top 8 curated jobs for the email digest
    const digestJobs = activeJobs.slice(0, 8).map((job) => ({
      title: job.title,
      company: job.company,
      location: job.location,
      salary: formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency),
      url: `https://remoteworkdaily.com/jobs/${job.id}/${job.slug}`,
      category: job.category,
    }));

    // 4. Batch dispatch to subscribers
    let successCount = 0;
    let failedCount = 0;

    for (const sub of subscribers) {
      try {
        const result = await sendDailyDigestEmail({
          email: sub.email,
          jobs: digestJobs,
          totalFreshJobsCount: activeJobs.length,
        });

        if (result.success) {
          successCount++;
        } else {
          failedCount++;
        }
      } catch (err) {
        console.error(`Error sending digest to ${sub.email}:`, err);
        failedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      processed: subscribers.length,
      delivered: successCount,
      failed: failedCount,
      jobsIncluded: digestJobs.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Daily digest cron execution error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to execute daily digest" },
      { status: 500 }
    );
  }
}
