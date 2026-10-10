import { NextResponse } from "next/server";
import {
  getTelegramBotToken,
  saveTelegramChatId,
  registerBotCommands,
  notifyPaymentReceived,
} from "@/lib/telegram";
import { getAllJobs } from "@/lib/jobs-repository";
import { getSyncState } from "@/lib/sync-tracker";
import { runDailyJobIngestionPipeline } from "@/lib/scrapers/orchestrator";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

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
  const jobs = getAllJobs(true);
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
  const jobs = getAllJobs(true);

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
        { text: "⚡ Trigger Scraper Now", callback_data: "cmd_scrape" },
        { text: "🔥 Latest 5 Jobs", callback_data: "cmd_latest" },
      ],
      [
        { text: "📊 Board Stats", callback_data: "cmd_stats" },
        { text: "💖 Test Payment Alert", callback_data: "cmd_testpay" },
      ],
      [
        { text: "🌐 Open RemoteWorkDaily", url: "https://www.remoteworkdaily.com" },
      ],
    ],
  };
}

let isScrapeRunning = false;

async function triggerScraperFromTelegram(token: string, chatId: number | string): Promise<void> {
  if (isScrapeRunning) {
    await sendTelegramReply(
      token,
      chatId,
      `⏳ <b>Scraper Already Running!</b>\n\nA job ingestion scrape is actively in progress right now. Please allow a few moments for it to finish.`,
      getMainMenuKeyboard()
    );
    return;
  }

  isScrapeRunning = true;

  try {
    // 1. Immediate acknowledgment so the user gets instant feedback
    await sendTelegramReply(
      token,
      chatId,
      [
        `🚀 <b>Scraper Triggered!</b> ⚡`,
        `━━━━━━━━━━━━━━━━━━━━`,
        `⏳ <i>Initiating real-time ingestion across verified sources:</i>`,
        `• 🏢 Direct ATS Boards (Greenhouse, Lever, Ashby, Workable)`,
        `• 🌐 Remote feeds (Arbeitnow, WeWorkRemotely, Jobicy, RemoteOK, Remotive, Himalayas, ReliefWeb)`,
        ``,
        `<i>Please wait a few moments while listings are collected, deduplicated, and indexed...</i>`,
      ].join("\n")
    );

    // 2. Execute high-capacity ingestion pipeline
    const result = await runDailyJobIngestionPipeline({
      force: true,
      targetCount: 5000,
    });

    const sourcesSummary = Object.entries(result.sources || {})
      .filter(([, count]) => count > 0)
      .map(([name, count]) => `• ${name}: <b>${count.toLocaleString()}</b>`)
      .join("\n");

    const durationSec = (result.durationMs / 1000).toFixed(1);

    // 3. Send detailed completion report
    const completionMsg = [
      `🎉 <b>Scraper Run Complete!</b> 🚀`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `📥 <b>Newly Ingested:</b> +${result.addedCount.toLocaleString()} fresh jobs`,
      `🔄 <b>Updated / Refreshed:</b> ${result.updatedCount.toLocaleString()} listings`,
      `💼 <b>Total Live Listings:</b> ${result.totalInDatabase.toLocaleString()} jobs`,
      `⏱ <b>Duration:</b> ${durationSec}s`,
      `━━━━━━━━━━━━━━━━━━━━`,
      sourcesSummary ? `📈 <b>Harvested Sources:</b>\n${sourcesSummary}\n━━━━━━━━━━━━━━━━━━━━` : null,
      `🌐 <a href="https://www.remoteworkdaily.com">Browse Live Jobs on RemoteWorkDaily &rarr;</a>`,
    ]
      .filter(Boolean)
      .join("\n");

    await sendTelegramReply(token, chatId, completionMsg, getMainMenuKeyboard());
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("[Telegram Webhook] Scraper execution error:", err);
    await sendTelegramReply(
      token,
      chatId,
      `❌ <b>Scraper Execution Failed:</b>\n<code>${escapeHtml(errorMsg)}</code>\n\nPlease try again shortly.`,
      getMainMenuKeyboard()
    );
  } finally {
    isScrapeRunning = false;
  }
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

      if (data === "cmd_scrape" || data === "cmd_sync") {
        await triggerScraperFromTelegram(token, chatId);
      } else if (data === "cmd_latest") {
        const msg = formatLatestJobsMessage(5);
        await sendTelegramReply(token, chatId, msg, getMainMenuKeyboard());
      } else if (data === "cmd_stats") {
        const msg = formatStatsMessage();
        await sendTelegramReply(token, chatId, msg, getMainMenuKeyboard());
      } else if (data === "cmd_testpay") {
        await notifyPaymentReceived({
          paymentType: "candidate_subscription",
          amount: 1799,
          currency: "USD",
          customerEmail: "sarah.smith@example.com",
          planName: "Monthly Pro & Early Alert Pass",
          paymentId: `cs_test_${Date.now().toString(36)}`,
        });
        await sendTelegramReply(
          token,
          chatId,
          `💖 <b>Cute Payment Alert Sent!</b> Check the notification right above! ✨`,
          getMainMenuKeyboard()
        );
      } else if (data === "cmd_status") {
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
          `• /scrape — ⚡ <b>Trigger the scrapers right now</b>`,
          `• /sync — 🔄 Trigger scraper ingestion pipeline`,
          `• /latest — 🔥 Get 5 freshest verified remote jobs`,
          `• /stats — 📊 View database listings & industry breakdown`,
          `• /status — ⏱ Check latest scraper telemetry`,
          `• /testpay — 💖 Test cute payment alert notification`,
          `• /help — ℹ️ Bot help & guide`,
        ].join("\n");

        await sendTelegramReply(token, chatId, welcomeText, getMainMenuKeyboard());
      } else if (command === "scrape" || command === "sync" || command === "runsync" || command === "crawl" || command === "harvest") {
        await triggerScraperFromTelegram(token, chatId);
      } else if (command === "latest" || command === "jobs") {
        const latestMsg = formatLatestJobsMessage(5);
        await sendTelegramReply(token, chatId, latestMsg, getMainMenuKeyboard());
      } else if (command === "stats") {
        const statsMsg = formatStatsMessage();
        await sendTelegramReply(token, chatId, statsMsg, getMainMenuKeyboard());
      } else if (command === "status") {
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
        await sendTelegramReply(
          token,
          chatId,
          `💖 <b>Cute Payment Alert Sent!</b> Check the notification right above! ✨`,
          getMainMenuKeyboard()
        );
      } else if (command === "help") {
        const helpMsg = [
          `🤖 <b>RemoteWorkDaily Bot Help</b>`,
          `━━━━━━━━━━━━━━━━━━━━`,
          `Tap any button below or send a command:`,
          `• /scrape — ⚡ <b>Trigger the job scraper</b>`,
          `• /sync — 🔄 Trigger ingestion pipeline`,
          `• /latest — 5 latest remote job openings`,
          `• /stats — Current job board metrics`,
          `• /status — Scraper telemetry status`,
          `• /testpay — Test cute payment alert notification`,
          `• /start — Re-link notification channel`,
        ].join("\n");
        await sendTelegramReply(token, chatId, helpMsg, getMainMenuKeyboard());
      } else {
        // Helpful hint
        const defaultMsg = `💡 Tap <b>⚡ Trigger Scraper Now</b> below, or type /scrape, /latest, /stats, or /testpay!`;
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
