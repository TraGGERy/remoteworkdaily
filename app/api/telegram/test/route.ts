import { NextResponse } from "next/server";
import {
  getTelegramBotToken,
  getTelegramChatId,
  sendTelegramNotification,
  saveTelegramChatId,
  registerBotCommands,
  notifyPaymentReceived,
} from "@/lib/telegram";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const token = getTelegramBotToken();
  const { searchParams } = new URL(request.url);
  const explicitChatId = searchParams.get("chat_id");

  try {
    // 0. Auto-register interactive commands
    await registerBotCommands();

    if (explicitChatId && explicitChatId.trim()) {
      saveTelegramChatId(explicitChatId.trim());
    }

    // 1. Check getMe
    const meRes = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const meData = await meRes.json();

    // 2. Check getUpdates to look for any fresh messages from user
    const updatesRes = await fetch(`https://api.telegram.org/bot${token}/getUpdates`, {
      next: { revalidate: 0 },
    });
    const updatesData = await updatesRes.json();

    let discoveredChatId: string | null = explicitChatId ? explicitChatId.trim() : null;
    let senderInfo: { username?: string; first_name?: string; id?: number } | null = null;

    if (!discoveredChatId && updatesData.ok && Array.isArray(updatesData.result) && updatesData.result.length > 0) {
      for (let i = updatesData.result.length - 1; i >= 0; i--) {
        const update = updatesData.result[i];
        const chat =
          update.message?.chat ||
          update.channel_post?.chat ||
          update.my_chat_member?.chat ||
          update.callback_query?.message?.chat;

        if (chat?.id) {
          discoveredChatId = String(chat.id);
          senderInfo = {
            username: chat.username,
            first_name: chat.first_name,
            id: chat.id,
          };
          saveTelegramChatId(discoveredChatId);
          break;
        }
      }
    }

    const currentChatId = discoveredChatId || (await getTelegramChatId());

    if (!currentChatId) {
      return NextResponse.json({
        status: "waiting_for_start",
        message:
          "Bot is active, but no chat ID has been linked yet. Please open https://t.me/PandoraWorkBot in Telegram, click 'Start' or send any message, then reload this page to connect!",
        bot: meData.result,
        updatesFound: updatesData.result?.length || 0,
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
      senderInfo,
      messageSent: testResult.success,
      details: testResult,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
