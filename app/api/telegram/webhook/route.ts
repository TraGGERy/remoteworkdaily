import { NextResponse } from "next/server";
import {
  getTelegramBotToken,
  saveTelegramChatId,
  registerBotCommands,
  notifyPaymentReceived,
} from "@/lib/telegram";
import { getAllJobs } from "@/lib/jobs-repository";
import { getSyncState } from "@/lib/sync-tracker";

export const dynamic = "force-dynamic";

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from?: { id: number; first_name?: string; username?: string };
    chat: { id: number; type: string; title?: string; username?: string };
    text?: string;
    date: number;
  };
  callback_query?: {
    id: string;
    from: { id: number; first_name?: string; username?: string };
    message?: {
      message_id: number;
      chat: { id: number };
    };
    data?: string;
  };
}

async function sendTelegramReply(
  token: string,
  chatId: number | string,
  text: string,
  replyMarkup?: unknown
) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
        reply_markup: replyMarkup,
      }),
    });
    if (!res.ok) {
      const errBody = await res.text();
      console.error("[Telegram Webhook] sendMessage failed:", res.status, errBody);
    }
  } catch (err) {
    console.error("[Telegram Webhook] sendReply network error:", err);
  }
}

async function answerCallbackQuery(token: string, callbackQueryId: string, text?: string) {
  try {
    await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text: text || "Processing...",
      }),
    });
  } catch (err) {
    console.error("[Telegram Webhook] answerCallback error:", err);
  }
}

function formatLatestJobsMessage(limit: number = 5): string {
  const jobs = getAllJobs(true);
  const topJobs = jobs.slice(0, limit);

  if (topJobs.length === 0) {
    return "⚠️ <b>No jobs found in the database.</b> Please run a sync or check back soon!";
  }

  const jobRows = topJobs.map((j, i) => {
    const workplace = j.workplaceType ? `[${j.workplaceType.toUpperCase()}] ` : "";
    const salary = j.salaryMin && j.salaryMax
      ? ` • 💰 $${j.salaryMin.toLocaleString()} - $${j.salaryMax.toLocaleString()}`
      : "";
    const loc = j.location ? ` • 📍 ${j.location}` : "";
    const link = `https://www.remoteworkdaily.com/jobs/${j.id}/${j.slug}`;

    return `${i + 1}. <a href="${link}"><b>${escapeHtml(j.title)}</b></a>\n   🏢 <b>${escapeHtml(j.company)}</b> ${workplace}${salary}${loc}`;
  }).join("\n\n");

  return [
    `🔥 <b>Latest Verified Remote Jobs:</b>`,
    `━━━━━━━━━━━━━━━━━━━━`,
    jobRows,
    `━━━━━━━━━━━━━━━━━━━━`,
    `🌐 <a href="https://www.remoteworkdaily.com">Browse all ${jobs.length.toLocaleString()}+ Jobs &rarr;</a>`,
  ].join("\n");
}

function formatStatsMessage(): string {
  const jobs = getAllJobs();
  const syncState = getSyncState();

  const categoriesCount: Record<string, number> = {};
  for (const j of jobs) {
    const cat = j.category || "other";
    categoriesCount[cat] = (categoriesCount[cat] || 0) + 1;
  }

  const topCategories = Object.entries(categoriesCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([cat, count]) => `• <b>${cat}:</b> ${count.toLocaleString()}`)
    .join("\n");

  return [
    `📊 <b>RemoteWorkDaily Board Statistics:</b>`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `💼 <b>Total Active Listings:</b> ${jobs.length.toLocaleString()}`,
    `📅 <b>Last Sync:</b> ${syncState?.lastSyncDate || "Recent"}`,
    syncState?.syncedCount ? `📥 <b>Last Ingestion Batch:</b> ${syncState.syncedCount.toLocaleString()} jobs` : null,
    `━━━━━━━━━━━━━━━━━━━━`,
    `🏷 <b>Top Disciplines:</b>\n${topCategories}`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `🌐 <a href="https://www.remoteworkdaily.com">Visit RemoteWorkDaily</a>`,
  ].filter(Boolean).join("\n");
}

function formatSyncMessage(): string {
  const syncState = getSyncState();
  const jobs = getAllJobs();

  return [
    `⏱ <b>Scraper & Sync Pipeline Status:</b>`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `💼 <b>Total Live Listings:</b> ${jobs.length.toLocaleString()}`,
    `📅 <b>Last Sync Date:</b> ${syncState?.lastSyncDate || "N/A"}`,
    `🕒 <b>Last Run:</b> ${syncState?.lastSyncTimestamp ? new Date(syncState.lastSyncTimestamp).toUTCString() : "Recent"}`,
    `📥 <b>Last Batch Synced:</b> ${(syncState?.syncedCount || 0).toLocaleString()} jobs`,
    `⚙️ <b>Pipeline Engine:</b> ${syncState?.source || "hybrid-multi-source"}`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `🌐 <a href="https://www.remoteworkdaily.com">Visit RemoteWorkDaily</a>`,
  ].join("\n");
}

function getMainMenuKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: "🔥 Latest 5 Jobs", callback_data: "cmd_latest" },
        { text: "📊 Board Stats", callback_data: "cmd_stats" },
      ],
      [
        { text: "⏱ Scraper Status", callback_data: "cmd_sync" },
        { text: "🌐 Open Site", url: "https://www.remoteworkdaily.com" },
      ],
    ],
  };
}

