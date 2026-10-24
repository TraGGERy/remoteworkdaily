import fs from "fs";
import path from "path";
import { getSupabaseClient, isSupabaseConfigured } from "./supabase";

export interface CandidatePassRecord {
  id: string;
  email: string;
  amount: number;
  currency: string;
  stripe_session_id?: string | null;
  stripe_payment_intent?: string | null;
  status: "active" | "refunded" | "expired";
  plan: string;
  created_at: string;
  last_digest_sent_at?: string | null;
  target_roles?: string[];
  selected_categories?: string[];
  saved_job_ids?: string[];
  min_salary?: number;
  preferred_location?: string;
}

const DATA_FILE = path.join(process.cwd(), "data", "candidate-passes.json");
let memoryCache: Map<string, CandidatePassRecord> | null = null;

function ensureCache(): Map<string, CandidatePassRecord> {
  if (memoryCache) return memoryCache;

  memoryCache = new Map();
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, "utf-8");
      const records = JSON.parse(content) as CandidatePassRecord[];
      if (Array.isArray(records)) {
        for (const r of records) {
          if (r.email) {
            memoryCache.set(r.email.toLowerCase().trim(), r);
          }
        }
      }
    }
  } catch (err) {
    console.warn("[Candidate Passes] Could not read local passes file:", err);
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
    console.warn("[Candidate Passes] Could not persist passes to disk:", err);
  }
}

/**
 * Saves or updates a candidate pass locally and syncs to Supabase if reachable.
 */
