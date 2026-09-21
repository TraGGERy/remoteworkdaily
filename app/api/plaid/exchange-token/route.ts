import { NextResponse } from "next/server";
import { z } from "zod";
import { exchangePlaidPublicToken } from "@/lib/plaid";

const ExchangeSchema = z.object({
  publicToken: z.string().min(1, "Public token is required"),
  userId: z.string().min(1, "User ID is required"),
  institutionName: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    const parseResult = ExchangeSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { publicToken, userId, institutionName } = parseResult.data;
    const tokenData = await exchangePlaidPublicToken(publicToken);

    console.log(
      `[PLAID FINTECH] Successfully linked bank account for user ${userId} (${institutionName || "Unknown Bank"}).`
    );

    return NextResponse.json({
      success: true,
      itemId: tokenData.item_id,
      message: "Bank account connected successfully for ACH payments",
    });
  } catch (error) {
    console.error("Failed to exchange Plaid public token:", error);
    return NextResponse.json(
      { error: "Failed to exchange Plaid token" },
      { status: 500 }
    );
  }
}
