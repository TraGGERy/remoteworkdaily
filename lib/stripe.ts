import Stripe from "stripe";
import { JOB_POSTING_PRICING } from "./constants";

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
  successUrl: string;
  cancelUrl: string;
}

/**
 * Creates a one-time payment Checkout Session for the Candidate Hunter Pass ($39 USD).
 */
export async function createCandidateHunterPassCheckoutSession(params: CandidateCheckoutParams) {
  const session = await stripe.checkout.sessions.create(
    {
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: params.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Remote Hunter Lifetime Pass",
              description: "Instant 2-hour early job alerts, candidate spotlight, and remote salary negotiation playbook.",
            },
            unit_amount: 3900, // $39.00 USD
          },
          quantity: 1,
        },
      ],
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: {
        type: "candidate_pass",
        email: params.email,
      },
      payment_intent_data: {
        metadata: {
          type: "candidate_pass",
          email: params.email,
        },
      },
    },
    {
      idempotencyKey: `checkout-candidate-${params.email.toLowerCase().trim()}-${Math.floor(Date.now() / 60000)}`,
    }
  );

  return session;
}

