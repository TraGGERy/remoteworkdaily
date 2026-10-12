#!/usr/bin/env node
/**
 * Remote Work Daily — Interactive Telegram Bot Long-Polling Runner
 *
 * Runs interactive bot polling locally so the bot works in real-time
 * without needing an external public webhook tunnel.
 * Handles /start, /latest, /stats, /sync, /help, and button callbacks.
 *
 * Usage:
 *   node scripts/telegram-bot.mjs
 */

import fs from "fs";
import path from "path";
import os from "os";

const DATA_FILE = path.join(process.cwd(), "data", "jobs.json");
const TMP_DATA_FILE = path.join(os.tmpdir(), "remotework-jobs.json");
const CONFIG_FILE = path.join(process.cwd(), "data", "telegram-config.json");
const SYNC_STATE_FILE = path.join(process.cwd(), "data", "sync-state.json");
const TMP_SYNC_STATE_FILE = path.join(os.tmpdir(), "remotework-sync-state.json");

// Load .env / .env.local
for (const envName of [".env.local", ".env"]) {
  const envPath = path.join(process.cwd(), envName);
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf8").split("\n");
    for (const l of lines) {
      const trimmed = l.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx > 0) {
        const k = trimmed.slice(0, idx).trim();
        const v = trimmed.slice(idx + 1).trim();
        if (!process.env[k]) process.env[k] = v;
      }
    }
  }
}

if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_BOT_TOKEN.trim()) {
  console.error("❌ ERROR: TELEGRAM_BOT_TOKEN is not defined in environment variables or .env.local.");
  console.error("Please configure a valid TELEGRAM_BOT_TOKEN before launching the bot runner.");
  process.exit(1);
}

const TOKEN = process.env.TELEGRAM_BOT_TOKEN.trim();

function isTelegramAdmin(chatId) {
  const adminId = (process.env.TELEGRAM_ADMIN_CHAT_ID || process.env.TELEGRAM_CHAT_ID || "").trim();
  if (!adminId) {
    if (fs.existsSync(CONFIG_FILE)) {
      try {
        const cfg = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"));
        if (cfg.chat_id) return String(chatId).trim() === String(cfg.chat_id).trim();
      } catch {}
    }
    return false;
  }
  return String(chatId).trim() === adminId;
}

function escapeHtml(text) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function saveChatId(chatId, force = false) {
  if (!force && !isTelegramAdmin(chatId)) {
    console.warn(`[Bot Security] Refusing to overwrite admin chat ID from unauthorized user: ${chatId}`);
    return;
  }
  try {
    const dir = path.dirname(CONFIG_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      CONFIG_FILE,
      JSON.stringify({ chat_id: String(chatId), updated_at: new Date().toISOString() }, null, 2),
      "utf8"
    );
    console.log(`[Bot] 💾 Saved admin chat_id ${chatId} to ${CONFIG_FILE}`);
  } catch (err) {
    console.warn("[Bot] Failed to save chat_id:", err);
  }
}

function loadJobs() {
  try {
    let target = DATA_FILE;
    if (fs.existsSync(TMP_DATA_FILE)) {
      try {
        const tmpStat = fs.statSync(TMP_DATA_FILE);
        const mainStat = fs.existsSync(DATA_FILE) ? fs.statSync(DATA_FILE) : null;
        if (!mainStat || tmpStat.mtimeMs >= mainStat.mtimeMs) {
          target = TMP_DATA_FILE;
        }
      } catch {}
    }

    if (fs.existsSync(target)) {
      const raw = JSON.parse(fs.readFileSync(target, "utf8"));
      if (Array.isArray(raw)) {
        return raw.sort((a, b) => (new Date(b.postedAt).getTime() || 0) - (new Date(a.postedAt).getTime() || 0));
      }
    }
  } catch {}
  return [];
}

