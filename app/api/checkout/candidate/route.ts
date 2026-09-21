import { NextResponse } from "next/server";
import { z } from "zod";
import { createCandidateHunterPassCheckoutSession } from "@/lib/stripe";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

const CandidateCheckoutSchema = z.object({
  email: z.string().email("A valid email is required for early alerts"),
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

  const { email } = parseResult.data;
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const isLiveStripe = Boolean(stripeKey && !stripeKey.includes("placeholder"));
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    if (isLiveStripe) {
      const session = await createCandidateHunterPassCheckoutSession({
        email,
        successUrl: `${appUrl}/?hunter_pass=success`,
        cancelUrl: `${appUrl}/?hunter_pass=cancelled`,
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
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from("candidate_passes").insert({
          email,
          amount: 39,
          currency: "USD",
          status: "active",
        });
      }
    }

    return NextResponse.json({ success: true, mode: "dev_simulated" });
  } catch (error) {
    console.error("Candidate checkout error:", error);
    return NextResponse.json({ error: "Failed to initiate candidate checkout" }, { status: 500 });
  }
}
