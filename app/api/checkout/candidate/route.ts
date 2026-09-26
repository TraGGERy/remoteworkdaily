import { NextResponse } from "next/server";
import { z } from "zod";
import { createCandidateSubscriptionCheckoutSession } from "@/lib/stripe";
import { CANDIDATE_PRICING, CandidatePlanId } from "@/lib/constants";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

const CandidateCheckoutSchema = z.object({
  email: z.string().email("A valid email is required for early alerts"),
  planId: z.enum(["weekly", "monthly", "lifetime"]).optional().default("monthly"),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parseResult = CandidateCheckoutSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parseResult.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { email, planId } = parseResult.data;
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const isLiveStripe = Boolean(stripeKey && !stripeKey.includes("placeholder"));
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    if (isLiveStripe) {
      const session = await createCandidateSubscriptionCheckoutSession({
        email,
        planId: planId as CandidatePlanId,
        successUrl: `${appUrl}/?subscription=success&plan=${planId}`,
        cancelUrl: `${appUrl}/?subscription=cancelled`,
      });

      return NextResponse.json({ url: session.url });
    }

    // Security Gate: In production, payment provider must be configured.
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Payment gateway is currently unavailable. Please contact support." },
        { status: 503 }
      );
    }

    // Development fallback: Record in Supabase if configured or return simulated success
    const selectedPlan = CANDIDATE_PRICING.plans[planId as CandidatePlanId] || CANDIDATE_PRICING.plans.monthly;
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from("candidate_passes").insert({
          email,
          amount: selectedPlan.price,
          currency: "USD",
          status: "active",
          plan: planId,
        });
      }
    }

    return NextResponse.json({ success: true, mode: "dev_simulated", plan: planId });
  } catch (error) {
    console.error("Candidate checkout error:", error);
    return NextResponse.json({ error: "Failed to initiate candidate checkout" }, { status: 500 });
  }
}