function formatLatestJobs(limit = 5) {
  const jobs = loadJobs();
  const top = jobs.slice(0, limit);

  if (top.length === 0) {
    return "⚠️ <b>No jobs found in the database.</b> Please run an ingestion sync or check back soon!";
  }

  const rows = top.map((j, i) => {
    const wp = j.workplaceType ? `[${j.workplaceType.toUpperCase()}] ` : "";
    const sal = j.salaryMin && j.salaryMax ? ` • 💰 $${j.salaryMin.toLocaleString()} - $${j.salaryMax.toLocaleString()}` : "";
    const loc = j.location ? ` • 📍 ${j.location}` : "";
    return `${i + 1}. <a href="https://remoteworkdaily.com/jobs/${j.id}/${j.slug}"><b>${escapeHtml(j.title)}</b></a>\n   🏢 <b>${escapeHtml(j.company)}</b> ${wp}${sal}${loc}`;
  }).join("\n\n");

  return [
    `🔥 <b>Latest Verified Remote Jobs:</b>`,
    `━━━━━━━━━━━━━━━━━━━━`,
    rows,
    `━━━━━━━━━━━━━━━━━━━━`,
    `🌐 <a href="https://remoteworkdaily.com">Browse all ${jobs.length.toLocaleString()}+ Jobs &rarr;</a>`,
  ].join("\n");
}

function formatStats() {
  const jobs = loadJobs();
  let syncState = null;
  try {
    if (fs.existsSync(TMP_SYNC_STATE_FILE)) {
      const tmpStat = fs.statSync(TMP_SYNC_STATE_FILE);
      const mainStat = fs.existsSync(SYNC_STATE_FILE) ? fs.statSync(SYNC_STATE_FILE) : null;
      if (!mainStat || tmpStat.mtimeMs >= mainStat.mtimeMs) {
        syncState = JSON.parse(fs.readFileSync(TMP_SYNC_STATE_FILE, "utf8"));
      }
    }
    if (!syncState && fs.existsSync(SYNC_STATE_FILE)) {
      syncState = JSON.parse(fs.readFileSync(SYNC_STATE_FILE, "utf8"));
    }
  } catch {}

  const catCount = {};
  const activeVerified = jobs.filter(j => j.status !== "pending_payment" && j.status !== "archived");

  for (const j of activeVerified) {
    const cat = j.category || "other";
    catCount[cat] = (catCount[cat] || 0) + 1;
  }

  const topCats = Object.entries(catCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([c, cnt]) => `• <b>${c}:</b> ${cnt.toLocaleString()}`)
    .join("\n");

  return [
    `📊 <b>RemoteWorkDaily Board Statistics:</b>`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `💼 <b>Verified Active Jobs:</b> ${activeVerified.length.toLocaleString()}`,
    activeVerified.length !== jobs.length
      ? `📦 <b>Total Ingested Index:</b> ${jobs.length.toLocaleString()}`
      : null,
    `📅 <b>Last Sync:</b> ${syncState?.lastSyncDate || "Recent"}`,
    syncState?.syncedCount ? `📥 <b>Last Batch:</b> +${syncState.syncedCount.toLocaleString()} jobs` : null,
    `━━━━━━━━━━━━━━━━━━━━`,
    `🏷 <b>Top Disciplines:</b>\n${topCats}`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `🌐 <a href="https://remoteworkdaily.com">Visit RemoteWorkDaily</a>`,
  ].filter(Boolean).join("\n");
}

import { spawn } from "child_process";

const KEYBOARD = {
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
      { text: "🌐 Open RemoteWorkDaily", url: "https://remoteworkdaily.com" },
    ],
  ],
};

let isScrapingLocally = false;

