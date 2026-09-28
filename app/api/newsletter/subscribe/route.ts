import { NextResponse } from "next/server";
import { z } from "zod";
import { saveSubscriber } from "@/lib/subscribers-repository";
import { sendJobAlertWelcomeEmail } from "@/lib/email/resend";

export const dynamic = "force-dynamic";

const SubscribeSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
  category: z.string().optional().default("all"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = SubscribeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { email, category } = result.data;
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Persist to local JSON database and sync to Supabase
    await saveSubscriber({
      email: normalizedEmail,
      category,
    });

    // 2. Dispatch Welcome Email via Resend
    const emailResult = await sendJobAlertWelcomeEmail({
      email: normalizedEmail,
      category,
    });

    return NextResponse.json({
      success: true,
      message: "You're subscribed! Check your inbox for your first remote job digest.",
      emailDelivery: emailResult.success ? "delivered" : "queued",
    });
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process subscription. Please try again." },
      { status: 500 }
    );
  }
}
