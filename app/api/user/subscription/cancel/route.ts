import { NextResponse } from "next/server";
import { expireCandidatePass } from "@/lib/candidate-passes-repository";
import { cancelStripeSubscription } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "A valid email address is required to cancel a subscription." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Expire local pass and Supabase record
    await expireCandidatePass(normalizedEmail);

    // 2. Attempt Stripe subscription cancellation if connected
    await cancelStripeSubscription(normalizedEmail);

    return NextResponse.json({
      success: true,
      message: "Your subscription has been successfully cancelled. You will not be charged again.",
    });
  } catch (err) {
    console.error("[Subscription Cancel API Error]:", err);
    return NextResponse.json(
      { error: "Failed to process cancellation. Please try again or contact support." },
      { status: 500 }
    );
  }
}
