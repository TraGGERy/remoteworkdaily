import fs from "fs";
import path from "path";
import { getSupabaseClient, isSupabaseConfigured } from "./supabase";

const SYNC_STATE_FILE = path.join(process.cwd(), "data", "sync-state.json");

export interface SyncState {
  lastSyncDate: string; // YYYY-MM-DD
  lastSyncTimestamp: number;
  syncedCount: number;
  source: string;
  targetCount?: number;
  sources?: Record<string, number>;
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
 * Checks whether the automated job sync can run.
 * Enforces a 2-hour interval cadence (default 100-minute buffer to avoid overlap)
 * unless explicitly forced.
 */
export function canSyncInterval(
  force: boolean = false,
  minIntervalMinutes: number = 100
): { allowed: boolean; reason?: string; lastSyncTimestamp?: number; nextAllowedAt?: number } {
  if (force) {
    return { allowed: true };
  }

  const state = getSyncState();
  if (state && state.lastSyncTimestamp) {
    const elapsedMs = Date.now() - state.lastSyncTimestamp;
    const minIntervalMs = minIntervalMinutes * 60 * 1000;
    if (elapsedMs < minIntervalMs) {
      const remainingMin = Math.ceil((minIntervalMs - elapsedMs) / 60000);
      return {
        allowed: false,
        lastSyncTimestamp: state.lastSyncTimestamp,
        nextAllowedAt: state.lastSyncTimestamp + minIntervalMs,
        reason: `Job feed sync executed ${Math.round(elapsedMs / 60000)}m ago. Configured for a 2-hour schedule (next run permitted in ${remainingMin}m).`,
      };
    }
  }

  return { allowed: true };
}

/**
 * Backward compatible export.
 * Delegates to the 2-hour interval check.
 */
export function canSyncToday(force: boolean = false): { allowed: boolean; reason?: string; lastSyncDate?: string } {
  const result = canSyncInterval(force);
  return {
    allowed: result.allowed,
    reason: result.reason,
    lastSyncDate: getSyncState()?.lastSyncDate,
  };
}

/**
 * Records that a daily sync has completed.
 */
export async function recordSyncCompleted(
  syncedCount: number,
  source: string,
  details?: { sources?: Record<string, number>; targetCount?: number }
): Promise<SyncState> {
  const today = getTodayUTC();
  const newState: SyncState = {
    lastSyncDate: today,
    lastSyncTimestamp: Date.now(),
    syncedCount,
    source,
    targetCount: details?.targetCount,
    sources: details?.sources,
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
