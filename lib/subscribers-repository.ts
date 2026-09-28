import fs from "fs";
import path from "path";
import { getSupabaseClient, isSupabaseConfigured } from "./supabase";

export interface SubscriberRecord {
  id: string;
  email: string;
  category: string;
  status: "active" | "unsubscribed";
  created_at: string;
  updated_at: string;
}

const DATA_FILE = path.join(process.cwd(), "data", "subscribers.json");
let memoryCache: Map<string, SubscriberRecord> | null = null;

function ensureCache(): Map<string, SubscriberRecord> {
  if (memoryCache) return memoryCache;

  memoryCache = new Map();
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, "utf-8");
      const records = JSON.parse(content) as SubscriberRecord[];
      if (Array.isArray(records)) {
        for (const r of records) {
          if (r.email) {
            memoryCache.set(r.email.toLowerCase().trim(), r);
          }
        }
      }
    }
  } catch (err) {
    console.warn("[Subscribers] Could not read local subscribers file:", err);
  }
  return memoryCache;
}

function persistToDisk() {
  if (!memoryCache) return;
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const array = Array.from(memoryCache.values());
    fs.writeFileSync(DATA_FILE, JSON.stringify(array, null, 2), "utf-8");
  } catch (err) {
    console.warn("[Subscribers] Could not persist subscribers to disk:", err);
  }
}

/**
 * Saves or updates a subscriber in the local database and syncs to Supabase if reachable.
 */
export async function saveSubscriber(sub: {
  email: string;
  category?: string;
  status?: "active" | "unsubscribed";
}): Promise<SubscriberRecord> {
  const cache = ensureCache();
  const normalizedEmail = sub.email.toLowerCase().trim();
  const existing = cache.get(normalizedEmail);

  const now = new Date().toISOString();
  const record: SubscriberRecord = {
    id: existing?.id || `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    email: normalizedEmail,
    category: sub.category || existing?.category || "all",
    status: sub.status || existing?.status || "active",
    created_at: existing?.created_at || now,
    updated_at: now,
  };

  // 1. Instant local persistence
  cache.set(normalizedEmail, record);
  persistToDisk();

  // 2. Cloud DB Sync to Supabase
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from("subscribers").upsert(
          {
            email: normalizedEmail,
            category: record.category,
            status: record.status,
            updated_at: record.updated_at,
          },
          { onConflict: "email" }
        );
      } catch (err) {
        console.warn("[Supabase Sync Notice] Cloud DB unreachable, saved to persistent local store:", err);
      }
    }
  }

  return record;
}

/**
 * Retrieves a subscriber by email.
 */
export function getSubscriber(email: string): SubscriberRecord | null {
  if (!email) return null;
  const cache = ensureCache();
  return cache.get(email.toLowerCase().trim()) || null;
}

/**
 * Returns total active subscribers count.
 */
export function getSubscribersCount(): number {
  const cache = ensureCache();
  let count = 0;
  for (const sub of cache.values()) {
    if (sub.status === "active") count++;
  }
  return count;
}
