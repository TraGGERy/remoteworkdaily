import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createCandidateSubscriptionCheckoutSession } from "@/lib/stripe";
import { CANDIDATE_PRICING, CandidatePlanId } from "@/lib/constants";
import { saveCandidatePass } from "@/lib/candidate-passes-repository";
import { notifyPaymentReceived } from "@/lib/telegram";
import { saveCandidateLead, markLeadConverted } from "@/lib/candidate-leads-repository";
import { saveSubscriber } from "@/lib/subscribers-repository";

const CandidateCheckoutSchema = z.object({
  email: z.string().email("A valid email is required for early alerts"),
  planId: z.enum(["weekly", "monthly", "lifetime", "pro_monthly", "pro_quarterly"]).optional().default("pro_monthly"),
  ml_visitor_id: z.string().optional(),
  ml_session_id: z.string().optional(),
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
  const cleanEmail = email.toLowerCase().trim();
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const isLiveStripe = Boolean(stripeKey && !stripeKey.includes("placeholder"));
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    const jar = await cookies();
    const mlVisitorId = jar.get("ml_vid")?.value || parseResult.data.ml_visitor_id || "";
    const mlSessionId = jar.get("ml_sid")?.value || parseResult.data.ml_session_id || "";

    // 1. Capture candidate lead immediately upon checkout initiation
    await saveCandidateLead({
      email: cleanEmail,
      source: "onboarding_abandoned_checkout",
      selected_plan: planId,
      ml_visitor_id: mlVisitorId,
      ml_session_id: mlSessionId,
    }).catch(() => {});

    // Ensure subscriber record exists for alerts
    await saveSubscriber({
      email: cleanEmail,
      category: "checkout_initiated",
    }).catch(() => {});

    if (isLiveStripe) {
      const session = await createCandidateSubscriptionCheckoutSession({
        email: cleanEmail,
        planId: planId as CandidatePlanId,
        successUrl: `${appUrl}/?subscription=success&plan=${planId}`,
        cancelUrl: `${appUrl}/?subscription=cancelled`,
        mlVisitorId,
        mlSessionId,
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

    // Development fallback: Record in persistent repository or return simulated success
    const selectedPlan = CANDIDATE_PRICING.plans[planId as CandidatePlanId] || CANDIDATE_PRICING.plans.monthly;
    await saveCandidatePass({
      email: cleanEmail,
      amount: selectedPlan.price,
      currency: "USD",
      status: "active",
      plan: planId,
    });

    await markLeadConverted(cleanEmail).catch(() => {});

    await notifyPaymentReceived({
      paymentType: "candidate_subscription",
      amount: selectedPlan.price,
      currency: "USD",
      customerEmail: cleanEmail,
      planName: selectedPlan.name,
      paymentId: "dev_checkout",
    }).catch((err) => console.warn("[Telegram Alert Error]:", err));

    return NextResponse.json({
      success: true,
      mode: "dev_simulated",
      plan: planId,
      url: `/dashboard?subscription=success&plan=${planId}`,
    });
  } catch (error) {
    console.error("Candidate checkout error:", error);
    return NextResponse.json({ error: "Failed to initiate candidate checkout" }, { status: 500 });
  }
}
