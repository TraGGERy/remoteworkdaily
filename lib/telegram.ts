import fs from "fs";
import path from "path";
import os from "os";

const DEFAULT_BOT_TOKEN = "8593165155:AAEMBF_0UvlRHUjQb4AtvoG0GHgq8lLxgjM";
const DEFAULT_CHAT_ID = "8518521254";
const CONFIG_FILE = path.join(process.cwd(), "data", "telegram-config.json");
const TMP_CONFIG_FILE = path.join(os.tmpdir(), "remotework-telegram-config.json");

let inMemoryChatId: string | null = null;

export function getTelegramBotToken(): string {
  return process.env.TELEGRAM_BOT_TOKEN || DEFAULT_BOT_TOKEN;
}

/**
 * Retrieve the active Telegram chat ID.
 * Hierarchy:
 * 1. Environment variable TELEGRAM_CHAT_ID
 * 2. In-memory cache
 * 3. Persistent configuration file data/telegram-config.json or /tmp
 * 4. Auto-discovery via Telegram getUpdates (finds whoever clicked /start on @PandoraWorkBot)
 */
export async function getTelegramChatId(): Promise<string | null> {
  if (process.env.TELEGRAM_CHAT_ID && process.env.TELEGRAM_CHAT_ID.trim()) {
    return process.env.TELEGRAM_CHAT_ID.trim();
  }

  if (inMemoryChatId) {
    return inMemoryChatId;
  }

  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const raw = fs.readFileSync(CONFIG_FILE, "utf8");
      const parsed = JSON.parse(raw);
      if (parsed.chat_id) {
        inMemoryChatId = String(parsed.chat_id);
        return inMemoryChatId;
      }
    }
  } catch {
    // Read-only or missing
  }

  try {
    if (fs.existsSync(TMP_CONFIG_FILE)) {
      const raw = fs.readFileSync(TMP_CONFIG_FILE, "utf8");
      const parsed = JSON.parse(raw);
      if (parsed.chat_id) {
        inMemoryChatId = String(parsed.chat_id);
        return inMemoryChatId;
      }
    }
  } catch {
    // Ephemeral fallback
  }

  // Auto-discover from Telegram Bot API getUpdates
  try {
    const token = getTelegramBotToken();
    const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates`, {
      signal: AbortSignal.timeout(10000),
      next: { revalidate: 0 },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.ok && Array.isArray(data.result) && data.result.length > 0) {
        // Iterate backwards from latest update to find a message, channel_post, or callback
        for (let i = data.result.length - 1; i >= 0; i--) {
          const update = data.result[i];
          const chatId =
            update.message?.chat?.id ||
            update.channel_post?.chat?.id ||
            update.my_chat_member?.chat?.id ||
            update.callback_query?.message?.chat?.id;

          if (chatId) {
            const resolvedId = String(chatId);
            saveTelegramChatId(resolvedId);
            return resolvedId;
          }
        }
      }
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("[Telegram] Auto-discovery via getUpdates notice:", msg);
  }

  return DEFAULT_CHAT_ID;
}

export function saveTelegramChatId(chatId: string): void {
  inMemoryChatId = chatId;
  const payload = JSON.stringify(
    {
      chat_id: chatId,
      updated_at: new Date().toISOString(),
      bot_username: "PandoraWorkBot",
    },
    null,
    2
  );

  try {
    const dir = path.dirname(CONFIG_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE, payload);
  } catch {
    // Read-only filesystem fallback (e.g. AWS Lambda / Vercel Serverless)
    try {
      fs.writeFileSync(TMP_CONFIG_FILE, payload);
    } catch {
      // In-memory cache already updated
    }
  }
}

export interface SendTelegramOptions {
  replyMarkup?: unknown;
  disableWebPagePreview?: boolean;
  targetChatId?: string;
}

/**
 * Send an HTML formatted message to the Telegram bot.
 */
export async function sendTelegramNotification(
  htmlText: string,
  options?: SendTelegramOptions
): Promise<{ success: boolean; error?: string; chatId?: string }> {
  try {
    const token = getTelegramBotToken();
    const chatId = options?.targetChatId || (await getTelegramChatId());

    if (!chatId) {
      console.warn("[Telegram] Cannot send notification: No chat ID registered yet. Please send /start to @PandoraWorkBot.");
      return {
        success: false,
        error: "No chat ID found. Open https://t.me/PandoraWorkBot in Telegram, click Start, and retry.",
      };
    }

    const payload: Record<string, unknown> = {
      chat_id: chatId,
      text: htmlText,
      parse_mode: "HTML",
      disable_web_page_preview: options?.disableWebPagePreview ?? true,
    };

    if (options?.replyMarkup) {
      payload.reply_markup = options.replyMarkup;
    }

    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(10000),
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    if (!result.ok) {
      if (result.description?.includes("chat not found")) {
        console.warn(
          `[Telegram] Notification could not be delivered: Chat not found (chatId: ${chatId}). ` +
          `To enable alerts, ensure TELEGRAM_CHAT_ID is valid or message /start to @PandoraWorkBot.`
        );
        if (inMemoryChatId === chatId) {
          inMemoryChatId = null;
        }
      } else {
        console.warn("[Telegram] SendMessage notice:", result.description);
      }
      return { success: false, error: result.description, chatId };
    }

    return { success: true, chatId };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("[Telegram] Notification notice:", msg);
    return { success: false, error: msg };
  }
}

/**
 * Registers interactive commands with the Telegram Bot API.
 */
export async function registerBotCommands(): Promise<boolean> {
  try {
    const token = getTelegramBotToken();
    const res = await fetch(`https://api.telegram.org/bot${token}/setMyCommands`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        commands: [
          { command: "start", description: "Subscribe & link real-time job alerts" },
          { command: "latest", description: "View 5 latest verified remote jobs" },
          { command: "stats", description: "View job board database statistics" },
          { command: "sync", description: "Check scraper sync telemetry" },
          { command: "testpay", description: "Send sample cute payment alert" },
          { command: "help", description: "Bot features and usage guide" },
        ],
      }),
    });
    const data = await res.json();
    return Boolean(data.ok);
  } catch (err) {
    console.warn("[Telegram] registerBotCommands failed:", err);
    return false;
  }
}

