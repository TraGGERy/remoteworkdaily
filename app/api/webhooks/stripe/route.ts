import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { getJobById, insertJob } from "@/lib/jobs-repository";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

export async function POST(req: Request) {
  const body = await req.text();
  const headerPayload = await headers();
  const signature = headerPayload.get("stripe-signature");

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  if (!webhookSecret) {
    if (process.env.NODE_ENV === "production") {
      return new Response("STRIPE_WEBHOOK_SECRET is not configured", { status: 500 });
    }
    return NextResponse.json({ received: true, note: "Dev mode: No webhook secret configured" });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook construct error:", err);
    return new Response("Webhook signature verification failed", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = (session.metadata as Record<string, string>) || {};

    // 1. Candidate Hunter Pass Order Processing
    if (metadata.type === "candidate_pass" || metadata.email) {
      const email = metadata.email || session.customer_email || session.customer_details?.email;
      if (email && isSupabaseConfigured()) {
        const supabase = getSupabaseClient();
        if (supabase) {
          await supabase.from("candidate_passes").upsert(
            {
              email,
              amount: (session.amount_total ?? 3900) / 100,
              currency: (session.currency ?? "usd").toUpperCase(),
              stripe_session_id: session.id,
              stripe_payment_intent: typeof session.payment_intent === "string" ? session.payment_intent : null,
              status: "active",
            },
            { onConflict: "stripe_session_id" }
          );
          console.log(`[STRIPE WEBHOOK] Candidate Hunter Pass activated for ${email}`);
        }
      }
    }

    // 2. Employer Job Posting Processing
    const jobId = metadata.jobId;
    if (jobId) {
      const job = getJobById(jobId);
      if (job) {
        if (job.status === "active") {
          return NextResponse.json({ received: true, idempotent: true });
        }
        job.status = "active";
        job.sticky = metadata.sticky === "true";
        job.featured = metadata.highlight === "true";
        insertJob(job);
        console.log(`[STRIPE WEBHOOK] Activated job ${jobId} upon verified payment completion.`);
      }
    }
  } else if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = (session.metadata as Record<string, string>) || {};
    const jobId = metadata.jobId;

    if (jobId) {
      const job = getJobById(jobId);
      if (job && job.status === "pending_payment") {
        job.status = "archived";
        insertJob(job);
        console.log(`[STRIPE WEBHOOK] Archived expired checkout for job ${jobId}.`);
      }
    }
  }

  return NextResponse.json({ received: true, event: event.type });
}
