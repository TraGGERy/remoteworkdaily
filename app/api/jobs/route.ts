import { NextResponse } from "next/server";
import { getAllJobs, filterJobs } from "@/lib/jobs-repository";
import { FilterState } from "@/lib/types";
import { canSyncInterval } from "@/lib/sync-tracker";
import { runDailyJobIngestionPipeline } from "@/lib/scrapers/orchestrator";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

let isBackgroundSyncing = false;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const shouldSync = searchParams.get("sync") === "true";
  const shouldRefresh = shouldSync || searchParams.get("refresh") === "true" || searchParams.has("_t");
  const query = searchParams.get("search") || "";
  const location = searchParams.get("location") || "";
  const category = searchParams.get("category") || "";
  const minSalary = Number(searchParams.get("salary")) || 0;
  const benefits = searchParams.get("benefits") ? searchParams.get("benefits")!.split(",") : [];
  const tags = searchParams.get("tags") ? searchParams.get("tags")!.split(",") : [];
  const sortBy = (searchParams.get("sort") as FilterState["sortBy"]) || "default";
  const freshness = (searchParams.get("freshness") as FilterState["freshness"]) || "all";
  const directAtsOnly = searchParams.get("directAtsOnly") === "true";
  const workplace = (searchParams.get("workplace") as FilterState["workplaceType"]) || undefined;

  // 1. Explicit on-demand sync from "Check for New Jobs" button
  if (shouldSync && !isBackgroundSyncing) {
    isBackgroundSyncing = true;
    try {
      await runDailyJobIngestionPipeline({ force: true, targetCount: 1500 });
    } catch (err) {
      console.warn("[Jobs API] Explicit on-demand sync error:", err);
    } finally {
      isBackgroundSyncing = false;
    }
  } else if (!isBackgroundSyncing && !process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
    // 2. Stale-While-Revalidate (local / VM environments only)
    const intervalCheck = canSyncInterval(false);
    if (intervalCheck.allowed) {
      isBackgroundSyncing = true;
      runDailyJobIngestionPipeline({ force: false, targetCount: 1500 })
        .catch((err) => console.warn("[Jobs API] Background auto-sync notice:", err))
        .finally(() => {
          isBackgroundSyncing = false;
        });
    }
  }

  const allJobs = getAllJobs(shouldRefresh || shouldSync);
  const filtered = filterJobs(allJobs, {
    query,
    location,
    category,
    workplaceType: workplace,
    minSalary,
    benefits,
    tags,
    sortBy,
    freshness,
    directAtsOnly,
  });

  return NextResponse.json({
    count: filtered.length,
    jobs: filtered,
    syncedAt: new Date().toISOString(),
  });
}