export interface CronSyncNotificationPayload {
  added: number;
  updated: number;
  total: number;
  durationSec: number | string;
  sources: Record<string, number>;
  topNewJobs?: Array<{
    title: string;
    company: string;
    location?: string;
    salary?: string;
    url?: string;
    workplaceType?: string;
  }>;
}

/**
 * Formatted real-time notification broadcast when a cron job sync completes.
 */
export async function notifyCronSyncCompleted(payload: CronSyncNotificationPayload): Promise<boolean> {
  const topJobsFormatted = (payload.topNewJobs || [])
    .slice(0, 5)
    .map((j, i) => {
      const workplace = j.workplaceType ? `[${j.workplaceType.toUpperCase()}] ` : "";
      const salaryPart = j.salary ? ` • 💰 <i>${escapeHtml(j.salary)}</i>` : "";
      const locPart = j.location ? ` • 📍 ${escapeHtml(j.location)}` : "";
      const titleLink = j.url
        ? `<a href="${escapeHtml(j.url)}"><b>${escapeHtml(j.title)}</b></a>`
        : `<b>${escapeHtml(j.title)}</b>`;
      return `${i + 1}. ${titleLink}\n   🏢 <b>${escapeHtml(j.company)}</b> ${workplace}${salaryPart}${locPart}`;
    })
    .join("\n\n");

  const sourcesBreakdown = Object.entries(payload.sources || {})
    .filter(([_, count]) => count > 0)
    .map(([name, count]) => `• ${name}: <b>${count}</b>`)
    .join("\n");

  const message = [
    `🚀 <b>Remote Work Daily — Job Ingestion Completed!</b>`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `📥 <b>Newly Ingested:</b> +${payload.added} jobs`,
    `🔄 <b>Updated / Refreshed:</b> ${payload.updated} jobs`,
    `📊 <b>Total Active Listings:</b> ${payload.total.toLocaleString()}`,
    `⏱ <b>Duration:</b> ${payload.durationSec}s`,
    `━━━━━━━━━━━━━━━━━━━━`,
    topJobsFormatted ? `💼 <b>Top Fresh Roles Harvested:</b>\n\n${topJobsFormatted}\n━━━━━━━━━━━━━━━━━━━━` : null,
    sourcesBreakdown ? `📈 <b>Harvested Sources:</b>\n${sourcesBreakdown}\n━━━━━━━━━━━━━━━━━━━━` : null,
    `🌐 <a href="https://remoteworkdaily.com">Browse Latest Jobs on Board</a>`,
  ]
    .filter(Boolean)
    .join("\n");

  const replyMarkup = {
    inline_keyboard: [
      [
        { text: "🔥 View Latest Jobs", callback_data: "cmd_latest" },
        { text: "📊 Stats", callback_data: "cmd_stats" },
      ],
      [
        { text: "🌐 Open RemoteWorkDaily", url: "https://remoteworkdaily.com" },
      ],
    ],
  };

  const res = await sendTelegramNotification(message, { replyMarkup });
  return res.success;
}

export interface PaymentNotificationPayload {
  paymentType: "employer_job_post" | "candidate_subscription" | "candidate_hunter_pass" | "plaid_ach";
  amount?: number;
  currency?: string;
  customerEmail?: string;
  companyName?: string;
  jobTitle?: string;
  planName?: string;
  paymentId?: string;
}

