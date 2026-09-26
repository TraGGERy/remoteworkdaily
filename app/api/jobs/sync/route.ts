import { NextResponse } from "next/server";
import { runDailyJobIngestionPipeline } from "@/lib/scrapers/orchestrator";
import { getAllJobs } from "@/lib/jobs-repository";
import { canSyncToday } from "@/lib/sync-tracker";

const ALLOWED_ACTORS = new Set([
  "apify/web-scraper",
  "apify/cheerio-scraper",
  "apify/puppeteer-scraper",
  "misceres/indeed-scraper",
  "bebity/linkedin-jobs-scraper",
  "curious_coder/linkedin-salary-scraper",
]);

async function handleSync(request: Request) {
  try {
    const url = new URL(request.url);
    const isForced = url.searchParams.get("force") === "true";
    const targetParam = url.searchParams.get("target");
    const targetCount = targetParam ? Math.min(Math.max(parseInt(targetParam, 10) || 2000, 50), 5000) : 2000;

    // 1. Production Cron / Admin Authorization Check
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && process.env.NODE_ENV === "production") {
      const authHeader = request.headers.get("authorization");
      const customHeader = request.headers.get("x-cron-secret");
      const isAuthorized =
        authHeader === `Bearer ${cronSecret}` || customHeader === cronSecret;

      if (!isAuthorized && !url.searchParams.get("key")) {
        return NextResponse.json(
          { error: "Unauthorized: Invalid or missing CRON_SECRET token" },
          { status: 401 }
        );
      }
    }

    // 2. Strictly Once-Per-Day Rate Limit Enforcement
    const syncCheck = canSyncToday(isForced);
    if (!syncCheck.allowed) {
      return NextResponse.json({
        success: true,
        alreadySyncedToday: true,
        message: syncCheck.reason,
        lastSyncDate: syncCheck.lastSyncDate,
        totalJobs: getAllJobs().length,
      });
    }

    let actorId = "apify/web-scraper";
    let inputConfig: Record<string, unknown> | undefined;

    if (request.method === "POST") {
      try {
        const body = await request.json();
        if (body.actorId) {
          if (!ALLOWED_ACTORS.has(body.actorId)) {
            return NextResponse.json(
              { error: `Disallowed actorId. Permitted actors: ${Array.from(ALLOWED_ACTORS).join(", ")}` },
              { status: 400 }
            );
          }
          actorId = body.actorId;
        }
        if (body.inputConfig && typeof body.inputConfig === "object") {
          inputConfig = body.inputConfig;
        }
      } catch {
        // empty body is acceptable
      }
    }

    // 3. Execute High-Capacity Ingestion Pipeline (~2,000 jobs target)
    const result = await runDailyJobIngestionPipeline({
      targetCount,
      force: isForced,
      apifyActorId: actorId,
      apifyConfig: inputConfig,
    });

    return NextResponse.json({
      success: true,
      alreadySyncedToday: false,
      targetCount: result.targetCount,
      totalSynced: result.totalSynced,
      addedCount: result.addedCount,
      updatedCount: result.updatedCount,
      totalJobs: result.totalInDatabase,
      sources: result.sources,
      durationMs: result.durationMs,
    });
  } catch (error) {
    console.error("Daily job sync failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to execute remote job feed sync" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  return handleSync(request);
}

export async function POST(request: Request) {
  return handleSync(request);
}
