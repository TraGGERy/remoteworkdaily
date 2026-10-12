import { NextResponse } from "next/server";
import {
  getTelegramBotToken,
  getTelegramChatId,
  sendTelegramNotification,
  saveTelegramChatId,
  registerBotCommands,
  notifyPaymentReceived,
} from "@/lib/telegram";
import { runDailyJobIngestionPipeline } from "@/lib/scrapers/orchestrator";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(request: Request) {
  const token = getTelegramBotToken();
  if (!token) {
    return NextResponse.json(
      { status: "disabled", error: "TELEGRAM_BOT_TOKEN is not configured in environment variables." },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
  const providedSecret = searchParams.get("secret")?.trim();

  // In production, require admin secret to access the test endpoint
  if (process.env.NODE_ENV === "production" && webhookSecret && providedSecret !== webhookSecret) {
    return NextResponse.json({ error: "Unauthorized access to Telegram test endpoint" }, { status: 401 });
  }

  const explicitChatId = searchParams.get("chat_id");

  try {
    // 0. Auto-register interactive commands
    await registerBotCommands();

    if (explicitChatId && explicitChatId.trim()) {
      saveTelegramChatId(explicitChatId.trim(), true);
    }

    // 1. Check getMe
    const meRes = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const meData = await meRes.json();

    const currentChatId = explicitChatId?.trim() || (await getTelegramChatId());

    if (!currentChatId) {
      return NextResponse.json({
        status: "waiting_for_start",
        message:
          "Bot is active, but no admin chat ID has been linked yet. Please configure TELEGRAM_ADMIN_CHAT_ID in .env.local or visit with ?chat_id=<your_chat_id> to connect!",
        bot: meData.result,
      });
    }

    // Send cute payment notification test if requested
    if (searchParams.get("type") === "payment") {
      const paymentSent = await notifyPaymentReceived({
        paymentType: "candidate_subscription",
        amount: 1799,
        currency: "USD",
        customerEmail: "sarah.smith@example.com",
        planName: "Monthly Pro & Early Alerts",
        paymentId: `cs_test_${Date.now().toString(36)}`,
      });

      return NextResponse.json({
        status: paymentSent ? "cute_payment_alert_delivered" : "error",
        chatId: currentChatId,
        bot: meData.result,
        messageSent: paymentSent,
      });
    }

    // Trigger scraper test if requested
    if (searchParams.get("type") === "scrape" || searchParams.get("type") === "sync") {
      const result = await runDailyJobIngestionPipeline({
        force: true,
        targetCount: 5000,
      });

      return NextResponse.json({
        status: "scraper_executed_successfully",
        chatId: currentChatId,
        bot: meData.result,
        result,
      });
    }

    // Send a standard test notification
    const testResult = await sendTelegramNotification(
      `🤖 <b>Telegram Notification Bot Connected!</b>\n\n` +
      `✅ <b>Bot:</b> @${meData.result?.username || "PandoraWorkBot"}\n` +
      `🎯 <b>Status:</b> Ready for real-time alerts\n` +
      `🔔 <b>Subscribed events:</b>\n` +
      ` • 💰 All customer payments (Stripe & Plaid ACH)\n` +
      ` • 🚀 First-time user onboarding submissions\n\n` +
      `<i>RemoteWorkDaily System · ${new Date().toUTCString()}</i>`
    );

    return NextResponse.json({
      status: testResult.success ? "connected_and_tested" : "error",
      chatId: currentChatId,
      bot: meData.result,
      messageSent: testResult.success,
      details: testResult,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
