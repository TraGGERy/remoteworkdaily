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

const DATA_FILE = path.join(process.cwd(), "data", "jobs.json");
const CONFIG_FILE = path.join(process.cwd(), "data", "telegram-config.json");
const SYNC_STATE_FILE = path.join(process.cwd(), "data", "sync-state.json");
const DEFAULT_TOKEN = "8593165155:AAEMBF_0UvlRHUjQb4AtvoG0GHgq8lLxgjM";

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

const TOKEN = process.env.TELEGRAM_BOT_TOKEN || DEFAULT_TOKEN;

function escapeHtml(text) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function saveChatId(chatId) {
  try {
    const dir = path.dirname(CONFIG_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      CONFIG_FILE,
      JSON.stringify({ chat_id: String(chatId), updated_at: new Date().toISOString() }, null, 2),
      "utf8"
    );
    console.log(`[Bot] 💾 Saved chat_id ${chatId} to ${CONFIG_FILE}`);
  } catch (err) {
    console.warn("[Bot] Failed to save chat_id:", err);
  }
}

function loadJobs() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
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
    if (fs.existsSync(SYNC_STATE_FILE)) {
      syncState = JSON.parse(fs.readFileSync(SYNC_STATE_FILE, "utf8"));
    }
  } catch {}

  const catCount = {};
  for (const j of jobs) {
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
    `💼 <b>Total Active Listings:</b> ${jobs.length.toLocaleString()}`,
    `📅 <b>Last Sync:</b> ${syncState?.lastSyncDate || "Recent"}`,
    syncState?.syncedCount ? `📥 <b>Last Batch:</b> +${syncState.syncedCount.toLocaleString()} jobs` : null,
    `━━━━━━━━━━━━━━━━━━━━`,
    `🏷 <b>Top Disciplines:</b>\n${topCats}`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `🌐 <a href="https://remoteworkdaily.com">Visit RemoteWorkDaily</a>`,
  ].filter(Boolean).join("\n");
}

const KEYBOARD = {
  inline_keyboard: [
    [
      { text: "🔥 Latest 5 Jobs", callback_data: "cmd_latest" },
      { text: "📊 Board Stats", callback_data: "cmd_stats" },
    ],
    [
      { text: "🌐 Open RemoteWorkDaily", url: "https://remoteworkdaily.com" },
    ],
  ],
};

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
        { command: "start", description: "Subscribe to job alerts & link chat" },
        { command: "latest", description: "View 5 latest verified remote jobs" },
        { command: "stats", description: "View job board statistics" },
        { command: "sync", description: "Check sync & scraper status" },
        { command: "help", description: "Bot help and guide" },
      ],
    }),
  });
  console.log("✅ Commands registered with Telegram Bot API (/start, /latest, /stats, /sync, /help)");

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
            await answerCallback(cb.id);

            if (action === "cmd_latest") {
              await sendMessage(chatId, formatLatestJobs(5));
            } else if (action === "cmd_stats") {
              await sendMessage(chatId, formatStats());
            }
            continue;
          }

          // Handle incoming messages
          if (update.message && update.message.text) {
            const msg = update.message;
            const chatId = msg.chat.id;
            const text = msg.text.trim();
            const sender = msg.from?.first_name || msg.from?.username || "Friend";

            console.log(`[Bot] Received message from ${sender} (chat ${chatId}): "${text}"`);
            saveChatId(chatId);

            if (text === "/start" || text.startsWith("/start ")) {
              const welcome = [
                `👋 <b>Hello ${escapeHtml(sender)}!</b>`,
                ``,
                `Welcome to <b>RemoteWorkDaily Bot</b> (@${me.result.username})!`,
                ``,
                `✅ <b>Connected!</b> Your chat ID (<code>${chatId}</code>) is now registered to receive alerts:`,
                `• 🚀 Daily Job Scraper & Cron sync notifications`,
                `• 💼 Fresh verified remote job drops`,
                `• 💰 Payment confirmations`,
                ``,
                `<b>Commands:</b>`,
                `• /latest — 5 latest remote job postings`,
                `• /stats — Active database metrics`,
                `• /sync — Last scraper sync report`,
                `• /help — Help & guide`,
              ].join("\n");
              await sendMessage(chatId, welcome);
            } else if (text === "/latest") {
              await sendMessage(chatId, formatLatestJobs(5));
            } else if (text === "/stats") {
              await sendMessage(chatId, formatStats());
            } else if (text === "/sync") {
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
            } else if (text === "/help") {
              const help = [
                `🤖 <b>RemoteWorkDaily Bot Commands:</b>`,
                `━━━━━━━━━━━━━━━━━━━━`,
                `• /latest — See the latest 5 verified remote positions`,
                `• /stats — See total job board counts & categories`,
                `• /sync — Check scraper sync telemetry`,
                `• /start — Re-link this chat for alerts`,
              ].join("\n");
              await sendMessage(chatId, help);
            } else {
              await sendMessage(chatId, `💡 Type /latest to see new job openings or /stats for database metrics!`);
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

startBot().catch((err) => {
  console.error("Bot crashed:", err);
  process.exit(1);
});
