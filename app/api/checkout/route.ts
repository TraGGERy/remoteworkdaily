import { NextResponse } from "next/server";
import { z } from "zod";
import { insertJob } from "@/lib/jobs-repository";
import { createJobPostingCheckoutSession } from "@/lib/stripe";
import { Job } from "@/lib/types";
import { notifyPaymentReceived } from "@/lib/telegram";

const CheckoutSchema = z.object({
  jobTitle: z.string().min(2, "Job title must be at least 2 characters").max(120),
  companyName: z.string().min(2, "Company name must be at least 2 characters").max(100),
  companyLogo: z
    .string()
    .refine(
      (val) => !val || val.startsWith("http://") || val.startsWith("https://") || val.startsWith("data:image/"),
      "Logo must be a valid URL or image upload"
    )
    .optional()
    .or(z.literal("")),
  companyWebsite: z.string().url().optional().or(z.literal("")),
  userEmail: z.string().email("A valid work email is required for receipt and management"),
  category: z.enum(["dev", "design", "marketing", "sales", "ops", "exec", "support", "finance", "medical", "other"]).default("dev"),
  location: z.string().default("Worldwide"),
  workplaceType: z.enum(["remote", "hybrid", "on-site"]).default("remote"),
  salaryMin: z.number().nonnegative().optional(),
  salaryMax: z.number().nonnegative().optional(),
  tags: z.array(z.string()).default(["Remote"]),
  benefits: z.array(z.string()).default([]),
  description: z.string().default(""),
  applyUrl: z.string().url("A valid application URL is required"),
  paymentRail: z.enum(["stripe_card", "plaid_ach"]).optional().default("stripe_card"),
  plaidItemId: z.string().optional(),
  plaidInstitution: z.string().optional(),
  addOns: z.object({
    sticky: z.boolean().optional(),
    highlight: z.boolean().optional(),
    newsletter: z.boolean().optional(),
    social: z.boolean().optional(),
    verifiedBadge: z.boolean().optional(),
  }).optional(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid or malformed JSON payload" },
      { status: 400 }
    );
  }

  try {
    const parseResult = CheckoutSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const {
      jobTitle,
      companyName,
      companyLogo,
      companyWebsite,
      userEmail,
      category,
      location,
      workplaceType,
      salaryMin,
      salaryMax,
      tags,
      benefits,
      description,
      applyUrl,
      paymentRail,
      plaidItemId,
      plaidInstitution,
      addOns,
    } = parseResult.data;

    const companySlug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const slug = `${jobTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${companySlug}`.replace(/--+/g, "-").slice(0, 80);
    const jobId = `job-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const isLiveStripe = Boolean(stripeKey && !stripeKey.includes("placeholder"));

    const newJob: Job = {
      id: jobId,
      slug,
      title: jobTitle,
      company: companyName,
      companySlug,
      companyLogo: companyLogo || undefined,
      companyWebsite: companyWebsite || undefined,
      verified: addOns?.verifiedBadge ?? true,
      featured: addOns?.highlight ?? false,
      sticky: addOns?.sticky ?? false,
      location: location || "Worldwide",
      workplaceType: workplaceType || "remote",
      category,
      tags: tags || ["Remote"],
      benefits: benefits || [],
      salaryMin: salaryMin || undefined,
      salaryMax: salaryMax || undefined,
      salaryCurrency: "USD",
      description: description || "",
      applyUrl: applyUrl,
      postedAt: new Date().toISOString(),
      viewsCount: 1,
      appliesCount: 0,
      source: "direct",
      employerEmail: userEmail,
      // If Stripe payment is active, hold in pending_payment until webhook confirms checkout
      status: isLiveStripe ? "pending_payment" : "active",
    };

    // Save job into repository (in pending_payment or active state)
    insertJob(newJob);

    // Handle Corporate ACH payment rail via Plaid
    if (paymentRail === "plaid_ach") {
      const baseAmount = 249;
      const addOnsTotal =
        (addOns?.sticky ? 89 : 0) +
        (addOns?.highlight ? 49 : 0) +
        (addOns?.newsletter ? 99 : 0) +
        (addOns?.social ? 69 : 0);
      const totalCents = (baseAmount + addOnsTotal) * 100;

      await notifyPaymentReceived({
        paymentType: "plaid_ach",
        amount: totalCents,
        currency: "USD",
        customerEmail: userEmail,
        companyName: companyName,
        jobTitle: jobTitle,
        planName: `Employer Job Post (Plaid ACH: ${plaidInstitution || "Corporate Bank"})`,
        paymentId: plaidItemId || jobId,
      }).catch((err) => console.warn("[Telegram ACH Alert Error]:", err));

      return NextResponse.json({
        success: true,
        job: newJob,
        paymentRail: "plaid_ach",
        message: "Corporate ACH transfer authorized via Plaid",
      });
    }

    // If Stripe is configured with real key, initiate checkout
    if (isLiveStripe) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const session = await createJobPostingCheckoutSession({
        jobId,
        jobTitle,
        companyName,
        userEmail,
        addOns: addOns || {},
        successUrl: `${appUrl}/?posted=true`,
        cancelUrl: `${appUrl}/hire-remotely?cancelled=true`,
      });

      return NextResponse.json({ url: session.url, jobId });
    }

    // Security Gate: In production, payment provider must be live.
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Payment gateway is currently unavailable. Please contact support." },
        { status: 503 }
      );
    }

    // Local development only: immediately activate for developer ergonomics
    const baseDevAmount = 249;
    const addOnsTotal =
      (addOns?.sticky ? 89 : 0) +
      (addOns?.highlight ? 49 : 0) +
      (addOns?.newsletter ? 99 : 0) +
      (addOns?.social ? 69 : 0);
    await notifyPaymentReceived({
      paymentType: "employer_job_post",
      amount: (baseDevAmount + addOnsTotal) * 100,
      currency: "USD",
      customerEmail: userEmail,
      companyName: companyName,
      jobTitle: jobTitle,
      planName: "Employer Job Posting",
      paymentId: jobId,
    }).catch((err) => console.warn("[Telegram Dev Alert Error]:", err));

    return NextResponse.json({ success: true, job: newJob });
  } catch (error) {
    console.error("Checkout route error:", error);
    return NextResponse.json(
      { error: "Failed to process job checkout" },
      { status: 500 }
    );
  }
}
