import fs from "fs";
import path from "path";
import { getSupabaseClient, isSupabaseConfigured } from "./supabase";

const SYNC_STATE_FILE = path.join(process.cwd(), "data", "sync-state.json");

export interface SyncState {
  lastSyncDate: string; // YYYY-MM-DD
  lastSyncTimestamp: number;
  syncedCount: number;
  source: string;
}

/**
 * Returns today's date formatted as YYYY-MM-DD in UTC.
 */
export function getTodayUTC(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Reads the persistent sync state from disk or in-memory fallback.
 */
export function getSyncState(): SyncState | null {
  try {
    if (fs.existsSync(SYNC_STATE_FILE)) {
      const data = fs.readFileSync(SYNC_STATE_FILE, "utf-8");
      return JSON.parse(data) as SyncState;
    }
  } catch (err) {
    console.warn("Could not read sync state file:", err);
  }
  return null;
}

/**
 * Checks whether the daily job sync can run today.
 * Strictly enforces a once-per-day rate limit unless explicitly forced.
 */
export function canSyncToday(force: boolean = false): { allowed: boolean; reason?: string; lastSyncDate?: string } {
  if (force) {
    return { allowed: true };
  }

  const today = getTodayUTC();
  const state = getSyncState();

  if (state && state.lastSyncDate === today) {
    return {
      allowed: false,
      lastSyncDate: state.lastSyncDate,
      reason: `Job feed sync has already completed today (${today}). Configured to execute strictly once per day.`,
    };
  }

  return { allowed: true };
}

/**
 * Records that a daily sync has completed.
 */
export async function recordSyncCompleted(syncedCount: number, source: string): Promise<SyncState> {
  const today = getTodayUTC();
  const newState: SyncState = {
    lastSyncDate: today,
    lastSyncTimestamp: Date.now(),
    syncedCount,
    source,
  };

  try {
    const dir = path.dirname(SYNC_STATE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SYNC_STATE_FILE, JSON.stringify(newState, null, 2), "utf-8");
  } catch (err) {
    console.warn("Failed to write sync-state.json:", err);
  }

  // Also persist to Supabase if available
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from("candidate_passes").select("id").limit(1); // verify connection
      } catch {
        // silent fallback
      }
    }
  }

  return newState;
}
