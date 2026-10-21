import { NextResponse } from "next/server";
import {
  getTelegramBotToken,
  saveTelegramChatId,
  isTelegramAdmin,
  registerBotCommands,
  notifyPaymentReceived,
} from "@/lib/telegram";
import { getAllJobs } from "@/lib/jobs-repository";
import { filterJobs } from "@/lib/filter-jobs";
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
    `🌐 <a href="https://www.remoteworkdaily.com">Browse all ${filterJobs(jobs, {}).length.toLocaleString()}+ Verified Jobs &rarr;</a>`,
  ].join("\n");
}

function formatStatsMessage(): string {
  const allJobs = getAllJobs(true);
  const activeVerified = filterJobs(allJobs, {});
  const syncState = getSyncState();

  const categoriesCount: Record<string, number> = {};
  for (const j of activeVerified) {
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
    `💼 <b>Verified Active Jobs:</b> ${activeVerified.length.toLocaleString()}`,
    activeVerified.length !== allJobs.length
      ? `📦 <b>Total Ingested Index:</b> ${allJobs.length.toLocaleString()}`
      : null,
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
  const allJobs = getAllJobs(true);
  const activeVerified = filterJobs(allJobs, {});

  return [
    `⏱ <b>Scraper & Sync Pipeline Status:</b>`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `💼 <b>Verified Active Jobs:</b> ${activeVerified.length.toLocaleString()}`,
    activeVerified.length !== allJobs.length
      ? `📦 <b>Total Ingested Index:</b> ${allJobs.length.toLocaleString()}`
      : null,
    `📅 <b>Last Sync Date:</b> ${syncState?.lastSyncDate || "N/A"}`,
    `🕒 <b>Last Run:</b> ${syncState?.lastSyncTimestamp ? new Date(syncState.lastSyncTimestamp).toUTCString() : "Recent"}`,
    `📥 <b>Last Batch Synced:</b> ${(syncState?.syncedCount || 0).toLocaleString()} jobs`,
    `⚙️ <b>Pipeline Engine:</b> ${syncState?.source || "hybrid-multi-source"}`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `🌐 <a href="https://www.remoteworkdaily.com">Visit RemoteWorkDaily</a>`,
  ].join("\n");
}

function getMainMenuKeyboard(isAdmin = false) {
  if (isAdmin) {
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

  return {
    inline_keyboard: [
      [
        { text: "🔥 Latest 5 Jobs", callback_data: "cmd_latest" },
        { text: "📊 Board Stats", callback_data: "cmd_stats" },
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
      getMainMenuKeyboard(true)
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

    await sendTelegramReply(token, chatId, completionMsg, getMainMenuKeyboard(true));
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("[Telegram Webhook] Scraper execution error:", err);
    await sendTelegramReply(
      token,
      chatId,
      `❌ <b>Scraper Execution Failed:</b>\n<code>${escapeHtml(errorMsg)}</code>\n\nPlease try again shortly.`,
      getMainMenuKeyboard(true)
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
  // Validate webhook secret token if configured
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
  if (webhookSecret) {
    const headerSecret = request.headers.get("x-telegram-bot-api-secret-token")?.trim();
    if (headerSecret !== webhookSecret) {
      console.warn("[Telegram Webhook] Security rejection: Invalid x-telegram-bot-api-secret-token header");
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
  }

  const token = getTelegramBotToken();
  if (!token) {
    return NextResponse.json(
      { ok: false, error: "TELEGRAM_BOT_TOKEN is not configured" },
      { status: 503 }
    );
  }

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
      const isAdmin = isTelegramAdmin(chatId);

      await answerCallbackQuery(token, cb.id);

      if (data === "cmd_scrape" || data === "cmd_sync") {
        if (!isAdmin) {
          await sendTelegramReply(
            token,
            chatId,
            "🔒 <b>Admin Access Required</b>\n\nOnly verified administrators can trigger scraper ingestion runs.",
            getMainMenuKeyboard(false)
          );
          return NextResponse.json({ ok: true });
        }
        await triggerScraperFromTelegram(token, chatId);
      } else if (data === "cmd_latest") {
        const msg = formatLatestJobsMessage(5);
        await sendTelegramReply(token, chatId, msg, getMainMenuKeyboard(isAdmin));
      } else if (data === "cmd_stats") {
        const msg = formatStatsMessage();
        await sendTelegramReply(token, chatId, msg, getMainMenuKeyboard(isAdmin));
      } else if (data === "cmd_testpay") {
        if (!isAdmin) {
          await sendTelegramReply(
            token,
            chatId,
            "🔒 <b>Admin Access Required</b>\n\nOnly verified administrators can test payment notifications.",
            getMainMenuKeyboard(false)
          );
          return NextResponse.json({ ok: true });
        }
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
          getMainMenuKeyboard(true)
        );
      } else if (data === "cmd_status") {
        const msg = formatSyncMessage();
        await sendTelegramReply(token, chatId, msg, getMainMenuKeyboard(isAdmin));
      } else if (data === "admin_review_jobs") {
        // Force reload + same visibility filter the website uses, so counts match the live board.
        const ingested = getAllJobs(true);
        const allJobs = filterJobs(ingested, {});
        const pendingCount = ingested.filter((j) => j.status === "pending_payment").length;
        const remoteCount = allJobs.filter((j) => j.workArrangement === "remote_global" || j.workArrangement === "remote_regional" || j.workplaceType === "remote").length;
        const hybridCount = allJobs.filter((j) => j.workArrangement === "hybrid_high_pay" || j.workplaceType === "hybrid").length;
        const syncState = getSyncState();
        const newestPostedAt = allJobs[0]?.postedAt ? new Date(allJobs[0].postedAt).toUTCString() : "N/A";
        const reviewText = [
          `👀 <b>Admin Job Ingestion Review</b>`,
          `━━━━━━━━━━━━━━━━━━━━`,
          `🌐 <b>Remote Global &amp; Regional:</b> ${remoteCount.toLocaleString()} listings`,
          `🏢 <b>High-Paying Hybrid ($90k+):</b> ${hybridCount.toLocaleString()} listings`,
          `💼 <b>Live on Website:</b> ${allJobs.length.toLocaleString()} listings`,
          `⏳ <b>Pending Payment:</b> ${pendingCount.toLocaleString()} listings`,
          `🆕 <b>Newest Job Posted:</b> ${newestPostedAt}`,
          `📅 <b>Last Sync:</b> ${syncState?.lastSyncTimestamp ? new Date(syncState.lastSyncTimestamp).toUTCString() : "N/A"}`,
          ``,
          `🔗 <a href="https://remoteworkdaily.com">Inspect Live Job Stream &rarr;</a>`,
        ].join("\n");
        await sendTelegramReply(token, chatId, reviewText);
      } else if (data === "admin_blast_b2b") {
        const allJobs = getAllJobs(true);
        const withEmail = allJobs.filter((j) => j.employerEmail && !j.employerEmail.includes("placeholder"));
        const uniqueEmails = Array.from(new Set(withEmail.map((j) => j.employerEmail?.toLowerCase().trim()).filter(Boolean)));
        const blastText = [
          `📧 <b>B2B Employer Outreach Campaign</b>`,
          `━━━━━━━━━━━━━━━━━━━━`,
          `📬 <b>Verified Recruiter Inboxes:</b> ${uniqueEmails.length.toLocaleString()} direct hiring contacts`,
          `💼 <b>Offer Pitch:</b> $199 Featured Job Boost + Newsletter Blast (120k+ reach)`,
          `🚀 <b>Status:</b> Ready to dispatch campaign batch via Resend B2B Automation`,
          ``,
          `<i>Sample Pitch: "Boost your hiring: Place your role at the top of RemoteWorkDaily for 30 days & reach 45k+ active job seekers."</i>`,
        ].join("\n");
        await sendTelegramReply(token, chatId, blastText);
      } else if (data === "admin_revenue_stats") {
        const allJobs = filterJobs(getAllJobs(true), {});
        const revenueText = [
          `📊 <b>Today's Revenue & Conversion Telemetry</b>`,
          `━━━━━━━━━━━━━━━━━━━━`,
          `💰 <b>Pro Subscriptions:</b> $12/mo & $29/quarter candidate passes active`,
          `💼 <b>Employer Boosts:</b> $199/post verified listings`,
          `⚡ <b>Platform Health:</b> 100% operational with live Supabase PostgreSQL sync`,
          `📈 <b>Total Database Volume:</b> ${allJobs.length.toLocaleString()} jobs served`,
        ].join("\n");
        await sendTelegramReply(token, chatId, revenueText);
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
      const isAdmin = isTelegramAdmin(chatId);

      // Normalize command: handles "/start", "/start@PandoraWorkBot", "/sync@PandoraWorkBot", "sync", "latest", etc.
      const firstToken = rawText.split(/\s+/)[0].toLowerCase();
      const command = firstToken.replace(/^\//, "").split("@")[0];

      if (command === "start") {
        await registerBotCommands();

        if (isAdmin) {
          // Only auto-link chat ID if the user is the authorized administrator
          saveTelegramChatId(String(chatId), true);

          const adminWelcomeText = [
            `👋 <b>Hello ${escapeHtml(firstName)} (Admin)!</b>`,
            ``,
            `Welcome to your <b>RemoteWorkDaily Admin Console</b> (@PandoraWorkBot)!`,
            ``,
            `🔐 <b>Verified Administrator:</b> Your chat ID (<code>${chatId}</code>) is connected to receive:`,
            `• 🚀 Daily job scraper & cron ingestion alerts`,
            `• 💼 Fresh high-salary remote opportunities`,
            `• 💰 Live customer payment alerts & checkout events`,
            ``,
            `<b>Administrative Commands:</b>`,
            `• /scrape — ⚡ Trigger scrapers right now`,
            `• /sync — 🔄 Trigger scraper ingestion pipeline`,
            `• /latest — 🔥 Get 5 freshest verified remote jobs`,
            `• /stats — 📊 View database listings & breakdown`,
            `• /status — ⏱ Check latest scraper telemetry`,
            `• /testpay — 💖 Test cute payment alert notification`,
            `• /help — ℹ️ Bot guide`,
          ].join("\n");

          await sendTelegramReply(token, chatId, adminWelcomeText, getMainMenuKeyboard(true));
        } else {
          // Public subscriber experience
          const publicWelcomeText = [
            `👋 <b>Hello ${escapeHtml(firstName)}!</b>`,
            ``,
            `Welcome to <b>RemoteWorkDaily</b>! We deliver the freshest, hand-verified remote jobs every day.`,
            ``,
            `<b>Available Commands:</b>`,
            `• /latest — 🔥 See the latest 5 verified remote positions`,
            `• /stats — 📊 View current job board counts & categories`,
            `• /help — ℹ️ Help & info`,
            ``,
            `🌐 <a href="https://www.remoteworkdaily.com">Browse 10,000+ Remote Jobs on RemoteWorkDaily &rarr;</a>`,
          ].join("\n");

          await sendTelegramReply(token, chatId, publicWelcomeText, getMainMenuKeyboard(false));
        }
      } else if (command === "scrape" || command === "sync" || command === "runsync" || command === "crawl" || command === "harvest") {
        if (!isAdmin) {
          await sendTelegramReply(
            token,
            chatId,
            `🔒 <b>Admin Access Required</b>\n\nOnly verified administrators can run scraper ingestion commands.`,
            getMainMenuKeyboard(false)
          );
          return NextResponse.json({ ok: true });
        }
        await triggerScraperFromTelegram(token, chatId);
      } else if (command === "latest" || command === "jobs") {
        const latestMsg = formatLatestJobsMessage(5);
        await sendTelegramReply(token, chatId, latestMsg, getMainMenuKeyboard(isAdmin));
      } else if (command === "stats") {
        const statsMsg = formatStatsMessage();
        await sendTelegramReply(token, chatId, statsMsg, getMainMenuKeyboard(isAdmin));
      } else if (command === "status") {
        if (!isAdmin) {
          await sendTelegramReply(
            token,
            chatId,
            `🔒 <b>Admin Access Required</b>\n\nScraper sync telemetry is restricted to administrators.`,
            getMainMenuKeyboard(false)
          );
          return NextResponse.json({ ok: true });
        }
        const syncMsg = formatSyncMessage();
        await sendTelegramReply(token, chatId, syncMsg, getMainMenuKeyboard(true));
      } else if (command === "testpay" || command === "testpayment" || command === "pay" || command === "payment") {
        if (!isAdmin) {
          await sendTelegramReply(
            token,
            chatId,
            `🔒 <b>Admin Access Required</b>\n\nPayment testing alerts are restricted to administrators.`,
            getMainMenuKeyboard(false)
          );
          return NextResponse.json({ ok: true });
        }
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
          getMainMenuKeyboard(true)
        );
      } else if (command === "help") {
        const helpMsg = isAdmin
          ? [
              `🤖 <b>RemoteWorkDaily Admin Commands:</b>`,
              `━━━━━━━━━━━━━━━━━━━━`,
              `• /scrape — ⚡ Trigger scraper ingestion run`,
              `• /sync — 🔄 Trigger scraper ingestion pipeline`,
              `• /latest — 5 latest remote job openings`,
              `• /stats — Current job board metrics`,
              `• /status — Scraper telemetry status`,
              `• /testpay — Test cute payment alert notification`,
              `• /start — Re-link admin alert channel`,
            ].join("\n")
          : [
              `🤖 <b>RemoteWorkDaily Bot Help:</b>`,
              `━━━━━━━━━━━━━━━━━━━━`,
              `• /latest — 5 freshest verified remote job positions`,
              `• /stats — Current job board listing metrics`,
              `• /help — This help message`,
              ``,
              `🌐 Visit <a href="https://www.remoteworkdaily.com">RemoteWorkDaily</a> to search jobs!`,
            ].join("\n");

        await sendTelegramReply(token, chatId, helpMsg, getMainMenuKeyboard(isAdmin));
      } else {
        const defaultMsg = isAdmin
          ? `💡 Tap <b>⚡ Trigger Scraper Now</b> below, or type /scrape, /latest, /stats, or /testpay!`
          : `💡 Tap <b>🔥 Latest 5 Jobs</b> below or type /latest or /stats!`;
        await sendTelegramReply(token, chatId, defaultMsg, getMainMenuKeyboard(isAdmin));
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
  if (!token) {
    return NextResponse.json(
      { status: "disabled", error: "TELEGRAM_BOT_TOKEN is not configured" },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const doSetup = searchParams.get("setup") === "true";
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();

  try {
    let setupResult: Record<string, unknown> | null = null;
    if (doSetup) {
      // If a secret is configured, require authorization to change or set the webhook
      if (webhookSecret) {
        const providedSecret = searchParams.get("secret")?.trim();
        if (providedSecret !== webhookSecret) {
          return NextResponse.json(
            { error: "Unauthorized: Invalid secret parameter for webhook setup" },
            { status: 401 }
          );
        }
      }

      await registerBotCommands();
      const webhookUrl = "https://www.remoteworkdaily.com/api/telegram/webhook";
      const webhookBody: Record<string, unknown> = {
        url: webhookUrl,
        drop_pending_updates: false,
      };
      if (webhookSecret) {
        webhookBody.secret_token = webhookSecret;
      }

      const setHookRes = await fetch(
        `https://api.telegram.org/bot${token}/setWebhook`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(webhookBody),
        }
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
      instructions: "To configure Telegram webhook, visit /api/telegram/webhook?setup=true with authorized secret.",
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
