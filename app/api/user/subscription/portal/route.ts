import { NextResponse } from "next/server";
import { createCustomerPortalSession } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, returnUrl } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const sessionUrl = await createCustomerPortalSession({
      email: email.toLowerCase().trim(),
      returnUrl: returnUrl || `${appUrl}/dashboard`,
    });

    if (!sessionUrl) {
      return NextResponse.json({
        url: null,
        message: "Direct billing portal is currently in standard mode. You can cancel your subscription directly here in 1 click.",
      });
    }

    return NextResponse.json({ url: sessionUrl });
  } catch (err) {
    console.error("[Billing Portal API Error]:", err);
    return NextResponse.json(
      { error: "Could not create billing portal session." },
      { status: 500 }
    );
  }
}
