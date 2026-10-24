import { NextResponse } from "next/server";
import {
  getActiveCandidatePass,
  updateCandidatePassPreferences,
} from "@/lib/candidate-passes-repository";
import {
  getUserProfileByEmail,
  saveUserProfile,
} from "@/lib/user-profiles-repository";
import {
  isDueFor3DayDigest,
  getNextDigestDate,
  getCuratedJobsForCandidate,
  dispatchPro3DayDigest,
} from "@/lib/digest-service";
import { getAllJobs } from "@/lib/jobs-repository";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "Email query parameter is required" }, { status: 400 });
  }

  const normEmail = email.toLowerCase().trim();
  const pass = await getActiveCandidatePass(normEmail);
  const profile = await getUserProfileByEmail(normEmail);

  const isPro = Boolean((pass && pass.status === "active") || profile?.is_pro);
  const targetRoles = pass?.target_roles?.length
    ? pass.target_roles
    : profile?.target_roles || [];
  const minSalary = pass?.min_salary || profile?.min_salary || 0;
  const preferredLocation = pass?.preferred_location || profile?.preferred_location || "Worldwide";
  const lastDigestSentAt = pass?.last_digest_sent_at || profile?.last_digest_sent_at || null;

  const nextDigestAt = getNextDigestDate(lastDigestSentAt).toISOString();
  const isDueNow = isDueFor3DayDigest(lastDigestSentAt);

  // Compute live match count for their selected criteria
  const allJobs = getAllJobs();
  const matchingJobs = getCuratedJobsForCandidate(
    {
      email: normEmail,
      target_roles: targetRoles,
      min_salary: minSalary,
      preferred_location: preferredLocation,
      is_pro: isPro,
    },
    allJobs,
    20
  );

  return NextResponse.json({
    success: true,
    email: normEmail,
    isPro,
    preferences: {
      target_roles: targetRoles,
      min_salary: minSalary,
      preferred_location: preferredLocation,
      last_digest_sent_at: lastDigestSentAt,
      next_digest_at: nextDigestAt,
      is_due_now: isDueNow,
      interval_days: 3,
      matching_jobs_count: matchingJobs.length,
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, target_roles, min_salary, preferred_location, action } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normEmail = email.toLowerCase().trim();
    const pass = await getActiveCandidatePass(normEmail);
    const profile = await getUserProfileByEmail(normEmail);

    const isPro = Boolean((pass && pass.status === "active") || profile?.is_pro);

    // If user clicks "Send test digest to my email now"
    if (action === "send_test_digest") {
      if (!isPro) {
        return NextResponse.json(
          { error: "Active Pro subscription required to receive curated 3-day digests" },
          { status: 403 }
        );
      }

      const prefs = {
        email: normEmail,
        target_roles: target_roles || pass?.target_roles || profile?.target_roles || [],
        min_salary: min_salary !== undefined ? Number(min_salary) : pass?.min_salary || profile?.min_salary || 0,
        preferred_location: preferred_location || pass?.preferred_location || profile?.preferred_location || "Worldwide",
        last_digest_sent_at: pass?.last_digest_sent_at || profile?.last_digest_sent_at || null,
        is_pro: true,
      };

      const res = await dispatchPro3DayDigest(prefs, { force: true });
      return NextResponse.json({
        success: res.success,
        message: res.success
          ? `Curated 3-day digest sent to ${normEmail} with ${res.jobsCount} matching positions!`
          : `Failed sending digest: ${res.error}`,
        jobsCount: res.jobsCount,
        error: res.error,
      });
    }

    // Save updated preferences
    const roles = Array.isArray(target_roles) ? target_roles : [];
    const salary = Number(min_salary) || 0;
    const location = preferred_location || "Worldwide";

    if (pass) {
      await updateCandidatePassPreferences(normEmail, {
        target_roles: roles,
        min_salary: salary,
        preferred_location: location,
      });
    }

    if (profile) {
      await saveUserProfile({
        clerk_user_id: profile.clerk_user_id,
        target_roles: roles,
        min_salary: salary,
        preferred_location: location,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Preferences updated. You will receive matching jobs every 3 days.",
      preferences: {
        target_roles: roles,
        min_salary: salary,
        preferred_location: location,
        interval_days: 3,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[Digest Preferences POST Error]:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
