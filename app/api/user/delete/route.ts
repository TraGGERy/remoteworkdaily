import { NextResponse } from "next/server";
import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import {
  getActiveCandidatePass,
  expireCandidatePass,
  deleteCandidatePass,
} from "@/lib/candidate-passes-repository";
import { deleteSubscriber } from "@/lib/subscribers-repository";
import {
  cancelStripeSubscription,
  getActiveStripeSubscription,
} from "@/lib/stripe";

/**
 * Checks whether Clerk keys are valid and active in the current deployment.
 */
function isClerkActive(): boolean {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  return Boolean(
    publishableKey &&
      !publishableKey.includes("placeholder") &&
      (publishableKey.startsWith("pk_test_") || publishableKey.startsWith("pk_live_"))
  );
}

/**
 * Resolves target email and optional Clerk user ID from server auth or request parameters.
 */
async function resolveAccountIdentity(req: Request): Promise<{
  email: string | null;
  clerkUserId: string | null;
  cancelPlan: boolean;
}> {
  let clerkUserId: string | null = null;
  let clerkEmail: string | null = null;

  if (isClerkActive()) {
    try {
      const authSession = await auth();
      clerkUserId = authSession?.userId || null;
      if (clerkUserId) {
        const user = await currentUser();
        clerkEmail =
          user?.primaryEmailAddress?.emailAddress ||
          user?.emailAddresses?.[0]?.emailAddress ||
          null;
      }
    } catch (err) {
      console.warn("[Account Deletion] Clerk session resolution bypassed:", err);
    }
  }

  // Parse URL search parameters and JSON body for email and cancelPlan flags
  let bodyEmail: string | null = null;
  let cancelPlan = false;

  try {
    const url = new URL(req.url);
    const queryEmail = url.searchParams.get("email");
    if (queryEmail && queryEmail.includes("@")) {
      bodyEmail = queryEmail.trim().toLowerCase();
    }
    if (url.searchParams.get("cancelPlan") === "true") {
      cancelPlan = true;
    }
  } catch {
    // Malformed URL or non-standard request
  }

  try {
    const cloned = req.clone();
    const body = await cloned.json();
    if (body && typeof body === "object") {
      if (typeof body.email === "string" && body.email.includes("@")) {
        bodyEmail = body.email.trim().toLowerCase();
      }
      if (Boolean(body.cancelPlan) || Boolean(body.cancelSubscriptionFirst)) {
        cancelPlan = true;
      }
    }
  } catch {
    // Empty body or GET request
  }

  const email = (clerkEmail || bodyEmail || "").toLowerCase().trim() || null;
  return { email, clerkUserId, cancelPlan };
}

/**
 * GET /api/user/delete?email=user@example.com
 * Pre-flight check to verify if an account is eligible for deletion or blocked by an active paid plan.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const queryEmail = searchParams.get("email");
    const { email } = await resolveAccountIdentity(req);
    const targetEmail = (queryEmail || email || "").toLowerCase().trim();

    if (!targetEmail) {
      return NextResponse.json(
        { error: "A valid account email is required to check deletion eligibility." },
        { status: 400 }
      );
    }

    const pass = await getActiveCandidatePass(targetEmail);
    const stripeInfo = await getActiveStripeSubscription(targetEmail);
    const hasActiveSubscription = Boolean(
      (pass && pass.status === "active") || stripeInfo?.hasActive
    );

    return NextResponse.json({
      email: targetEmail,
      canDelete: !hasActiveSubscription,
      hasActiveSubscription,
      plan: pass?.plan || (stripeInfo?.hasActive ? "active_stripe_plan" : null),
    });
  } catch (err) {
    console.error("[Account Deletion Status Check Error]:", err);
    return NextResponse.json({ error: "Failed to evaluate account status." }, { status: 500 });
  }
}

/**
 * Handles permanent deletion of an account.
 * Guard: If the user has an active subscription or paid plan, deletion is blocked
 * unless cancelPlan is explicitly confirmed. When confirmed, the paid plan is
 * canceled first on Stripe, then local and remote records are removed.
 */
async function processAccountDeletion(req: Request) {
  try {
    const { email, clerkUserId, cancelPlan } = await resolveAccountIdentity(req);

    if (!email) {
      return NextResponse.json(
        { error: "A valid email address or authenticated session is required to delete an account." },
        { status: 400 }
      );
    }

    // 1. Inspect active subscription status
    const pass = await getActiveCandidatePass(email);
    const stripeInfo = await getActiveStripeSubscription(email);
    const hasActiveSubscription = Boolean(
      (pass && pass.status === "active") || stripeInfo?.hasActive
    );

    // 2. Guard: Prevent deletion when active paid plan exists and cancelPlan was not opted into
    if (hasActiveSubscription && !cancelPlan) {
      return NextResponse.json(
        {
          error: "Account deletion blocked: You currently have an active paid subscription. Please cancel your paid plan first before deleting your account to prevent unintended charges.",
          hasActiveSubscription: true,
          canCancelPlan: true,
          plan: pass?.plan || "monthly",
        },
        { status: 400 }
      );
    }

    // 3. If cancelPlan was confirmed, cancel the Stripe subscription and expire pass
    if (hasActiveSubscription && cancelPlan) {
      await cancelStripeSubscription(email);
      await expireCandidatePass(email);
    }

    // 4. Remove candidate passes and subscriber records
    await deleteCandidatePass(email);
    await deleteSubscriber(email);

    // 5. Delete Clerk user record if authenticated
    if (clerkUserId && isClerkActive()) {
      try {
        const client = await clerkClient();
        await client.users.deleteUser(clerkUserId);
      } catch (clerkErr) {
        console.warn("[Clerk Delete Error]: Could not delete user from Clerk directory:", clerkErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Your account and associated subscriptions have been successfully deleted.",
    });
  } catch (err) {
    console.error("[Account Deletion Error]:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred while processing account deletion." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  return processAccountDeletion(req);
}

export async function DELETE(req: Request) {
  return processAccountDeletion(req);
}
