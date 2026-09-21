import { NextResponse } from "next/server";
import { z } from "zod";
import { createPlaidLinkToken } from "@/lib/plaid";

const RequestSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  userEmail: z.string().email("Valid email is required"),
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

    const parseResult = RequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { userId, userEmail } = parseResult.data;
    const linkTokenData = await createPlaidLinkToken(userId, userEmail);

    return NextResponse.json({
      success: true,
      link_token: linkTokenData.link_token,
      expiration: linkTokenData.expiration,
    });
  } catch (error) {
    console.error("Failed to create Plaid link token:", error);
    return NextResponse.json(
      { error: "Failed to initialize Plaid Link session" },
      { status: 500 }
    );
  }
}