export async function saveCandidatePass(pass: {
  email: string;
  amount: number;
  currency?: string;
  stripe_session_id?: string | null;
  stripe_payment_intent?: string | null;
  status?: "active" | "refunded" | "expired";
  plan?: string;
  target_roles?: string[];
  selected_categories?: string[];
  saved_job_ids?: string[];
  min_salary?: number;
  preferred_location?: string;
}): Promise<CandidatePassRecord> {
  const cache = ensureCache();
  const normalizedEmail = pass.email.toLowerCase().trim();
  const existing = cache.get(normalizedEmail);

  const record: CandidatePassRecord = {
    id: existing?.id || `pass_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    email: normalizedEmail,
    amount: pass.amount,
    currency: (pass.currency || existing?.currency || "USD").toUpperCase(),
    stripe_session_id: pass.stripe_session_id || existing?.stripe_session_id || null,
    stripe_payment_intent: pass.stripe_payment_intent || existing?.stripe_payment_intent || null,
    status: pass.status || existing?.status || "active",
    plan: pass.plan || existing?.plan || "monthly",
    created_at: existing?.created_at || new Date().toISOString(),
    last_digest_sent_at: existing?.last_digest_sent_at || null,
    target_roles: pass.target_roles || existing?.target_roles || [],
    selected_categories: pass.selected_categories || existing?.selected_categories || [],
    saved_job_ids: pass.saved_job_ids || existing?.saved_job_ids || [],
    min_salary: pass.min_salary ?? existing?.min_salary ?? 0,
    preferred_location: pass.preferred_location || existing?.preferred_location || "Worldwide",
  };

  // 1. Instant local persistence
  cache.set(normalizedEmail, record);
  persistToDisk();

  // 2. Cloud DB Sync to Supabase
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from("candidate_passes").upsert(
          {
            email: normalizedEmail,
            amount: record.amount,
            currency: record.currency,
            stripe_session_id: record.stripe_session_id,
            stripe_payment_intent: record.stripe_payment_intent,
            status: record.status,
            plan: record.plan,
          },
          { onConflict: "stripe_session_id" }
        );
      } catch (err) {
        console.warn("[Supabase Sync Notice] Cloud DB unreachable, saved to persistent local store:", err);
      }
    }
  }

  return record;
}

/**
 * Retrieves the candidate pass for an email.
 * Checks local persistent store first, then attempts cloud DB.
 */
export async function getActiveCandidatePass(email: string): Promise<CandidatePassRecord | null> {
  if (!email) return null;
  const normalizedEmail = email.toLowerCase().trim();
  const cache = ensureCache();

  // Check local persistent database first
  const local = cache.get(normalizedEmail);
  if (local && local.status === "active") {
    return local;
  }

  // Fallback to Supabase if configured
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("candidate_passes")
          .select("id, email, amount, currency, stripe_session_id, stripe_payment_intent, status, created_at, plan")
          .ilike("email", normalizedEmail)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          const cloudRecord: CandidatePassRecord = {
            id: data.id,
            email: data.email,
            amount: Number(data.amount) || 0,
            currency: data.currency || "USD",
            stripe_session_id: data.stripe_session_id,
            stripe_payment_intent: data.stripe_payment_intent,
            status: data.status,
            plan: data.plan || "monthly",
            created_at: data.created_at || new Date().toISOString(),
          };
          cache.set(normalizedEmail, cloudRecord);
          persistToDisk();
          return cloudRecord;
        }
      } catch (err) {
        console.warn("[Candidate Pass Check] Supabase check bypassed, using local store:", err);
      }
    }
  }

  return null;
}

/**
 * Marks a candidate pass as expired (e.g. on subscription cancellation).
 */
export async function expireCandidatePass(email: string): Promise<boolean> {
  if (!email) return false;
  const normalizedEmail = email.toLowerCase().trim();
  const cache = ensureCache();
  const existing = cache.get(normalizedEmail);

  if (existing) {
    existing.status = "expired";
    persistToDisk();
  }

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase
          .from("candidate_passes")
          .update({ status: "expired" })
          .ilike("email", normalizedEmail);
      } catch (err) {
        console.warn("[Candidate Pass Expire] Supabase update bypassed:", err);
      }
    }
  }

  return true;
}

/**
 * Permanently removes candidate pass records for an email upon account deletion.
 * Ensures no orphan entitlement data remains in local cache or cloud database.
 */
export async function deleteCandidatePass(email: string): Promise<boolean> {
  if (!email) return false;
  const normalizedEmail = email.toLowerCase().trim();
  const cache = ensureCache();
  cache.delete(normalizedEmail);
  persistToDisk();

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase
          .from("candidate_passes")
          .delete()
          .ilike("email", normalizedEmail);
      } catch (err) {
        console.warn("[Candidate Pass Delete] Supabase delete bypassed:", err);
      }
    }
  }

  return true;
}

/**
 * Returns all currently active candidate passes.
 */
export function getAllActiveCandidatePasses(): CandidatePassRecord[] {
  const cache = ensureCache();
  return Array.from(cache.values()).filter((p) => p.status === "active");
}

/**
 * Updates the last digest sent timestamp for a candidate pass.
 */
export async function updateCandidatePassDigestSent(
  email: string,
  sentAt?: string
): Promise<boolean> {
  if (!email) return false;
  const normalizedEmail = email.toLowerCase().trim();
  const cache = ensureCache();
  const existing = cache.get(normalizedEmail);

  if (existing) {
    existing.last_digest_sent_at = sentAt || new Date().toISOString();
    persistToDisk();
    return true;
  }
  return false;
}

/**
 * Updates selected roles, categories, salary preferences, or saved job IDs for a candidate pass.
 */
export async function updateCandidatePassPreferences(
  email: string,
  prefs: {
    target_roles?: string[];
    selected_categories?: string[];
    min_salary?: number;
    preferred_location?: string;
    saved_job_ids?: string[];
  }
): Promise<CandidatePassRecord | null> {
  if (!email) return null;
  const normalizedEmail = email.toLowerCase().trim();
  const cache = ensureCache();
  const existing = cache.get(normalizedEmail);

  if (existing) {
    if (prefs.target_roles !== undefined) existing.target_roles = prefs.target_roles;
    if (prefs.selected_categories !== undefined) existing.selected_categories = prefs.selected_categories;
    if (prefs.min_salary !== undefined) existing.min_salary = prefs.min_salary;
    if (prefs.preferred_location !== undefined) existing.preferred_location = prefs.preferred_location;
    if (prefs.saved_job_ids !== undefined) existing.saved_job_ids = prefs.saved_job_ids;
    persistToDisk();
    return existing;
  }
  return null;
}