async function triggerScraperLocally(chatId) {
  if (isScrapingLocally) {
    await sendMessage(chatId, "⏳ <b>Scraper Already in Progress!</b>\n\nAnother job ingestion scrape is actively running right now. Please wait a moment.");
    return;
  }
  isScrapingLocally = true;
  await sendMessage(
    chatId,
    [
      `🚀 <b>Scraper Triggered!</b> ⚡`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `⏳ <i>Initiating real-time ingestion across verified sources:</i>`,
      `• 🏢 Direct ATS Boards (Greenhouse, Lever, Ashby, Workable)`,
      `• 🌐 Remote job feeds (Arbeitnow, WWR, Jobicy, RemoteOK, Remotive, Himalayas, ReliefWeb)`,
      ``,
      `<i>Please wait a few moments while listings are collected, deduplicated, and indexed...</i>`,
    ].join("\n")
  );

  const startTime = Date.now();
  const child = spawn(process.execPath, [path.join(process.cwd(), "scripts", "sync-jobs.mjs"), "--force", "--target=5000"], {
    cwd: process.cwd(),
    stdio: "pipe",
  });

  child.on("close", async (code) => {
    isScrapingLocally = false;
    const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);
    let syncState = null;
    try {
      if (fs.existsSync(SYNC_STATE_FILE)) syncState = JSON.parse(fs.readFileSync(SYNC_STATE_FILE, "utf8"));
    } catch {}
    const jobs = loadJobs();

    if (code === 0) {
      await sendMessage(
        chatId,
        [
          `🎉 <b>Scraper Run Complete!</b> 🚀`,
          `━━━━━━━━━━━━━━━━━━━━`,
          `📥 <b>Newly Ingested:</b> +${(syncState?.syncedCount || 0).toLocaleString()} fresh jobs`,
          `💼 <b>Total Live Listings:</b> ${jobs.length.toLocaleString()} jobs`,
          `⏱ <b>Duration:</b> ${durationSec}s`,
          `━━━━━━━━━━━━━━━━━━━━`,
          `🌐 <a href="https://remoteworkdaily.com">Browse Live Listings</a>`,
        ].join("\n")
      );
    } else {
      await sendMessage(chatId, `⚠️ <b>Scraper process completed with exit code ${code}</b> in ${durationSec}s.`);
    }
  });

  child.on("error", async (err) => {
    isScrapingLocally = false;
    await sendMessage(chatId, `❌ <b>Failed to start scraper process:</b> ${escapeHtml(err.message)}`);
  });
}

function formatCutePaymentMessage() {
  return [
    `✨💖 <b>Yaaay! New Payment Received!</b> 🌸🎀`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `✨ <i>A lovely new customer just completed checkout!</i> 💖🧸`,
    ``,
    `💳 <b>Type:</b> 🌟 Candidate Subscription`,
    `💵 <b>Amount:</b> <code>$17.99 USD</code> 🍬`,
    `📦 <b>Plan:</b> 🌸 Monthly Pro & Early Alerts`,
    `👤 <b>Customer:</b> 💌 sarah.smith@example.com`,
    `⏱ <b>Time:</b> ${new Date().toUTCString()}`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `🎉 <b>You're doing amazing! Keep shining!</b> 🐾🍰✨`,
    `🌐 <a href="https://remoteworkdaily.com">RemoteWorkDaily Dashboard</a>`,
  ].join("\n");
}

async function sendMessage(chatId, text, replyMarkup = KEYBOARD) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
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
    return await res.json();
  } catch (err) {
    console.error("[Bot] Error sending message:", err);
  }
}

