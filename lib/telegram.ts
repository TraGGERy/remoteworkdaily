import fs from "fs";
import path from "path";

const DEFAULT_BOT_TOKEN = "8593165155:AAEMBF_0UvlRHUjQb4AtvoG0GHgq8lLxgjM";
const CONFIG_FILE = path.join(process.cwd(), "data", "telegram-config.json");

export function getTelegramBotToken(): string {
  return process.env.TELEGRAM_BOT_TOKEN || DEFAULT_BOT_TOKEN;
}

/**
 * Retrieve the active Telegram chat ID.
 * Hierarchy:
 * 1. Environment variable TELEGRAM_CHAT_ID
 * 2. Persistent configuration file data/telegram-config.json
 * 3. Auto-discovery via Telegram getUpdates (finds whoever clicked /start on @PandoraWorkBot)
 */
export async function getTelegramChatId(): Promise<string | null> {
  if (process.env.TELEGRAM_CHAT_ID && process.env.TELEGRAM_CHAT_ID.trim()) {
    return process.env.TELEGRAM_CHAT_ID.trim();
  }

  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const raw = fs.readFileSync(CONFIG_FILE, "utf8");
      const parsed = JSON.parse(raw);
      if (parsed.chat_id) {
        return String(parsed.chat_id);
      }
    }
  } catch (err) {
    console.warn("[Telegram] Error reading telegram-config.json:", err);
  }

  // Auto-discover from Telegram Bot API getUpdates
  try {
    const token = getTelegramBotToken();
    const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates`, {
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
  } catch (err) {
    console.warn("[Telegram] Auto-discovery via getUpdates failed:", err);
  }

  return null;
}

export function saveTelegramChatId(chatId: string): void {
  try {
    const dir = path.dirname(CONFIG_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(
      CONFIG_FILE,
      JSON.stringify(
        {
          chat_id: chatId,
          updated_at: new Date().toISOString(),
          bot_username: "PandoraWorkBot",
        },
        null,
        2
      )
    );
    console.log(`[Telegram] Saved active chat_id ${chatId} to ${CONFIG_FILE}`);
  } catch (err) {
    console.warn("[Telegram] Failed to save chat_id:", err);
  }
}

/**
 * Send an HTML formatted message to the Telegram bot.
 */
export async function sendTelegramNotification(htmlText: string): Promise<{ success: boolean; error?: string; chatId?: string }> {
  try {
    const token = getTelegramBotToken();
    const chatId = await getTelegramChatId();

    if (!chatId) {
      console.warn("[Telegram] Cannot send notification: No chat ID registered yet. Please send /start to @PandoraWorkBot.");
      return {
        success: false,
        error: "No chat ID found. Open https://t.me/PandoraWorkBot in Telegram, click Start, and retry.",
      };
    }

    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: htmlText,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });

    const result = await res.json();
    if (!result.ok) {
      console.error("[Telegram] SendMessage failed:", result.description);
      return { success: false, error: result.description, chatId };
    }

    return { success: true, chatId };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[Telegram] Unexpected notification error:", msg);
    return { success: false, error: msg };
  }
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
    `💰 <b>New Payment Received!</b>`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `💳 <b>Type:</b> ${typeLabel}`,
    `💵 <b>Amount:</b> <code>${formattedAmount}</code>`,
    payload.planName ? `📦 <b>Plan:</b> ${escapeHtml(payload.planName)}` : null,
    payload.customerEmail ? `👤 <b>Customer:</b> ${escapeHtml(payload.customerEmail)}` : null,
    payload.companyName ? `🏢 <b>Company:</b> ${escapeHtml(payload.companyName)}` : null,
    payload.jobTitle ? `📌 <b>Job Title:</b> ${escapeHtml(payload.jobTitle)}` : null,
    payload.paymentId ? `🔖 <b>ID:</b> <code>${escapeHtml(payload.paymentId)}</code>` : null,
    `⏱ <b>Time:</b> ${new Date().toUTCString()}`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `🌐 <a href="https://remoteworkdaily.com">RemoteWorkDaily Dashboard</a>`,
  ]
    .filter(Boolean)
    .join("\n");

  const res = await sendTelegramNotification(message);
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