function escapeHtml(text: string): string {
  return (text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function POST(request: Request) {
  const token = getTelegramBotToken();

  try {
    const update = (await request.json()) as TelegramUpdate;
    if (!update) {
      return NextResponse.json({ ok: false, error: "Empty update" }, { status: 400 });
    }

    // 1. Handle Inline Button Callback Queries
    if (update.callback_query) {
      const cb = update.callback_query;
      const chatId = cb.message?.chat.id || cb.from.id;
      const data = cb.data || "";

      await answerCallbackQuery(token, cb.id);

      if (data === "cmd_latest") {
        const msg = formatLatestJobsMessage(5);
        await sendTelegramReply(token, chatId, msg, getMainMenuKeyboard());
      } else if (data === "cmd_stats") {
        const msg = formatStatsMessage();
        await sendTelegramReply(token, chatId, msg, getMainMenuKeyboard());
      } else if (data === "cmd_sync") {
        const msg = formatSyncMessage();
        await sendTelegramReply(token, chatId, msg, getMainMenuKeyboard());
      }

      return NextResponse.json({ ok: true });
    }

    // 2. Handle Text Messages
    if (update.message) {
      const msg = update.message;
      const rawText = msg.text?.trim();
      if (!rawText) {
        return NextResponse.json({ ok: true });
      }
      const chatId = msg.chat.id;
      const firstName = msg.from?.first_name || "there";

      // Auto-save chat ID for real-time notifications
      saveTelegramChatId(String(chatId));

      // Normalize command: handles "/start", "/start@PandoraWorkBot", "/sync@PandoraWorkBot", "sync", "latest", etc.
      const firstToken = rawText.split(/\s+/)[0].toLowerCase();
      const command = firstToken.replace(/^\//, "").split("@")[0];

      if (command === "start") {
        await registerBotCommands();
        const welcomeText = [
          `👋 <b>Hello ${escapeHtml(firstName)}!</b>`,
          ``,
          `Welcome to the official <b>RemoteWorkDaily Bot</b> (@PandoraWorkBot)!`,
          ``,
          `✅ <b>Connected!</b> Your chat ID (<code>${chatId}</code>) is registered to receive real-time updates:`,
          `• 🚀 Daily job scraper & cron ingestion alerts`,
          `• 💼 Fresh high-salary remote opportunities`,
          `• 💰 Payment confirmations`,
          ``,
          `<b>Available Commands:</b>`,
          `• /latest — Get the 5 freshest verified remote jobs`,
          `• /stats — View database listings & industry breakdown`,
          `• /sync — Check latest scraper status`,
          `• /testpay — Test cute payment alert notification`,
          `• /help — Bot help & guide`,
        ].join("\n");

        await sendTelegramReply(token, chatId, welcomeText, getMainMenuKeyboard());
      } else if (command === "latest" || command === "jobs") {
        const latestMsg = formatLatestJobsMessage(5);
        await sendTelegramReply(token, chatId, latestMsg, getMainMenuKeyboard());
      } else if (command === "stats") {
        const statsMsg = formatStatsMessage();
        await sendTelegramReply(token, chatId, statsMsg, getMainMenuKeyboard());
      } else if (command === "sync" || command === "status") {
        const syncMsg = formatSyncMessage();
        await sendTelegramReply(token, chatId, syncMsg, getMainMenuKeyboard());
      } else if (command === "testpay" || command === "testpayment" || command === "pay" || command === "payment") {
        await notifyPaymentReceived({
          paymentType: "candidate_subscription",
          amount: 1799,
          currency: "USD",
          customerEmail: "sarah.smith@example.com",
          planName: "Monthly Pro & Early Alert Pass",
          paymentId: `cs_test_${Date.now().toString(36)}`,
        });
        return NextResponse.json({ ok: true });
      } else if (command === "help") {
        const helpMsg = [
          `🤖 <b>RemoteWorkDaily Bot Help</b>`,
          `━━━━━━━━━━━━━━━━━━━━`,
          `Use the buttons below or commands:`,
          `• /latest — 5 latest remote job openings`,
          `• /stats — Current job board metrics`,
          `• /sync — Ingestion pipeline & sync status`,
          `• /testpay — Test cute payment alert notification`,
          `• /start — Re-link notification channel`,
        ].join("\n");
        await sendTelegramReply(token, chatId, helpMsg, getMainMenuKeyboard());
      } else {
        // Echo / helpful hint
        const defaultMsg = `💡 Use /latest to see the latest jobs, /stats for board statistics, /sync for scraper status, or /testpay for a cute payment alert!`;
        await sendTelegramReply(token, chatId, defaultMsg, getMainMenuKeyboard());
      }

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("[Telegram Webhook] Error:", errorMsg);
    return NextResponse.json({ ok: false, error: errorMsg }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const token = getTelegramBotToken();
  const { searchParams } = new URL(request.url);
  const doSetup = searchParams.get("setup") === "true";

  try {
    let setupResult: Record<string, unknown> | null = null;
    if (doSetup) {
      await registerBotCommands();
      const webhookUrl = "https://www.remoteworkdaily.com/api/telegram/webhook";
      const setHookRes = await fetch(
        `https://api.telegram.org/bot${token}/setWebhook?url=${encodeURIComponent(webhookUrl)}&drop_pending_updates=false`
      );
      setupResult = await setHookRes.json();
    }

    const meRes = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const meData = await meRes.json();
    const webhookRes = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
    const webhookData = await webhookRes.json();

    return NextResponse.json({
      status: "ready",
      bot: meData.result,
      webhook: webhookData.result,
      setupResult,
      instructions: "To configure Telegram webhook, visit /api/telegram/webhook?setup=true or call setWebhook via Telegram API.",
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
