import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import {
  saveUserProfile,
  getUserProfile,
  getLiveMatchingJobsCount,
} from "@/lib/user-profiles-repository";
import { notifyUserOnboarding } from "@/lib/telegram";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const workArrangement = searchParams.get("workArrangement") || "remote_global";
    const roles = searchParams.get("roles") ? searchParams.get("roles")!.split(",") : [];
    const minSalary = searchParams.get("minSalary") ? parseInt(searchParams.get("minSalary")!, 10) : 90000;
    const hybridCity = searchParams.get("hybridCity") || "";

    const matchCount = await getLiveMatchingJobsCount({
      workArrangement,
      targetRoles: roles,
      minSalary,
      hybridCity,
    });

    let userProfile = null;
    try {
      const { userId } = await auth();
      if (userId) {
        userProfile = await getUserProfile(userId);
      }
    } catch {
      // Auth optional for match count preview
    }

    return NextResponse.json({
      success: true,
      matchCount,
      profile: userProfile,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let authUserId: string | null = null;
    let userEmail: string | undefined = body.email;

    try {
      const authResult = await auth();
      authUserId = authResult.userId;
    } catch {
      // Continue if running without Clerk context
    }

    const userId: string = authUserId || body.clerk_user_id || `usr_guest_${Date.now()}`;

    const workType = body.workType || "100% Remote Anywhere";
    let workArrangement = body.workArrangement || "remote_global";
    if (workType.includes("Hybrid")) {
      workArrangement = "hybrid_high_pay";
    } else if (workType.includes("Region-Locked")) {
      workArrangement = "remote_regional";
    } else if (workType.includes("Both")) {
      workArrangement = "both";
    }

    const profile = await saveUserProfile({
      clerk_user_id: userId,
      email: userEmail,
      work_type: workType,
      work_arrangement: workArrangement,
      target_roles: body.targetRoles || [],
      skills: body.skills || [],
      seniority: body.seniority || "Mid-level",
      min_salary: body.minSalary ? Number(body.minSalary) : 90000,
      preferred_location: body.preferredLocation || "Worldwide",
      hybrid_city: body.hybridCity || undefined,
      hybrid_country: body.hybridCountry || undefined,
      resume_text: body.resumeText || "",
      is_pro: Boolean(body.isPro),
      onboarding_completed: true,
    });

    // Update Clerk user's publicMetadata if Clerk is available and user is authenticated
    if (userId && !userId.startsWith("usr_guest_")) {
      try {
        const client = await clerkClient();
        await client.users.updateUserMetadata(userId, {
          publicMetadata: {
            onboardingComplete: true,
            workArrangement,
            isPro: Boolean(body.isPro),
          },
        });
      } catch (clerkErr) {
        console.warn("[Onboarding API] Clerk user metadata update notice:", clerkErr);
      }
    }

    // Send Admin Telegram lead notification
    notifyUserOnboarding({
      flow: "candidate_12_step",
      email: userEmail,
      targetRoles: body.targetRoles,
      experienceLevel: body.seniority,
      salaryExpectation: `$${body.minSalary || 90000}+`,
      jobTypes: [workType],
      hasResume: body.resumeText ? "Yes (Uploaded)" : "No",
      selectedPlan: body.isPro ? "Pro Candidate ($12/mo)" : "Free Plan",
    }).catch((err) => console.warn("[Telegram Lead Alert Notice]:", err));

    const matchCount = await getLiveMatchingJobsCount({
      workArrangement,
      targetRoles: body.targetRoles,
      minSalary: body.minSalary ? Number(body.minSalary) : 90000,
      hybridCity: body.hybridCity,
    });

    const response = NextResponse.json({
      success: true,
      profile,
      matchCount,
    });

    // Set persistence cookies
    response.cookies.set("onboarding_completed", "true", {
      path: "/",
      maxAge: 31536000,
      sameSite: "lax",
    });
    response.cookies.set("rwd_onboarding_completed", "true", {
      path: "/",
      maxAge: 31536000,
      sameSite: "lax",
    });

    return response;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[Onboarding API] error:", err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