async function answerCallback(id) {
  try {
    await fetch(`https://api.telegram.org/bot${TOKEN}/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ callback_query_id: id }),
    });
  } catch {}
}

async function startBot() {
  console.log("=================================================");
  console.log("🤖 Starting RemoteWorkDaily Telegram Bot Runner  ");
  console.log("=================================================");

  // 1. Verify Bot Token
  const meRes = await fetch(`https://api.telegram.org/bot${TOKEN}/getMe`);
  const me = await meRes.json();
  if (!me.ok) {
    console.error("❌ Invalid TELEGRAM_BOT_TOKEN:", me);
    process.exit(1);
  }
  console.log(`✅ Logged in as: @${me.result.username} (${me.result.first_name})`);

  // 2. Register Commands
  await fetch(`https://api.telegram.org/bot${TOKEN}/setMyCommands`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      commands: [
        { command: "start", description: "Subscribe & link real-time job alerts" },
        { command: "scrape", description: "⚡ Trigger scrapers & fetch fresh remote jobs" },
        { command: "sync", description: "🔄 Trigger scraper ingestion pipeline" },
        { command: "latest", description: "🔥 View 5 latest verified remote jobs" },
        { command: "stats", description: "📊 View job board database statistics" },
        { command: "testpay", description: "💖 Test cute payment notification" },
        { command: "help", description: "ℹ️ Bot features and usage guide" },
      ],
    }),
  });
  console.log("✅ Commands registered with Telegram Bot API (/start, /scrape, /sync, /latest, /stats, /testpay, /help)");

  // Clear any active webhook to allow long polling
  await fetch(`https://api.telegram.org/bot${TOKEN}/deleteWebhook`);

  console.log("\n🚀 Bot is now listening for messages in real-time...");
  console.log("👉 Open https://t.me/" + me.result.username + " in Telegram and click Start!\n");

  let offset = 0;

  while (true) {
    try {
      const url = `https://api.telegram.org/bot${TOKEN}/getUpdates?offset=${offset}&timeout=20`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.ok && Array.isArray(data.result)) {
        for (const update of data.result) {
          offset = update.update_id + 1;

          // Handle button callbacks
          if (update.callback_query) {
            const cb = update.callback_query;
            const chatId = cb.message?.chat.id || cb.from.id;
            const action = cb.data;
            const isAdmin = isTelegramAdmin(chatId);
            await answerCallback(cb.id);

            if (action === "cmd_scrape" || action === "cmd_sync") {
              if (!isAdmin) {
                await sendMessage(chatId, "🔒 <b>Admin Access Required</b>\n\nOnly verified administrators can trigger scraper ingestion runs.");
                continue;
              }
              await triggerScraperLocally(chatId);
            } else if (action === "cmd_latest") {
              await sendMessage(chatId, formatLatestJobs(5));
            } else if (action === "cmd_stats") {
              await sendMessage(chatId, formatStats());
            } else if (action === "cmd_testpay") {
              if (!isAdmin) {
                await sendMessage(chatId, "🔒 <b>Admin Access Required</b>\n\nOnly verified administrators can test payment notifications.");
                continue;
              }
              await sendMessage(chatId, formatCutePaymentMessage());
            }
            continue;
          }

          // Handle incoming messages
          if (update.message && update.message.text) {
            const msg = update.message;
            const chatId = msg.chat.id;
            const text = msg.text.trim();
            const sender = msg.from?.first_name || msg.from?.username || "Friend";
            const isAdmin = isTelegramAdmin(chatId);

            console.log(`[Bot] Received message from ${sender} (chat ${chatId}, admin: ${isAdmin}): "${text}"`);

            const firstToken = text.split(/\s+/)[0].toLowerCase();
            const command = firstToken.replace(/^\//, "").split("@")[0];

            if (command === "start") {
              if (isAdmin) {
                saveChatId(chatId, true);
                const adminWelcome = [
                  `👋 <b>Hello ${escapeHtml(sender)} (Admin)!</b>`,
                  ``,
                  `Welcome to the <b>RemoteWorkDaily Bot</b> (@${me.result.username})!`,
                  ``,
                  `🔐 <b>Verified Administrator:</b> Your chat ID (<code>${chatId}</code>) is registered to receive:`,
                  `• 🚀 Daily Job Scraper & Cron sync notifications`,
                  `• 💼 Fresh verified remote job drops`,
                  `• 💰 Real-time customer checkout alerts`,
                  ``,
                  `<b>Administrative Commands:</b>`,
                  `• /scrape — ⚡ Trigger scrapers now`,
                  `• /sync — 🔄 Trigger scraper ingestion pipeline`,
                  `• /latest — 5 latest remote job postings`,
                  `• /stats — Active database metrics`,
                  `• /status — Last scraper telemetry report`,
                  `• /testpay — 💖 Test cute payment notification`,
                  `• /help — Help & guide`,
                ].join("\n");
                await sendMessage(chatId, adminWelcome);
              } else {
                const publicWelcome = [
                  `👋 <b>Hello ${escapeHtml(sender)}!</b>`,
                  ``,
                  `Welcome to <b>RemoteWorkDaily</b> (@${me.result.username})!`,
                  ``,
                  `We help remote professionals find hand-verified remote jobs across software, product, design, marketing, and more.`,
                  ``,
                  `<b>Available Commands:</b>`,
                  `• /latest — 🔥 View the latest 5 verified remote positions`,
                  `• /stats — 📊 Job board database statistics`,
                  `• /help — Help & usage guide`,
                  ``,
                  `🌐 <a href="https://remoteworkdaily.com">Browse 10,000+ Verified Remote Jobs &rarr;</a>`,
                ].join("\n");
                await sendMessage(chatId, publicWelcome);
              }
            } else if (command === "scrape" || command === "sync" || command === "runsync" || command === "crawl" || command === "harvest") {
              if (!isAdmin) {
                await sendMessage(chatId, "🔒 <b>Admin Access Required</b>\n\nOnly verified administrators can run scraper ingestion commands.");
                continue;
              }
              await triggerScraperLocally(chatId);
            } else if (command === "latest" || command === "jobs") {
              await sendMessage(chatId, formatLatestJobs(5));
            } else if (command === "stats") {
              await sendMessage(chatId, formatStats());
            } else if (command === "testpay" || command === "pay" || command === "payment") {
              if (!isAdmin) {
                await sendMessage(chatId, "🔒 <b>Admin Access Required</b>\n\nPayment testing alerts are restricted to administrators.");
                continue;
              }
              await sendMessage(chatId, formatCutePaymentMessage());
            } else if (command === "status") {
              if (!isAdmin) {
                await sendMessage(chatId, "🔒 <b>Admin Access Required</b>\n\nScraper sync telemetry is restricted to administrators.");
                continue;
              }
              let syncState = null;
              try {
                if (fs.existsSync(SYNC_STATE_FILE)) syncState = JSON.parse(fs.readFileSync(SYNC_STATE_FILE, "utf8"));
              } catch {}
              const syncReport = [
                `⏱ <b>Scraper Sync Telemetry:</b>`,
                `━━━━━━━━━━━━━━━━━━━━`,
                `📅 <b>Last Date:</b> ${syncState?.lastSyncDate || "Recent"}`,
                `🕒 <b>Timestamp:</b> ${syncState?.lastSyncTimestamp ? new Date(syncState.lastSyncTimestamp).toUTCString() : "N/A"}`,
                `📥 <b>Last Synced:</b> +${syncState?.syncedCount || 0} jobs`,
                `⚙️ <b>Source Mode:</b> ${syncState?.source || "universal-multi-source"}`,
                `━━━━━━━━━━━━━━━━━━━━`,
                `🌐 <a href="https://remoteworkdaily.com">Browse Live Listings</a>`,
              ].join("\n");
              await sendMessage(chatId, syncReport);
            } else if (command === "help") {
              const help = [
                `🤖 <b>RemoteWorkDaily Bot Commands:</b>`,
                `━━━━━━━━━━━━━━━━━━━━`,
                `• /scrape — ⚡ <b>Trigger the job scraper</b>`,
                `• /sync — 🔄 Trigger scraper ingestion pipeline`,
                `• /latest — See the latest 5 verified remote positions`,
                `• /stats — See total job board counts & categories`,
                `• /status — Check scraper sync telemetry`,
                `• /testpay — Test cute payment alert notification`,
                `• /start — Re-link this chat for alerts`,
              ].join("\n");
              await sendMessage(chatId, help);
            } else {
              await sendMessage(chatId, `💡 Tap <b>⚡ Trigger Scraper Now</b> below, or type /scrape, /latest, /stats, or /testpay!`);
            }
          }
        }
      }
    } catch (err) {
      console.warn("[Bot] Polling loop exception:", err.message);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}

async function restoreWebhookOnExit() {
  console.log("\n[Bot] Restoring production webhook before exiting...");
  try {
    const webhookUrl = "https://www.remoteworkdaily.com/api/telegram/webhook";
    await fetch(`https://api.telegram.org/bot${TOKEN}/setWebhook?url=${encodeURIComponent(webhookUrl)}&drop_pending_updates=false`);
    console.log("[Bot] ✅ Webhook restored to https://www.remoteworkdaily.com/api/telegram/webhook");
  } catch (err) {
    console.warn("[Bot] Notice restoring webhook:", err.message);
  }
  process.exit(0);
}

process.on("SIGINT", restoreWebhookOnExit);
process.on("SIGTERM", restoreWebhookOnExit);

startBot().catch((err) => {
  console.error("Bot crashed:", err);
  process.exit(1);
});
