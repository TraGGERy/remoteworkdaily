import { NextResponse } from "next/server";
import { notifyUserOnboarding, OnboardingNotificationPayload } from "@/lib/telegram";
import { saveSubscriber } from "@/lib/subscribers-repository";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as OnboardingNotificationPayload;
    if (!body || !body.flow) {
      return NextResponse.json({ error: "Missing required onboarding flow details" }, { status: 400 });
    }

    // Persist email to persistent store & Supabase cloud DB
    if (body.email) {
      await saveSubscriber({
        email: body.email,
        category: "onboarded",
      }).catch((err) => {
        console.warn("[Onboarding API] Cloud DB sync notice:", err);
      });
    }

    // Fire Telegram notification asynchronously
    notifyUserOnboarding(body).catch((err) => {
      console.warn("[Notifications] Failed to send Telegram onboarding alert:", err);
    });

    return NextResponse.json({ success: true, message: "Onboarding event recorded" });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("[Notifications API] Error processing onboarding notification:", errorMsg);
    return NextResponse.json({ error: "Failed to process notification" }, { status: 500 });
  }
}
