import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { verifyPlaidWebhook } from "@/lib/plaid";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const headerPayload = await headers();
    const plaidVerificationHeader = headerPayload.get("plaid-verification");

    if (!verifyPlaidWebhook(rawBody, plaidVerificationHeader)) {
      return NextResponse.json(
        { error: "Invalid Plaid webhook signature" },
        { status: 401 }
      );
    }

    let payload: Record<string, unknown> = {};
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Malformed webhook payload" }, { status: 400 });
    }

    const webhookType = payload.webhook_type;
    const webhookCode = payload.webhook_code;
    const itemId = payload.item_id;

    console.log(
      `[PLAID WEBHOOK] Received event: ${webhookType} - ${webhookCode} for item: ${itemId}`
    );

    // Handle specific Plaid events (AUTH, TRANSACTIONS, ITEM)
    if (webhookType === "AUTH" && webhookCode === "AUTOMATICALLY_VERIFIED") {
      console.log(`[PLAID WEBHOOK] Bank account verified for item: ${itemId}`);
    } else if (webhookType === "ITEM" && webhookCode === "ERROR") {
      console.warn(`[PLAID WEBHOOK] Item requires re-authentication: ${itemId}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Plaid webhook processing error:", error);
    return NextResponse.json(
      { error: "Internal webhook processing failure" },
      { status: 500 }
    );
  }
}
