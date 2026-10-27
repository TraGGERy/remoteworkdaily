import fs from "fs";
import path from "path";
import { getSupabaseClient, isSupabaseConfigured } from "./supabase";

export type LeadSource =
  | "onboarding_step_8"
  | "onboarding_abandoned_checkout"
  | "apply_modal"
  | "visitor_modal"
  | "employer_job_post_draft"
  | "newsletter_popup";

export interface CandidateLead {
  id: string;
  email: string;
  source: LeadSource;
  status: "new" | "contacted" | "converted" | "unsubscribed";
  target_roles?: string[];
  seniority?: string;
  min_salary?: number;
  work_type?: string;
  work_arrangement?: string;
  frustrations?: string[];
  platforms_tried?: string[];
  selected_plan?: string;
  job_id?: string;
  job_title?: string;
  company_name?: string;
  ml_visitor_id?: string;
  ml_session_id?: string;
  created_at: string;
  updated_at: string;
}

const DATA_FILE = path.join(process.cwd(), "data", "candidate-leads.json");
let memoryCache: Map<string, CandidateLead> | null = null;

function ensureCache(): Map<string, CandidateLead> {
  if (memoryCache) return memoryCache;

  memoryCache = new Map();
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, "utf-8");
      const records = JSON.parse(content) as CandidateLead[];
      if (Array.isArray(records)) {
        for (const r of records) {
          if (r.email) {
            memoryCache.set(r.email.toLowerCase().trim(), r);
          }
        }
      }
    }
  } catch (err) {
    console.warn("[Candidate Leads] Could not read local leads file:", err);
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
    console.warn("[Candidate Leads] Could not persist leads to disk:", err);
  }
}

/**
 * Saves or updates a candidate lead in local storage and Supabase.
 */
export async function saveCandidateLead(
  lead: Partial<CandidateLead> & { email: string; source: LeadSource }
): Promise<CandidateLead> {
  const cache = ensureCache();
  const normalizedEmail = lead.email.toLowerCase().trim();
  const existing = cache.get(normalizedEmail);
  const now = new Date().toISOString();

  const record: CandidateLead = {
    id: existing?.id || `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    email: normalizedEmail,
    source: lead.source || existing?.source || "onboarding_step_8",
    status: existing?.status === "converted" ? "converted" : lead.status || existing?.status || "new",
    target_roles: lead.target_roles ?? existing?.target_roles ?? [],
    seniority: lead.seniority ?? existing?.seniority ?? "Mid-level",
    min_salary: lead.min_salary ?? existing?.min_salary,
    work_type: lead.work_type ?? existing?.work_type,
    work_arrangement: lead.work_arrangement ?? existing?.work_arrangement,
    frustrations: lead.frustrations ?? existing?.frustrations ?? [],
    platforms_tried: lead.platforms_tried ?? existing?.platforms_tried ?? [],
    selected_plan: lead.selected_plan ?? existing?.selected_plan,
    job_id: lead.job_id ?? existing?.job_id,
    job_title: lead.job_title ?? existing?.job_title,
    company_name: lead.company_name ?? existing?.company_name,
    ml_visitor_id: lead.ml_visitor_id ?? existing?.ml_visitor_id,
    ml_session_id: lead.ml_session_id ?? existing?.ml_session_id,
    created_at: existing?.created_at || now,
    updated_at: now,
  };

  cache.set(normalizedEmail, record);
  persistToDisk();

  // Sync to Supabase if configured
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from("candidate_leads").upsert(
          {
            email: normalizedEmail,
            source: record.source,
            status: record.status,
            target_roles: record.target_roles,
            seniority: record.seniority,
            min_salary: record.min_salary,
            work_type: record.work_type,
            work_arrangement: record.work_arrangement,
            frustrations: record.frustrations,
            platforms_tried: record.platforms_tried,
            selected_plan: record.selected_plan,
            updated_at: record.updated_at,
          },
          { onConflict: "email" }
        );
      } catch (err) {
        console.warn("[Candidate Leads Supabase Notice]:", err);
      }
    }
  }

  return record;
}

/**
 * Mark a lead as converted when they successfully purchase a plan or pass.
 */
export async function markLeadConverted(email: string): Promise<boolean> {
  if (!email) return false;
  const cache = ensureCache();
  const normalized = email.toLowerCase().trim();
  const existing = cache.get(normalized);
  if (existing) {
    existing.status = "converted";
    existing.updated_at = new Date().toISOString();
    persistToDisk();
    return true;
  }
  return false;
}

/**
 * Returns all unconverted leads for Win-Back campaigns.
 */
export function getUnconvertedLeads(): CandidateLead[] {
  const cache = ensureCache();
  return Array.from(cache.values()).filter((l) => l.status === "new" || l.status === "contacted");
}

/**
 * Get lead by email.
 */
export function getCandidateLead(email: string): CandidateLead | null {
  if (!email) return null;
  const cache = ensureCache();
  return cache.get(email.toLowerCase().trim()) || null;
}
