import { NextResponse } from "next/server";
import {
  dispatchAllDuePro3DayDigests,
  dispatchPro3DayDigest,
  getActiveProSubscribers,
} from "@/lib/digest-service";
import { getActiveCandidatePass } from "@/lib/candidate-passes-repository";
import { getUserProfileByEmail } from "@/lib/user-profiles-repository";

export const dynamic = "force-dynamic";

/**
 * Automated 3-Day Pro Curated Job Digest Endpoint
 *
 * Runs automatically via Vercel Cron or GitHub Actions.
 * Also supports manual testing: /api/cron/pro-digest?email=test@example.com&force=true
 */
export async function GET(request: Request) {
  return handleProDigest(request);
}

export async function POST(request: Request) {
  return handleProDigest(request);
}

async function handleProDigest(request: Request) {
  const { searchParams } = new URL(request.url);
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  const providedKey = searchParams.get("key");

  // Authorization check (bypassed if CRON_SECRET is not configured or in development mode)
  if (cronSecret && authHeader !== `Bearer ${cronSecret}` && providedKey !== cronSecret) {
    // Check if localhost/dev
    const host = request.headers.get("host") || "";
    const isLocal = host.includes("localhost") || host.includes("127.0.0.1");
    if (!isLocal) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const dryRun = searchParams.get("dryRun") === "true";
  const force = searchParams.get("force") === "true";
  const targetEmail = searchParams.get("email");

  // Single user dispatch (e.g. test run from dashboard)
  if (targetEmail) {
    const normEmail = targetEmail.toLowerCase().trim();
    const pass = await getActiveCandidatePass(normEmail);
    const profile = await getUserProfileByEmail(normEmail);

    if (!pass && !profile?.is_pro) {
      return NextResponse.json(
        {
          success: false,
          error: "No active Pro subscription found for this email address",
        },
        { status: 404 }
      );
    }

    const prefs = {
      email: normEmail,
      target_roles: pass?.target_roles || profile?.target_roles || [],
      selected_categories: pass?.selected_categories || [],
      skills: profile?.skills || [],
      min_salary: pass?.min_salary || profile?.min_salary || 0,
      preferred_location: pass?.preferred_location || profile?.preferred_location || "Worldwide",
      saved_job_ids: pass?.saved_job_ids || profile?.saved_job_ids || [],
      last_digest_sent_at: pass?.last_digest_sent_at || profile?.last_digest_sent_at || null,
      plan: pass?.plan || profile?.pro_plan || "pro_monthly",
      is_pro: true,
    };

    const res = await dispatchPro3DayDigest(prefs, { force });
    return NextResponse.json({
      success: res.success,
      email: normEmail,
      jobsCount: res.jobsCount,
      skipped: res.skipped,
      error: res.error,
    });
  }

  // Batch dispatch to all due active Pro subscribers
  try {
    const stats = await dispatchAllDuePro3DayDigests({ dryRun, force });
    return NextResponse.json({
      success: true,
      ...stats,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[Pro Digest Error]:", err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
