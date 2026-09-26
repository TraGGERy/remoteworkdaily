import Stripe from "stripe";
import { JOB_POSTING_PRICING, CANDIDATE_PRICING, CandidatePlanId } from "./constants";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2025-01-27.acacia" as unknown as Stripe.LatestApiVersion,
});

export interface CheckoutParams {
  jobId: string;
  jobTitle: string;
  companyName: string;
  userEmail: string;
  addOns: {
    sticky?: boolean;
    highlight?: boolean;
    newsletter?: boolean;
    social?: boolean;
    verifiedBadge?: boolean;
  };
  successUrl: string;
  cancelUrl: string;
}

export async function createJobPostingCheckoutSession(params: CheckoutParams) {
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
    {
      price_data: {
        currency: "usd",
        product_data: {
          name: `Remote Job Post: ${params.jobTitle}`,
          description: `30-day listing on RemoteOK for ${params.companyName}`,
        },
        unit_amount: JOB_POSTING_PRICING.basePrice * 100,
      },
      quantity: 1,
    },
  ];

  if (params.addOns.sticky) {
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: "Add-on: Pinned to top for 30 days",
          description: JOB_POSTING_PRICING.addOns.sticky.description,
        },
        unit_amount: JOB_POSTING_PRICING.addOns.sticky.price * 100,
      },
      quantity: 1,
    });
  }

  if (params.addOns.highlight) {
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: "Add-on: Highlighted Coral Row",
          description: JOB_POSTING_PRICING.addOns.highlight.description,
        },
        unit_amount: JOB_POSTING_PRICING.addOns.highlight.price * 100,
      },
      quantity: 1,
    });
  }

  if (params.addOns.newsletter) {
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: "Add-on: Newsletter Blast (120k+ reach)",
          description: JOB_POSTING_PRICING.addOns.newsletter.description,
        },
        unit_amount: JOB_POSTING_PRICING.addOns.newsletter.price * 100,
      },
      quantity: 1,
    });
  }

  if (params.addOns.social) {
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: "Add-on: Social Media Promotion (Twitter/LinkedIn)",
          description: JOB_POSTING_PRICING.addOns.social.description,
        },
        unit_amount: JOB_POSTING_PRICING.addOns.social.price * 100,
      },
      quantity: 1,
    });
  }

  const session = await stripe.checkout.sessions.create(
    {
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: params.userEmail,
      line_items: lineItems,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: {
        type: "job_post",
        jobId: params.jobId,
        jobTitle: params.jobTitle,
        companyName: params.companyName,
        sticky: params.addOns.sticky ? "true" : "false",
        highlight: params.addOns.highlight ? "true" : "false",
      },
      payment_intent_data: {
        metadata: {
          type: "job_post",
          jobId: params.jobId,
          companyName: params.companyName,
        },
      },
    },
    {
      idempotencyKey: `checkout-job-${params.jobId}`,
    }
  );

  return session;
}

export interface CandidateCheckoutParams {
  email: string;
  planId?: CandidatePlanId;
  successUrl: string;
  cancelUrl: string;
}

/**
 * Creates a Stripe Checkout Session for Candidate Subscriptions (Weekly/Monthly)
 * or One-Time Lifetime Access, modeled after CareerHound.io.
 */
export async function createCandidateSubscriptionCheckoutSession(params: CandidateCheckoutParams) {
  const planId = params.planId || "monthly";
  const plan = CANDIDATE_PRICING.plans[planId] || CANDIDATE_PRICING.plans.monthly;
  const isSubscription = plan.billingType === "subscription";

  const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = {
    price_data: {
      currency: "usd",
      product_data: {
        name: `Remote Work Daily: ${plan.name}`,
        description: plan.description,
      },
      unit_amount: Math.round(plan.price * 100),
      ...(isSubscription
        ? {
            recurring: {
              interval: plan.interval as "week" | "month",
            },
          }
        : {}),
    },
    quantity: 1,
  };

  const sessionCreateParams: Stripe.Checkout.SessionCreateParams = {
    mode: isSubscription ? "subscription" : "payment",
    payment_method_types: ["card"],
    customer_email: params.email,
    line_items: [lineItem],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: {
      type: "candidate_subscription",
      planId: plan.id,
      email: params.email,
    },
  };

  if (!isSubscription) {
    sessionCreateParams.payment_intent_data = {
      metadata: {
        type: "candidate_subscription",
        planId: plan.id,
        email: params.email,
      },
    };
  } else {
    sessionCreateParams.subscription_data = {
      metadata: {
        type: "candidate_subscription",
        planId: plan.id,
        email: params.email,
      },
    };
  }

  const session = await stripe.checkout.sessions.create(
    sessionCreateParams,
    {
      idempotencyKey: `checkout-candidate-${planId}-${params.email.toLowerCase().trim()}-${Math.floor(Date.now() / 60000)}`,
    }
  );

  return session;
}

// Backward compatibility alias
export const createCandidateHunterPassCheckoutSession = createCandidateSubscriptionCheckoutSession;

