import { NextResponse } from "next/server";
import { runWinBackLeadRecovery } from "@/lib/winback-service";
import { getUnconvertedLeads } from "@/lib/candidate-leads-repository";

export const dynamic = "force-dynamic";

/**
 * Win-Back Lead Recovery Campaign Endpoint
 *
 * GET /api/cron/winback - Lists unconverted leads or triggers test run
 * POST /api/cron/winback - Dispatches personalized recovery digests to unconverted leads
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const leads = getUnconvertedLeads();

  return NextResponse.json({
    success: true,
    totalUnconvertedLeads: leads.length,
    leads: leads.slice(0, 50).map((l) => ({
      email: l.email,
      source: l.source,
      status: l.status,
      targetRoles: l.target_roles,
      createdAt: l.created_at,
    })),
  });
}

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    const providedKey = searchParams.get("key");

    if (cronSecret && authHeader !== `Bearer ${cronSecret}` && providedKey !== cronSecret) {
      const host = request.headers.get("host") || "";
      const isLocal = host.includes("localhost") || host.includes("127.0.0.1");
      if (!isLocal) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const dryRun = searchParams.get("dryRun") === "true";
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : undefined;

    const stats = await runWinBackLeadRecovery({ dryRun, limit });
    return NextResponse.json({
      success: true,
      ...stats,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
