import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { getJobById, insertJob } from "@/lib/jobs-repository";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { saveCandidatePass, expireCandidatePass } from "@/lib/candidate-passes-repository";
import {
  sendCandidatePaymentConfirmationEmail,
  sendEmployerJobConfirmationEmail,
} from "@/lib/email/resend";
import { notifyPaymentReceived } from "@/lib/telegram";

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

    // 1. Candidate Subscription / Hunter Pass Order Processing
    if (metadata.type === "candidate_subscription" || metadata.type === "candidate_pass" || (metadata.email && !metadata.jobId)) {
      const email = metadata.email || session.customer_email || session.customer_details?.email;
      const planId = metadata.planId || "monthly";
      if (email) {
        await saveCandidatePass({
          email,
          amount: (session.amount_total ?? 1799) / 100,
          currency: (session.currency ?? "usd").toUpperCase(),
          stripe_session_id: session.id,
          stripe_payment_intent: typeof session.payment_intent === "string" ? session.payment_intent : null,
          status: "active",
          plan: planId,
        });
        console.log(`[STRIPE WEBHOOK] Candidate subscription activated for ${email} (${planId})`);
      }

      // Send Candidate Order Confirmation & Access Welcome Email
      if (email) {
        sendCandidatePaymentConfirmationEmail({
          email,
          planId,
          amount: (session.amount_total ?? 1799) / 100,
          currency: session.currency ?? "usd",
          sessionId: session.id,
        }).catch((err) => console.warn("[Resend Email Error - Candidate]:", err));

        notifyPaymentReceived({
          paymentType: "candidate_subscription",
          amount: session.amount_total ?? 1799,
          currency: session.currency ?? "usd",
          customerEmail: email,
          planName: planId || "Candidate Subscription",
          paymentId: session.id,
        }).catch((err) => console.warn("[Telegram Payment Alert Error]:", err));
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

        // Send Employer Live Job Posting Confirmation & Receipt Email
        const employerEmail = metadata.email || session.customer_email || session.customer_details?.email || job.employerEmail;
        if (employerEmail) {
          sendEmployerJobConfirmationEmail({
            email: employerEmail,
            companyName: job.company,
            jobTitle: job.title,
            jobId: job.id,
            jobSlug: job.slug,
            amountPaid: (session.amount_total ?? 19900) / 100,
            currency: session.currency ?? "usd",
            sticky: job.sticky,
            featured: job.featured,
            newsletter: metadata.newsletter === "true",
            social: metadata.social === "true",
            sessionId: session.id,
          }).catch((err) => console.warn("[Resend Email Error - Employer]:", err));

          notifyPaymentReceived({
            paymentType: "employer_job_post",
            amount: session.amount_total ?? 19900,
            currency: session.currency ?? "usd",
            customerEmail: employerEmail,
            companyName: job.company,
            jobTitle: job.title,
            planName: "Employer Job Posting",
            paymentId: session.id,
          }).catch((err) => console.warn("[Telegram Payment Alert Error]:", err));
        }
      }
    }
  } else if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object as any;
    const email = (invoice.customer_email || invoice.customer_details?.email) as string | undefined;
    if (email) {
      const paymentIntent = typeof invoice.payment_intent === "string" ? invoice.payment_intent : null;
      await saveCandidatePass({
        email: email.toLowerCase().trim(),
        amount: (invoice.amount_paid ?? 0) / 100,
        currency: (invoice.currency ?? "usd").toUpperCase(),
        stripe_session_id: invoice.id,
        stripe_payment_intent: paymentIntent,
        status: "active",
        plan: invoice.subscription ? "subscription_renewal" : "candidate_pass",
      });
      console.log(`[STRIPE WEBHOOK] Recurring subscription invoice payment succeeded for ${email}`);

      notifyPaymentReceived({
        paymentType: "candidate_subscription",
        amount: invoice.amount_paid ?? 0,
        currency: invoice.currency ?? "usd",
        customerEmail: email,
        planName: invoice.subscription ? "Subscription Renewal" : "Candidate Pass",
        paymentId: invoice.id,
      }).catch((err) => console.warn("[Telegram Payment Alert Error]:", err));
    }

    if (email) {
      sendCandidatePaymentConfirmationEmail({
        email,
        planId: "monthly",
        amount: (invoice.amount_paid ?? 0) / 100,
        currency: invoice.currency ?? "usd",
        sessionId: invoice.id,
        isRenewal: true,
      }).catch((err) => console.warn("[Resend Email Error - Renewal]:", err));
    }


  } else if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id;
    if (customerId) {
      try {
        const customer = await stripe.customers.retrieve(customerId);
        if (customer && !customer.deleted && "email" in customer && customer.email) {
          await expireCandidatePass(customer.email.toLowerCase().trim());
          console.log(`[STRIPE WEBHOOK] Subscription canceled for ${customer.email}, marked expired.`);
        }
      } catch (err) {
        console.warn("[STRIPE WEBHOOK] Error handling subscription cancellation:", err);
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