/**
 * Formatted notification for when a payment is completed.
 */
export async function notifyPaymentReceived(payload: PaymentNotificationPayload): Promise<boolean> {
  const formattedAmount = payload.amount
    ? `$${(payload.amount / (payload.amount > 1000 && payload.paymentType !== "plaid_ach" ? 100 : 1)).toFixed(2)} ${payload.currency || "USD"}`
    : "Verified Payment";

  const typeLabel =
    payload.paymentType === "employer_job_post"
      ? "💼 Employer Job Posting"
      : payload.paymentType === "candidate_subscription"
      ? "🌟 Candidate Subscription"
      : payload.paymentType === "candidate_hunter_pass"
      ? "🎯 Candidate Hunter Pass"
      : "🏦 ACH Bank Transfer";

  const message = [
    `✨💖 <b>Yaaay! New Payment Received!</b> 🌸🎀`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `✨ <i>A lovely new customer just completed checkout!</i> 💖🧸`,
    ``,
    `💳 <b>Type:</b> ${typeLabel}`,
    `💵 <b>Amount:</b> <code>${formattedAmount}</code> 🍬`,
    payload.planName ? `📦 <b>Plan:</b> 🌸 ${escapeHtml(payload.planName)}` : null,
    payload.customerEmail ? `👤 <b>Customer:</b> 💌 ${escapeHtml(payload.customerEmail)}` : null,
    payload.companyName ? `🏢 <b>Company:</b> ${escapeHtml(payload.companyName)}` : null,
    payload.jobTitle ? `📌 <b>Job Title:</b> ${escapeHtml(payload.jobTitle)}` : null,
    payload.paymentId ? `🔖 <b>ID:</b> <code>${escapeHtml(payload.paymentId)}</code>` : null,
    `⏱ <b>Time:</b> ${new Date().toUTCString()}`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `🎉 <b>You're doing amazing! Keep shining!</b> 🐾🍰✨`,
    `🌐 <a href="https://www.remoteworkdaily.com">RemoteWorkDaily Dashboard</a>`,
  ]
    .filter(Boolean)
    .join("\n");

  const replyMarkup = {
    inline_keyboard: [
      [
        { text: "📊 View Board Stats", callback_data: "cmd_stats" },
        { text: "🌐 Open Site", url: "https://www.remoteworkdaily.com" },
      ],
    ],
  };

  const res = await sendTelegramNotification(message, { replyMarkup });
  return res.success;
}

export interface OnboardingNotificationPayload {
  flow: "candidate_12_step" | "visitor_modal";
  email?: string;
  targetRoles?: string[];
  experienceLevel?: string;
  salaryExpectation?: string;
  jobTypes?: string[];
  platformsTried?: string[];
  hasResume?: string;
  tailorsResume?: string;
  selectedPlan?: string;
}

/**
 * Formatted notification for when a user goes through onboarding for the first time.
 */
export async function notifyUserOnboarding(payload: OnboardingNotificationPayload): Promise<boolean> {
  const flowLabel =
    payload.flow === "candidate_12_step"
      ? "🧭 12-Step Career Hound Onboarding"
      : "✨ Homepage First-Time Visitor Modal";

  const lines = [
    `🎉 <b>First-Time User Onboarding!</b>`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `📋 <b>Flow:</b> ${flowLabel}`,
    payload.email ? `📧 <b>Email:</b> ${escapeHtml(payload.email)}` : null,
    payload.targetRoles && payload.targetRoles.length > 0
      ? `🎯 <b>Target Roles:</b> ${escapeHtml(payload.targetRoles.join(", "))}`
      : null,
    payload.experienceLevel
      ? `📈 <b>Experience:</b> ${escapeHtml(payload.experienceLevel)}`
      : null,
    payload.salaryExpectation
      ? `💵 <b>Target Salary:</b> ${escapeHtml(payload.salaryExpectation)}`
      : null,
    payload.jobTypes && payload.jobTypes.length > 0
      ? `🏢 <b>Workplace:</b> ${escapeHtml(payload.jobTypes.join(", "))}`
      : null,
    payload.platformsTried && payload.platformsTried.length > 0
      ? `🌐 <b>Platforms Tried:</b> ${escapeHtml(payload.platformsTried.join(", "))}`
      : null,
    payload.hasResume ? `📄 <b>Has Resume:</b> ${escapeHtml(payload.hasResume)}` : null,
    payload.selectedPlan ? `📦 <b>Selected Plan:</b> ${escapeHtml(payload.selectedPlan)}` : null,
    `⏱ <b>Time:</b> ${new Date().toUTCString()}`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `⚡ <i>Automated real-time lead notification</i>`,
  ];

  const message = lines.filter(Boolean).join("\n");
  const res = await sendTelegramNotification(message);
  return res.success;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
